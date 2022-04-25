const ws = require("ws")

const wss = new ws.Server({ port: process.env.PORT || 4000 })

console.log(`Server started on port ${wss.address().port}`)

module.exports = {
    wss
}