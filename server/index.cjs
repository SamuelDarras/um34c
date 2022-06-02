const { Parser, transforms: { flatten } } = require("json2csv")
const csvtojson = require("csvtojson")

const fs = require("fs")

const { Controller } = require("./controller.cjs")
const { Recorder } = require("./recorder.cjs")
const site = require("./server.cjs")
const { createHash } = require("crypto")

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
                    recorder.sampleRate = data.rate
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
                recorder.sampleRate = controller.device.rate
                controller.device.readEvery(controller.device.rate)
            })
            .on("readOff", () => {
                if (!controller.device?.serial?.isOpen) { controller.error(); return }
                controller.device.readEvery(0)
            })
            .on("export", settings => {
                recorder.fields = settings.fields ? settings.fields : ["timestamp.fromStart", "current", "voltage"]
                // let path = settings.path ? "./recordings/files/"+settings.path : "export.csv" 
                let hash = createHash("sha256")
                hash.update(
                    Object
                        .entries(settings)
                        .reduce((acc, c) => acc + c.toString, "")
                )
                
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

                    hash.update(Object.entries(data).reduce((acc, c) => acc+c.toString(), ""))
                    let digest = hash.digest()
                
                    let path = "./recordings/files/" + digest.toString("hex")

                    fs.writeFile(path, csv, err => {
                        if (err) controller.error(err, "export")
                        else controller.success("exportDone")
                    })

                    controller.send("exportFile", csv)

                    let time
                    if (settings.span !== undefined) {
                        time = settings.span[1] - settings.span[0]
                    } else {
                        time = Math.max(...data.map(v => v["timestamp.fromStart"]/1000)) - Math.min(...data.map(v => v["timestamp.fromStart"]/1000))
                    }
                    return { path: path, name: settings.name, time: time }
                })
            })
            .on("listSessions", () => {
                recorder.getDb().all("SELECT id, date, name, time FROM records", (err, rows) => {
                    controller.send("listSessions", rows)
                })
            })
            .on("getSession", data => {
                recorder.getDb().get("SELECT * FROM records WHERE id = $id", { $id: data.id }, (err, row) => {
                    csvtojson()
                        .fromFile(row.filePath)
                        .then(obj => {
                            controller.send("getSession", obj)
                        })
                })
            })
            .on("importSession", evt => {
                let filePath = "./recordings/files/" + evt.name
                fs.writeFile(filePath, evt.data, () => {})
                recorder.getDb().run("INSERT INTO records (name, filePath) VALUES ($name, $filePath)", {
                    $name: evt.name,
                    $filePath: filePath
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