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
      if(id === socket.id) {
        //if a player already exists
        frontEndPlayers[id].x = backEndPlayer.x
        frontEndPlayers[id].y = backEndPlayer.y

        //server reconsoliation
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if(lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy 
        })
      } else {
        //for all other players

        // Player Interpolation (smoothes other players movement in case of lag)
        gsap.to(frontEndPlayers[id], {
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.015, //15ms
          ease: 'linear'
        })
      }
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
const playerInputs = []
let sequenceNumber = 0
// Client side prediction - make it feel smoother for each player by updating the front end before the server has a chance to update and refresh
// Server reconciliation fixes lag (too many updates on FE, BE can't keep up and you move backwards)
// Player Interpolation (smoothes other players movement in case of lag)

setInterval(() => {
  if(keys.down.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    frontEndPlayers[socket.id].y += SPEED //Client side prediction
    socket.emit('keydown', {keyCode:'ArrowDown', sequenceNumber})
  }

  if(keys.up.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    frontEndPlayers[socket.id].y -= SPEED //Client side prediction
    socket.emit('keydown', {keyCode:'ArrowUp', sequenceNumber})
  }

  if(keys.left.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    frontEndPlayers[socket.id].x -= SPEED //Client side prediction
    socket.emit('keydown', {keyCode:'ArrowLeft', sequenceNumber})
  }

  if(keys.right.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    frontEndPlayers[socket.id].x += SPEED //Client side prediction
    socket.emit('keydown', {keyCode:'ArrowRight', sequenceNumber})
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
