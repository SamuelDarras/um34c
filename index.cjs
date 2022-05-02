const { Controller } = require("./controller.cjs")
const site = require("./server.cjs")

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
            controller.info("scanning")
            controller.scan()
                .then(devices => {
                    controller.success("scanning")
                    controller.emit("list", devices.filter(v => v.name == "UM34C"))
                    console.log(devices)
                })
                .catch(err => {
                    console.error(err)
                    controller.error(err, "scan")
                })
        })

        controller
            .on("connect", data => {
                controller.info("connecting")
                controller.connect(data.addr)
                    .then(device => {
                        controller.success("connect", {addr: data.addr})
                        device.on("read", data => {
                            controller.send("data", data)
                        })
                        device.readEvery(1000)
                    })
                    .catch(err => {
                        console.error(err)
                        controller.error(err, "connect")
                    })              
            })
            .on("disconnect", data => {
                controller.disconnect()
                    .then(() => {
                        controller.success("disconnect")
                        // process.exit(1)
                    })
                    .catch(err => controller.error(err, "disconnect"))
            })
            .on("changeRate", data => {
                if (controller.device !== null) {
                    controller.device.rate = data.rate
                    controller.device.readEvery(data.rate)
                    controller.success("changeRate")
                } else {
                    controller.error(new Error("No connected device"), "changeRate")
                }
            })
            .on("prevScreen", data => {
                controller.device.prev()
            })
            .on("nextScreen", data => {
                controller.device.next()
            })
            .on("changeSettings", data => {
                controller.device.readEvery(0)
                setTimeout(() => {
                    controller.device.setBrightness(data.settings.brightness)
                    controller.device.setTimeout(data.settings.timeout)
                    
                    setTimeout(() => controller.device.readEvery(controller.device.rate), 1000)
                }, 800)
            })
            .on("readOn", () => {
                controller.device.readEvery(controller.device.rate)
            })
            .on("readOff", () => {
                controller.device.readEvery(0)
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