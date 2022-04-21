const { EventEmitter } = require("events")
const BluetoothClassicSerialportClient = require("bluetooth-classic-serialport-client")
const { UM34C } = require("./um34c.cjs")

const site = require("./site/server.cjs")

function attemptConnect(serial, address) {
    return new Promise((resolve, reject) => {
        serial.connect(address)
            .then(() => {
                console.log("Connected")
                resolve(new UM34C(serial))
            })
            .catch(err => {
                console.log("Error:", err)
                reject(err)
            })
    })
}

class Controller extends EventEmitter {
    constructor(ws) {
        super()

        this.ws = ws
        this.ws.on("message", msg => {
            let message = JSON.parse(msg)
            console.log(message)
            this.emit(message.type, message.data)
        })
    }

    succes() {
        this.ws.send(JSON.stringify({type: "succes", data: null}))
    }
    error(err) {
        this.ws.send(JSON.stringify({type: "error", err: err.message}))
    }
}

async function main() {
    const serial = new BluetoothClassicSerialportClient()
    let isReady = false

    let devices = []
    let connectedDevice = null

    site.wss.on('connection', ws => {
        if (isReady) {
            ws.send(JSON.stringify({type: "ready"}))
        }

        let controller = new Controller(ws)

        controller.on("list", data => {
            ws.send(JSON.stringify({
                type: "list",
                data: devices
            }))
        })

        controller.on("scan", data => {
            console.log("Scanning...")
            serial.scan().then(devs => {
                devices = devs
                controller.emit("list", {})
                console.log(devices)
            }).catch(() => {})
        })

        controller.on("connect", data => {
                    attemptConnect(serial, data.addr)
                        .then((d) => {
                            controller.succes()

                            connectedDevice = d
                            d.on("read", (data) => {
                                console.log(data)
                                ws.send(JSON.stringify({type: "data", data}))
                            })
                            d.readEvery(1000)
                        })
                        .catch(console.error)
                    
        })

        controller.on("disconnect", data => {
            connectedDevice.terminate().then(() => {
                controller.succes()
            })
        })

        controller.on("changeRate", data => {
            connectedDevice.readEvery(data.rate)
            controller.succes()
        })

        ws.on('error',function(e){ return console.log(e)})
        ws.on('close',function(e){ return console.log('websocket closed', e)})
    })

    isReady = true
    site.wss.clients.forEach(client => {
        client.send(JSON.stringify({type: "ready"}))
    })
}

main()