<template>
    <v-app>
        <v-tabs v-model="tab" background-color="primary">
            <v-tab value="devicesList">Liste</v-tab>
            <v-tab value="screens">Ecrans</v-tab>
            <v-tab value="graph">Graphe</v-tab>
            <v-tab value="log">Log</v-tab>
            <v-tab value="settings">Paramètres</v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item value="devicesList">
                <DevicesList :data="receivedData"></DevicesList>
            </v-window-item>
            <v-window-item value="screens">
                <ScreensView :data="receivedData" :receivedHistory="receivedHistory"></ScreensView>
            </v-window-item>
            <v-window-item value="graph" v-if="curNum">
                <GraphView :data="receivedData" :receivedHistory="receivedHistory"></GraphView>
            </v-window-item>
            <v-window-item value="log">
                <LogView :data="receivedData" :receivedHistory="receivedHistory" @clear="receivedHistory = []; curNum = 0"></LogView>
            </v-window-item>
            <v-window-item value="settings">
                <SettingsView :data="receivedData" :receivedHistory="receivedHistory"></SettingsView>
            </v-window-item>
        </v-window>
    </v-app>
</template>

<script>
import DevicesList  from "./components/DevicesList.vue"
import ScreensView  from "./components/ScreensView.vue"
import GraphView    from "./components/GraphView.vue"
import LogView      from "./components/LogView.vue"
import SettingsView from "./components/SettingsView.vue"

export default {
    name: "App",
    components: {
        DevicesList,
        ScreensView,
        GraphView,
        LogView,
        SettingsView
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
                this.receivedData = data
                
                if (this.receivedHistory.length > 500) this.receivedHistory.pop()
                this.curNum++
                this.receivedHistory.unshift({id: this.curNum, data: data})
            })
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