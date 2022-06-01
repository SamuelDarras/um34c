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
                <CustomChart @windowSet="window = $event" @windowReset="window = undefined" :plot="selectedPlot" :width="1700" :height="800" :settings="{ selectable: true, values: currentSession.length }">
                </CustomChart>
                <div>
                    <p v-if="window !== undefined">{{ consomation }}</p>
                </div>
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
            currentSession: undefined,
            graph: false,
            selectedPlot: undefined,
            window: undefined,
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
            this.sessionId = id
            this.wsm.controller.send("getSession", { id: id })
            this.wsm.controller.on("getSession", data => {
                this.currentSession = data
                this.selectedPlot = {
                    series: [
                        {
                            color: "rgb(0, 190, 20)",
                            data: data.map((v) => {
                                return { x: v.timestamp.fromStart / 1000, y: v.voltage }
                            }).reverse(),
                            span: [0, 7],
                            leftScale: {
                            label: "Tension (V)"
                            },
                        },
                        {
                            color: "rgb(0, 20, 190)",
                            data: data.map((v) => {
                                return { x: v.timestamp.fromStart / 1000, y: v.current }
                            }).reverse(),
                            span: [-.01, .05],
                            rightScale: {
                            label: "Courrant (A)"
                            },
                        }
                    ],
                }
                this.graph = true
            })
        },
        back() {
            this.graph = false
        }
    },
    computed: {
        consomation() {
            console.log(this.window)
            let res = this.currentSession
                .filter(d => d.timestamp.fromStart/1000 >= this.window[0] && d.timestamp.fromStart/1000 <= this.window[1]) // [Obj]
                .map(d => {
                    return {
                        x: d.timestamp.fromStart/1000,
                        y: parseFloat(d.current)
                    }
                }) // [(s, mA)]
                .reduce((acc, v) => {
                    let dx = acc.prev_x === undefined ? v.x-this.window[0] : v.x - acc.prev_x
                    return {
                        sum: acc.sum + dx * v.y,
                        prev_x: v.x
                    }
                }, { sum: 0, prev_x: undefined })

            return `Total mA: ${(res.sum/(this.window[1]-this.window[0])).toPrecision(4)}, Total mAs: ${(res.sum).toPrecision(4)}, Total t: ${(this.window[1]-this.window[0]).toPrecision(4)}`
        }
    }
}

</script>

<style scoped>
</style>