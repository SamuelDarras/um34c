const { EventEmitter } = require("events")
const BluetoothClassicSerialportClient = require("bluetooth-classic-serialport-client")
const { UM34C } = require("./um34c.cjs")

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
            if (this.serial.isOpen) {
                reject(new Error("A device is already connected"))
                return
            }
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
            if (!this.serial.isOpen || this.device !== null)
                this.device.terminate()
                    .then(() => {
                        this.device = null
                        resolve()
                    })
                    .catch(err => {
                        reject(err)
                    })
            else reject(new Error("No device connected"))
        })
    }

    send(type, data) {
        this.ws.send(JSON.stringify({type: type, data: data}))
    }
    sendBytes(type, data) {
        this.ws.send(JSON.stringify({type: type, data: data}), {binary: true})
    }

    success(what, data=null) {
        this.ws.send(JSON.stringify({type: "success", data: {what: what, ...data}}))
    }
    error(err, what) {
        this.ws.send(JSON.stringify({type: "error", data: {what: what, msg: err.message}}))
    }
    info(what) {
        this.ws.send(JSON.stringify({type: "info", data: {what : what}}))
    }
}

module.exports = {
    Controller
}