const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

var socket = io() //attempts to create connection to io server

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 10, 'white')
const players = {}

socket.on('updatePlayers', (backendPlayers) => {
  for (const id in backendPlayers) {
    const backendPlayer = backendPlayers[id]
    
    if(!players[id]) { //if player exists on the backend but not the front end
      players[id] = new Player(backendPlayer.x, backendPlayer.y, 10, 'white')
    }
  }

  console.log(players)
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in players) { //draws all the players
    const player = players[id]
    player.draw()
  }

}

animate()
