const express = require('express')
const http = require("http")
const ws = require("ws")
const path = require("path")

const app = express();

app.use('/static', express.static(__dirname + '/html/public'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/html/index.html'))
})

const server = http.createServer(app);

const wss = new ws.Server({ server });

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server started on port ${server.address().port}`)
})

module.exports = {
    wss,
    server
}