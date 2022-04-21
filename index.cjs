const BluetoothClassicSerialportClient = require("bluetooth-classic-serialport-client")
const { UM34C } = require("./um34c.cjs")
const readline = require('readline')

const site = require("./site/site.cjs")

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

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


async function main() {
    const serial = new BluetoothClassicSerialportClient()

    site.wss.on('connection', ws => {
        ws.on('message', msg => {
            message = JSON.parse(msg)
            switch (message.type) {
                case "list":
                    ws.send(JSON.stringify({
                        type: "list",
                        data: devices
                    }))
                    break;
            
                default:
                    break;
            }

            console.log(`received: ${message.type}`)
        })

        ws.on('error',function(e){ return console.log(e)})
        ws.on('close',function(e){ return console.log('websocket closed', e)})
    })

    console.log("Scanning...")
    let devices = await serial.scan()

    site.wss.clients.forEach(client => {
        client.send(JSON.stringify({type: "ready"}))
    })

    rl.on('line', line => {
        n = parseInt(line)
        if (n < 0 || n >= devices.length) {
            console.log("Not in range")
            return
        }

        dev = devices[n]
        console.log(dev)
        attemptConnect(serial, dev.address)
            .then((d) => {
                d.on("read", console.log)

                d.readEvery(1000)

                // setTimeout(() => {
                //     d.terminate().then(() => {
                //         console.log("Terminated")
                //     })
                // }, 5000)
            })
        })
}

main()