const devicesListe = document.getElementById("devicesList")
var ws = new WebSocket("ws://localhost:8080")

ws.onmessage = msg => {
    message = JSON.parse(msg.data)
    console.log(message)
    switch (message.type) {
        case "list":
            for (var dev of message.data) {
                var li = document.createElement("li")
                li.appendChild(document.createTextNode(dev.name))

                devicesListe.appendChild(li)
            }
            break;
    
        case "ready":
            ws.send(JSON.stringify({type:"list"}))
            break;
        default:
            break;
    }
}