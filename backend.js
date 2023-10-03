const express = require('express')
const app = express() //express server

//socket.io setup
const http = require('http')
const server = http.createServer(app) //http server
const { Server } = require('socket.io') 
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 }) //socket io server wrapped around http server wrapped around express server

const port = 3000

app.use(express.static('public')) //makes files within public directory accessible to the public

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

//data related to these players; broadcast state to all players on front end
const backEndPlayers = {}

const SPEED = 10

io.on('connection', (socket) => { //socket argument (important)
  console.log('a user connected')
  backEndPlayers[socket.id] = { //socket has an id
    x:500 * Math.random(),
    y:500 * Math.random(),
    color: `hsl(${360*Math.random()}, 100%, 50%)`,
    sequenceNumber: 0
  }

  io.emit('updatePlayers', backEndPlayers) //io.emit "emits" event to the front end, socket.emit emits only yo the player who JUST connected

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id] //socket is associated with the player who caused the event
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keyCode, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber // Server reconciliation
    switch(keyCode) {
      case "ArrowDown":
        backEndPlayers[socket.id].y += SPEED
        break
      case "ArrowUp":
        backEndPlayers[socket.id].y -= SPEED
        break
      case "ArrowLeft":
        backEndPlayers[socket.id].x -= SPEED
        break
      case "ArrowRight":
        backEndPlayers[socket.id].x += SPEED
        break
    }
  })

  console.log(backEndPlayers)
})

//setInterval on back end only has 1 interval; if it were on front end there would be an interval for every player
setInterval(() => {
  io.emit('updatePlayers', backEndPlayers)
}, 1500) //updates players positions every 15 ms

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server loaded WOOHOO')

//nodemon refreshes the server when changes are made to the server
// npm install -g nodemon
//sockets update backend events for all people connected
// npm install socket.io@4.6.1 --save-exact
//socket.io documentation online
// requires an http server
//player info needs to be on server! can load data locally from index.js
//