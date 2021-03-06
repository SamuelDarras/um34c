import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'

loadFonts()


const app = createApp(App)
app.use(createPinia())

class Controller extends EventTarget {
    constructor(ws) {
        super()

        this.ws = ws
        this.ws.onmessage = msg => {

            let message = JSON.parse(msg.data)
            console.log("Received:", message)

            this.dispatchEvent(new CustomEvent(message.type, {detail: message.data}))
        }
    }

    on(type, listener) {
        this.addEventListener(type, evt => listener(evt.detail))
        return this
    }

    send(type, data = null) {
        console.log("Send:", type+":"+data)
        this.ws.send(JSON.stringify({type: type, data:data}))
    }
}


const ws = new WebSocket("ws://localhost:4000")
const controller = new Controller(ws)

app.config.globalProperties.wsm = {
    ws: ws,
    controller: controller,
    scan() {
        controller.send("scan")
    },
    connect(addr) {
        controller.send("connect", {addr: addr})
    },
    disconnect() {
        controller.send("disconnect")
    },
    setRate() {
        controller.send("changeRate", {rate: 1000})
    }

}

app.use(vuetify)
   .mount('#app')
