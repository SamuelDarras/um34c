const express = require('express')
const http = require("http")
const ws = require("ws")
const path = require("path")

const app = express();

app.use('/static', express.static(__dirname + '/public'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'))
})

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new ws.Server({ server });

//start our server
server.listen(process.env.PORT || 8080, () => {
    console.log(`Server started on port ${server.address().port} :)`)
})

module.exports = {
    wss,
    server
}