<template>
    <v-app>
        <v-tabs v-model="tab" background-color="primary">
            <v-tab value="devicesList">Liste</v-tab>
            <v-tab value="screens">Ecrans</v-tab>
            <v-tab value="graph">Graphe</v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item value="devicesList">
                <DevicesList :data="receivedData"></DevicesList>
            </v-window-item>
            <v-window-item value="screens">
                <ScreensView :data="receivedData"></ScreensView>
            </v-window-item>
            <v-window-item value="graph">
                <GraphView :data="receivedData"></GraphView>
            </v-window-item>
        </v-window>

        <code>
            {{ receivedData }}
        </code>

    </v-app>
</template>

<script>
import DevicesList from "./components/DevicesList.vue"
import ScreensView from "./components/ScreensView.vue"
import GraphView   from "./components/GraphView.vue"

export default {
    name: "App",
    components: {
        DevicesList,
        ScreensView,
        GraphView
    },
    data: function () { 
        return {
            tab: null,
            receivedData: {},
        }
    },
    created: function() {
        this.wsm.controller
            .on("data", data => {
                this.receivedData = data
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