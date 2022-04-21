const BluetoothClassicSerialportClient = require("bluetooth-classic-serialport-client")
const { UM34C } = require("./um34c.cjs")

function attemptConnect(serial, device) {
    if (device .name === "UM34C") {

        serial.connect(device.address)
            .then(() => {
                console.log("Connected")
                
                let device = new UM34C(serial)
                
                device.on("read", (data) => {
                    console.log(data)
                })

                device.readEvery(1000)

                setTimeout(async () => {
                    await device.terminate()
                    console.log("Terminated")
                }, 5000)
            })
            .catch(err => console.log("Error:", err))

        return true
    }

    return false
}

async function main() {
    const serial = new BluetoothClassicSerialportClient()

    const MAX_SCANS = 10
    let nb_scans = 0
    let connected = false
    while (nb_scans < MAX_SCANS && !connected) {
        nb_scans++

        console.log("Scanning...")
        let devices = await serial.scan()

        for (let device of devices) {
            console.log(device)
            connected = attemptConnect(serial, device)
            if (connected) break
        }
    }

    if (nb_scans >= MAX_SCANS) console.error("Unable to find UM34C")
}

main()