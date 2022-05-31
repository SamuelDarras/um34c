<template>
    <v-card class="ma-6">
        <v-card-title>Sessions</v-card-title>
        <v-card-text>
            <a v-if="graph" href="#" @click="back()" icon style="text-decoration: none">
                <v-icon>mdi-arrow-left</v-icon>
            </a>
            <a v-if="!graph" href="#" @click="this.wsm.controller.send('listSessions')" icon style="text-decoration: none;">
                <v-icon>mdi-refresh</v-icon>
            </a>
            <div v-if="!graph">
                <v-table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Date</th>
                            <th>Durée</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="session in sessions" :key="session.id" @click="showGraph(session.id)">
                            <td>
                                {{ session.name }}
                            </td>
                            <td>
                                {{ session.date }}
                            </td>
                            <td>
                                {{ session.time.toPrecision(4) }} s.
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </div>
            <div v-else>
                <CustomChart :plot="selectedPlot" :width="1700" :height="800">
                </CustomChart>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
import CustomChart from "@/components/CustomChart.vue"

export default {
    name: "SessionView",
    components: {
        CustomChart
    },
    data: () => {
        return {
            sessions: undefined,
            graph: false,
            selectedPlot: undefined
        }
    },
    mounted() {
        this.wsm.controller.on("listSessions", data => {
            this.sessions = data
        })
        this.wsm.controller.send("listSessions")
    },
    methods: {
        showGraph(id) {
            this.wsm.controller.send("getSession", { id: id })
            this.wsm.controller.on("getSession", data => {
                this.selectedPlot = {
                    series: [
                        {
                            color: "rgb(0, 190, 20)",
                            data: data.map((v) => {
                                return { x: v.timestamp.fromStart / 1000, y: v.voltage }
                            }),
                            span: [0, 7],
                            leftScale: {
                            label: "Tension (V)"
                            },
                        },
                        {
                            color: "rgb(0, 20, 190)",
                            data: data.map((v) => {
                                return { x: v.timestamp.fromStart / 1000, y: v.current }
                            }),
                            span: [-.01, .05],
                            rightScale: {
                            label: "Courrant (A)"
                            },
                        }
                    ],
                }
           })
            this.graph = true
        },
        back() {
            this.graph = false
        }
    }
}

</script>

<style scoped>
</style>