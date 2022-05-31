<template>
    <v-app @applySettings="console.log('ici')">
        <v-tabs v-model="tab" background-color="primary">
            <v-tab value="devicesList">Liste</v-tab>
            <v-tab value="screens">Ecrans</v-tab>
            <v-tab value="graph">Graphe</v-tab>
            <v-tab value="log">Log</v-tab>
            <v-tab value="sessions">Sessions</v-tab>
            <v-tab value="settings">Paramètres</v-tab>

            <ReadSwitch></ReadSwitch>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item value="devicesList">
                <DevicesList :data="receivedData"></DevicesList>
            </v-window-item>
            <v-window-item v-if="state.received" value="screens">
                <ScreensView  :data="receivedData.data" :receivedHistory="receivedHistory"></ScreensView>
            </v-window-item>
            <v-window-item v-if="state.received" value="graph">
                <GraphView :receivedHistory="receivedHistory"></GraphView>
            </v-window-item>
            <v-window-item v-if="state.received" value="log">
                <LogView :data="receivedData" :receivedHistory="receivedHistory" @clear="receivedHistory = []; curNum = 0"></LogView>
            </v-window-item>
            <v-window-item value="sessions">
                <SessionView></SessionView>
            </v-window-item>
            <v-window-item v-if="state.received" value="settings">
                <SettingsView :data="receivedData.data" :receivedHistory="receivedHistory"></SettingsView>
            </v-window-item>
        </v-window>
    </v-app>
</template>

<script>
import DevicesList  from "@/components/DevicesList.vue"
import ScreensView  from "@/components/ScreensView.vue"
import GraphView    from "@/components/GraphView.vue"
import LogView      from "@/components/LogView.vue"
import SettingsView from "@/components/SettingsView.vue"
import ReadSwitch   from "@/components/ReadSwitch.vue";
import SessionView  from "@/components/SessionsView.vue";

import { useState } from "@/stores/stateStore";

export default {
    name: "App",
    components: {
        DevicesList,
        ScreensView,
        GraphView,
        LogView,
        SettingsView,
        ReadSwitch,
        SessionView
    },
    setup() {
        const state = useState()
        return {
            state
        }
    },
    data: function () { 
        return {
            tab: null,
            receivedData: {},
            receivedHistory: [],
            curNum: 0
        }
    },
    created: function() {
        this.wsm.controller
            .on("data", data => {
                if (!this.state.received) this.state.received = true
                this.receivedData = data
                
                if (this.receivedHistory.length > 500) this.receivedHistory.pop()
                this.curNum++
                this.receivedHistory.unshift(this.receivedData)
            })
    },
    watch: {
        "state.settings": function() {
            this.wsm.controller.send("changeSettings", {settings: this.state.settings})
        }
    }
}
</script>

<style scoped>
.v-progress-circular {
    margin: 1rem;
}

.v-btn {
    height: revert;
}
</style>