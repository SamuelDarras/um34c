const BluetoothClassicSerialportClient = require("bluetooth-classic-serialport-client")
const { UM34C } = require("./um34c.cjs")

function attemptConnect(serial, dev) {
    return new Promise((resolve, reject) => {
        serial.connect(dev.address)
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

const serial = new BluetoothClassicSerialportClient()

console.log("Scanning...")
serial.scan()
    .then(devices => {
        devices.forEach(device => {
            console.log(device)
            if (device.name === "UM34C") {
                attemptConnect(serial, device)
                    .then((d) => {
                        d.on("read", console.log)

                        d.readEvery(1000)

                        setTimeout(() => {
                            d.terminate().then(() => {
                                console.log("Terminated")
                            })
                        }, 5000)
                    })
            }
        })
    })
    .catch(console.error)
