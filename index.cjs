const { EventEmitter } = require("events")
const BluetoothClassicSerialportClient = require("bluetooth-classic-serialport-client")
const { UM34C } = require("./um34c.cjs")

const site = require("./site/server.cjs")


class Controller extends EventEmitter {
    constructor(ws) {
        super()

        this.ws = ws
        this.ws.on("message", msg => {
            let message = JSON.parse(msg)
            console.log(message)
            this.emit(message.type, message.data)
        })

        this.serial = new BluetoothClassicSerialportClient()

        this.device = null
    }

    scan() {
        return this.serial.scan()
    }

    connect(address) {
        return new Promise((resolve, reject) => {
            this.serial.connect(address)
                .then(() => {
                    this.device = new UM34C(this.serial)
                    resolve(this.device)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.device !== null)
                this.device.terminate()
                    .then(() => {
                        this.device = null
                        resolve()
                    })
                    .catch(err => {
                        console.log(err)
                    })
            else reject(new Error("No device connected"))
        })
    }

    send(type, data) {
        this.ws.send(JSON.stringify({type: type, data: data}))
    }

    succes(what) {
        this.ws.send(JSON.stringify({type: "succes", data: {what: what}}))
    }
    error(err, what) {
        this.ws.send(JSON.stringify({type: "error", data: {what: what, msg: err.message}}))
    }
}

async function main() {
    let isReady = false

    site.wss.on('connection', ws => {
        let controller = new Controller(ws)

        if (isReady) {
            controller.send("ready", null)
        }

        controller.on("list", devices => {
            controller.send("list", devices)
        })

        controller.on("scan", data => {
            console.log("Scanning...")
            controller.scan()
                .then(devices => {
                    controller.emit("list", devices)
                    console.log(devices)
                })
                .catch(err => {
                    console.error(err)
                    controller.error(err, "scan")
                })
        })

        controller.on("connect", data => {
            controller.connect(data.addr)
                .then(device => {
                    controller.succes("connect")
                    device.on("read", (data) => {
                        console.log(data)
                        controller.send("data", data)
                    })
                    device.readEvery(1000)
                })
                .catch(err => {
                    console.error(err)
                    controller.error(err, "connect")
                })              
        })

        controller.on("disconnect", data => {
            controller.disconnect()
                .then(() => {
                    controller.succes("disconnect")
                })
                .catch(err => controller.error(err, "disconnect"))
        })

        controller.on("changeRate", data => {
            if (controller.device !== null) {
                controller.device.readEvery(data.rate)
                controller.succes("changeRate")
            } else {
                controller.error(new Error("No connected device"), "changeRate")
            }
        })

        ws.on('error',function(e){ return console.log(e)})
        ws.on('close',function(e){ return console.log('websocket closed', e)})
    })

    isReady = true
    site.wss.clients.forEach(client => {
        client.send(JSON.stringify({type: "ready"}))
    })
}

//TODO reconnect after disconnect

main()