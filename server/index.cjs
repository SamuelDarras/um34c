const { Parser, transforms: { flatten } } = require("json2csv")
const fs = require("fs")

const { Controller } = require("./controller.cjs")
const { Recorder } = require("./recorder.cjs")
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
                    })
                    .catch(err => {
                        console.error(err)
                        controller.error(err, "connect")
                    })
            })
            .on("disconnect", data => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                controller.disconnect()
                    .then(() => {
                        controller.success("disconnect")
                    })
                    .catch(err => { console.error(err); controller.error(err, "disconnect") })
            })
            .on("changeRate", data => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                if (controller.device !== null) {
                    controller.device.rate = data.rate
                    controller.device.readEvery(data.rate)
                    controller.success("changeRate")
                } else {
                    controller.error(new Error("No connected device"), "changeRate")
                }
            })
            .on("prevScreen", data => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                controller.device.prev()
            })
            .on("nextScreen", data => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                controller.device.next()
            })
            .on("changeSettings", data => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                controller.device.setBrightness(data.settings.brightness)
                controller.device.setTimeout(data.settings.timeout)
            })
            .on("readOn", () => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                controller.device.readEvery(controller.device.rate)
                recorder.new()
            })
            .on("readOff", () => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                controller.device.readEvery(0)
            })
            .on("export", settings => {
                recorder.fields = settings.fields ? settings.fields : ["timestamp.fromStart", "current", "voltage"]
                let path = settings.path ? settings.path : "export.csv" 
                
                recorder.export((data) => {
                    options = {
                        fields: recorder.fields,
                        transforms: [
                            flatten()
                        ],
                    }
                    let parser = new Parser(options)
                    let csv
                    if (settings.span !== undefined) {
                        csv = parser.parse(data.filter(v => v["timestamp.fromStart"]/1000 >= settings.span[0] && v["timestamp.fromStart"]/1000 <= settings.span[1]))
                    } else {
                        csv = parser.parse(data)
                    }
                    console.log(csv)

                    fs.writeFile(path, csv, err => {
                        if (err) controller.error(err, "export")
                        else controller.success("exportDone")
                    })

                    controller.send("exportFile", csv)
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