const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

//essentially the connection to the backend
var socket = io() //attempts to create connection to io server

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]
    
    if(!frontEndPlayers[id]) { //if player exists on the backend but not the front end
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x, 
        y: backEndPlayer.y, 
        radius: 10, 
        color: backEndPlayer.color 
      })
    }
    else {
      //if a player already exists
      frontEndPlayers[id].x = backEndPlayer.x
      frontEndPlayers[id].y = backEndPlayer.y
    }
  }


  for(const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) { //draws all the players
    const frontEndPlayer = frontEndPlayers[id]
    frontEndPlayer.draw()
  }

}

animate()

const keys = {
  up: {
    pressed:false
  },
  down: {
    pressed:false
  },
  left: {
    pressed:false
  },
  right: {
    pressed:false
  }
}

const SPEED = 10
setInterval(() => {
  if(keys.down.pressed) {
    frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', 'ArrowDown')
  }

  if(keys.up.pressed) {
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', 'ArrowUp')
  }

  if(keys.left.pressed) {
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', 'ArrowLeft')
  }

  if(keys.right.pressed) {
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', 'ArrowRight')
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if(!frontEndPlayers[socket.id]) return

  switch(event.code) {
    case "ArrowDown":
      keys.down.pressed = true
      break
    case "ArrowUp":
      keys.up.pressed = true
      break
    case "ArrowLeft":
      keys.left.pressed = true
      break
    case "ArrowRight":
      keys.right.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if(!frontEndPlayers[socket.id]) return

  switch(event.code) {
    case "ArrowDown":
      keys.down.pressed = false
      break
    case "ArrowUp":
      keys.up.pressed = false
      break
    case "ArrowLeft":
      keys.left.pressed = false
      break
    case "ArrowRight":
      keys.right.pressed = false
      break
  }
})
