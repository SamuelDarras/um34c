<template>
    <v-app>
        <v-tabs v-model="tab" background-color="primary">
            <v-tab value="devicesList">Liste</v-tab>
            <v-tab value="graph">Graphe</v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item value="devicesList">
                <DevicesList></DevicesList>
            </v-window-item>
        </v-window>
    </v-app>
</template>

<script>
import DevicesList from "./components/DevicesList.vue"

export default {
    name: "App",
    components: {
        DevicesList
    },
    data: function () { 
        return {
            tab: null
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