const { Controller } = require("./controller.cjs")
const { Recorder } = require("./recorder.cjs")
const { Parser, transforms: { flatten } } = require("json2csv")
const site = require("./server.cjs")

let recorder = new Recorder()

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
                        controller.success("connect", { addr: data.addr })
                        device.on("read", data => {
                            controller.send("data", recorder.append(data))
                        })
                        // device.readEvery(1000)
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
                controller.device.setBrightness(data.settings.brightness)
                controller.device.setTimeout(data.settings.timeout)
            })
            .on("readOn", () => {
                controller.device.readEvery(controller.device.rate)
                recorder.new()
            })
            .on("readOff", () => {
                controller.device.readEvery(0)
            })
            .on("export", () => {
                recorder.export((data) => {
                    options = {
                        fields: [
                            "timestamp.fromStart",
                            "current",
                            "voltage"
                        ],
                        transforms: [
                            flatten()
                        ],
                    }
                    let parser = new Parser(options)
                    console.log(data)
                    // data = parser.preprocessData(data)
                    // console.log(data)
                    let csv = parser.parse(data)
                    console.log(csv)
                })
            })

        ws.on('error', function (e) { return console.log(e) })
        ws.on('close', function (e) { return console.log('websocket closed', e) })
    })

    isReady = true
    site.wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: "ready" }))
    })
}

main()