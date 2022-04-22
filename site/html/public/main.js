var ws = new WebSocket("ws://localhost:8080")

const devicesList  = document.getElementById("devicesList")
const receivedView = document.getElementById("received")
const rateInput    = document.getElementById("rateInput")

class Controller extends EventTarget {
    constructor(ws) {
        super()

        this.ws = ws
        this.ws.onmessage = msg => {
            let message = JSON.parse(msg.data)
            receivedView.innerHTML = JSON.stringify(message, null, 4)
            console.log(message)
            this.dispatchEvent(new CustomEvent(message.type, {detail: message.data}))
        }
    }
}

function scan() {
    ws.send(JSON.stringify({type: "scan"}))
}
function connect(addr) {
    ws.send(JSON.stringify({type:"connect", data: {addr}}))
}
function disconnect() {
    ws.send(JSON.stringify({type:"disconnect"}))
}
function setRate() {
    value = parseFloat(rateInput.value)
    ws.send(JSON.stringify({type: "changeRate", data: {rate: value*1000}}))
}

function createList(list, elements, map) {
    let s = ""
    for (var e of elements) {
        list.innerHTML = ""
        var li = document.createElement("li")
        s += map(e)
    }
    list.innerHTML = s
}

let controller = new Controller(ws)

controller.addEventListener("list", evt => {
    createList(devicesList, evt.detail, e => {
        let s = `\
        <li>
            ${e.name}
            <button onclick="connect('${e.address}')">Connecter</button>
        </li>\
        `

        return s
    })
})

controller.addEventListener("ready", evt => {
    ws.send(JSON.stringify({type:"scan"}))
})

controller.addEventListener("data", evt => {
    // TODO
})