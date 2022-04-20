const BluetoothClassicSerialportClient = require("bluetooth-classic-serialport-client")
const { UM34C } = require("./um34c.cjs")

async function main() {
    const serial = new BluetoothClassicSerialportClient()

    const MAX_SCANS = 10
    let nb_scans = 0
    let opened = false
    while (nb_scans < MAX_SCANS && !opened) {
        nb_scans++

        console.log("Scanning...")
        let devices = await serial.scan()

        // console.log(devices)
        for (let device of devices) {
            console.log(device)
            if (device .name === "UM34C") {

                serial.connect(device.address)
                    .then(async () => {
                        console.log("Connected")
                        
                        let device = new UM34C(serial)
                        
                        device.on("read", (data) => {
                            console.log(data)
                        })

                        device.readEvery(1000)

                        setTimeout(async () => {
                            await device.terminate()
                        }, 5000)
                    })
                    .catch(err => console.log("Error:", err))

                opened = true
                break
            }
        }
    }

    if (nb_scans >= MAX_SCANS) console.error("Unable to find UM34C")
}

main()