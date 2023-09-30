const express = require('express')
const app = express() //express server

//socket.io setup
const http = require('http')
const server = http.createServer(app) //http server
const { Server } = require('socket.io') //
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 }) //socket io server wrapped around http server wrapped around express server

const port = 3000

app.use(express.static('public')) //makes files within public directory accessible to the public

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

//data related to these players; broadcast state to all players on front end
const players = {}

io.on('connection', (socket) => { //socket argument (important)
  console.log('a user connected')
  players[socket.id] = { //socket has an id
    x:100,
    y:100
  }

  io.emit('updatePlayers', players) //io.emit "emits" event to the front end, socket.emit emits only yo the player who JUST connected

  console.log(players)
})

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