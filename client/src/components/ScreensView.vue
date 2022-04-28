<template>
    <v-card class="ma-6">
        <v-card-title>Ecran {{ data.screen }}</v-card-title>
    
        <v-card-text>
            <v-container v-if="data.screen == 0">
                <v-row>
                    <v-col>{{ data.voltage }} V</v-col>
                    <v-col>{{ data.temperature.celsius }}°C</v-col>
                </v-row>
                <v-row>
                    <v-col>{{ data.current }} A</v-col>
                    <v-col>Groupe: {{ data.group }}</v-col>
                </v-row>
                <v-row>
                    <v-col>{{ data.groups[data.group].current }} mAh</v-col>
                    <v-col>{{ data.resistence }} Ω</v-col>
                </v-row>
                <v-row>
                    <v-col>{{ data.groups[data.group].power }} mWh</v-col>
                    <v-col>{{ data.power }} W</v-col>
                </v-row>
            </v-container>
        
            <v-container v-else-if="data.screen == 1">
                <v-row>
                    <v-col>{{ data.voltage }} V</v-col>
                    <v-col>{{ data.temperature.celsius }}°C</v-col>
                </v-row>
                <v-row>
                    <v-col>{{ data.current }} A</v-col>
                    <v-col>Groupe: {{ data.group }}</v-col>
                </v-row>
                <v-row>
                    <v-col>+ {{ data.dataline.plus }} V</v-col>
                    <v-col>Mode</v-col>
                </v-row>
                <v-row>
                    <v-col>- {{ data.dataline.minus }} V</v-col>
                    <v-col>{{ data.mode.name }}</v-col>
                </v-row>
            </v-container>

            <v-container v-else-if="data.screen == 2">
                <v-row>
                    <v-col>{{ data.record.current }} mAh</v-col>
                </v-row>
                <v-row>
                    <v-col>{{ data.record.power }} mWh</v-col>
                </v-row>
                <v-row>
                    <v-col>Temps: {{ data.record.time }}</v-col>
                </v-row>
                <v-row>
                    <v-col>Seuil: {{ data.record.threshold }} V</v-col>
                </v-row>
            </v-container>

            <v-container v-else-if="data.screen == 3">
                <v-row>
                    <v-col>{{ data.record.current }} mAh</v-col>
                </v-row>
                <v-row>
                    <v-col>{{ data.record.power }} mWh</v-col>
                </v-row>
                <v-row>
                    <v-col>Temps: {{ data.record.time }}</v-col>
                </v-row>
                <v-row>
                    <v-col>Seuil: {{ data.record.threshold }} V</v-col>
                </v-row>
            </v-container>

            <v-container v-else-if="data.screen == 4">
                <GraphView :data="data" :receivedHistory="receivedHistory"></GraphView>
            </v-container>

            <v-container v-else-if="data.screen == 5">
                <SettingsView :data="data"></SettingsView>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" class="ma-6" @click="wsm.controller.send('prevScreen')">Précédent</v-btn>
            <v-btn color="primary" class="ma-6" @click="wsm.controller.send('nextScreen')">Suivant</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import GraphView    from "@/components/GraphView.vue"
import SettingsView from "@/components/SettingsView.vue"

export default {
    name: "ScreensView",
    props: ["data", "receivedHistory"],
    components: {
        GraphView,
        SettingsView
    }
}
</script>

<style scoped>

</style>