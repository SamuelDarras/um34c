<template>
  <v-card class="ma-6">
    <v-card-title> Graphe </v-card-title>
    <v-card-text>
      <div class="d-flex">
        <v-text-field v-model="rate" :rules="[!isNaN(parseInt(rate)) || 'La valeur doit être un nombre']"
          suffix="millisecondes"></v-text-field>
        <v-btn color="success" class="ml-3" @click="changeRate()">Appliquer</v-btn>
      </div>
      <div class="d-flex">
        <Chart @windowSet="window = $event" @windowReset="window = undefined" :plot="plot" :width="1200" :height="600" :settings="{ selectable: true }"></Chart>
        <v-table height="600px" class="flex-grow-1" fixed-header>
          <thead>
            <tr>
              <th>Temps (ms)</th>
              <th>Tension (V)</th>
              <th>Courrant (A)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in receivedHistory" :key="d.data.timestamp.fromStart">
              <th>{{ d.data.timestamp.fromStart }}</th>
              <th>{{ d.data.voltage }}</th>
              <th>{{ d.data.current }}</th>
            </tr>
          </tbody>
        </v-table>
      </div>
      <div>
        <p v-if="window !== undefined">{{ consomation }}</p>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-dialog v-model="dialog">
        <template v-slot:activator="{ props }">
          <v-btn color="success" v-bind="props">
            Exporter
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="text-h5">Export</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  Champs à exporter :
                </v-col>
                <v-col cols="12" sm="16">
                  <v-combobox v-model="selectedFields" :items="possibleFields" label="Champs" multiple chips>
                  </v-combobox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="d-flex">
                  <v-text-field v-model="sessionName" label="Session"></v-text-field>
                  <v-checkbox v-model="downloadSession" label="Télécharger"></v-checkbox>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" text @click="dialog = false">
              Annuler
            </v-btn>
            <v-btn color="blue-darken-1" text @click="exportData(); dialog = false">
              Valider
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-card-actions>
  </v-card>
</template>

<script>

import CustomChart from "@/components/CustomChart.vue"

export default {
  name: "GraphView",
  components: {
    Chart: CustomChart,
  },
  mounted() {
    this.wsm.controller.on("exportFile", data => {
      if (this.downloadSession) {
        console.log(data)
        this.download(data, this.sessionName, "csv")
      }
    })
  },
  props: ["receivedHistory", "count"],
  data: () => {
    return {
      rate: 1000,
      plot: {},
      selectedFields: ["timestamp.fromStart", "current", "voltage"],

      dialog: false,
      possibleFields: [
        "timestamp.millis",
        "timestamp.fromStart",
        "voltage",
        "current",
        "power",
        "temperature.celsius",
        "temperature.fahrenheit",
        "group",
        "groups.0.current",
        "groups.0.power",
        "groups.1.current",
        "groups.1.power",
        "groups.2.current",
        "groups.2.power",
        "groups.3.current",
        "groups.3.power",
        "groups.4.current",
        "groups.4.power",
        "groups.5.current",
        "groups.5.power",
        "groups.6.current",
        "groups.6.power",
        "groups.7.current",
        "groups.7.power",
        "groups.8.current",
        "groups.8.power",
        "groups.9.current",
        "groups.9.power",
        "dataline.plus",
        "dataline.minus",
        "mode.name",
        "mode.number",
        "record.current",
        "record.power",
        "record.threshold",
        "record.time",
        "connected",
        "resistence",
        "screen",
        "unkonown0"
      ],
      sessionName: "session",
      downloadSession: false,

      window: undefined
    }
  },
  methods: {
    changeRate() {
      this.wsm.controller.send("changeRate", { rate: parseInt(this.rate) })
    },
    exportData() {
      // let fields = this.exportFields.split(",").map(v => v.trim())
      this.wsm.controller.send("export", { fields: this.selectedFields, name: this.sessionName, span: this.window })
    },
    // Function to download data to a file
    download(data, filename, type) {
      var file = new Blob([data], { type: type })
      if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename)
      else { // Others
        var a = document.createElement("a"),
          url = URL.createObjectURL(file)
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(function () {
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }, 0)
      }
    },
    calcHistory() {
      this.plot = {
        series: [
          {
            color: "rgb(0, 190, 20)",
            data: this.receivedHistory.map((v) => {
              return { x: v.data.timestamp.fromStart / 1000, y: v.data.voltage }
            }),
            span: [0, 15],
            leftScale: {
              label: "Tension (V)"
            },
          },
          {
            color: "rgb(0, 20, 190)",
            data: this.receivedHistory.map((v) => {
              return { x: v.data.timestamp.fromStart / 1000, y: v.data.current }
            }),
            span: [-.005, .05],
            rightScale: {
              label: "Courrant (A)"
            },
          }
        ],
      }
    },
  },
  computed: {
    consomation() {
        console.log(this.window)
        let res = this.receivedHistory
            .filter(d => d.data.timestamp.fromStart/1000 >= this.window[0] && d.data.timestamp.fromStart/1000 <= this.window[1]) // [Obj]
            .map(d => {
                return {
                    x: d.data.timestamp.fromStart/1000,
                    y: parseFloat(d.data.current)
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
    },
    // consomation() {
    //   let res = this.receivedHistory
    //     .filter(d => d.data.timestamp.fromStart/1000 >= this.window[0] && d.data.timestamp.fromStart/1000 <= this.window[1]) // [Obj]
    //     .map(d => {
    //       return {
    //         x: d.data.timestamp.fromStart/1000,
    //         y: d.data.current
    //       }
    //     }) // [(s, mA)]
    //     .reduce((acc, v) => {
    //       let sum = acc.sum
    //       if (acc.prev_x !== undefined && acc.prev_y !== undefined) {
    //         sum += (acc.prev_x - v.x)*v.y - ((acc.prev_x-v.x) * (v.y-acc.prev_y))/2
    //       }
    //       return {
    //         sum: sum,
    //         prev_x: v.x,
    //         prev_y: v.y,
    //         time: {
    //           min: Math.min(acc.time.min, v.x),
    //           max: Math.max(acc.time.max, v.x)
    //         }
    //       }
    //     }, { sum: 0, prev_x: undefined, prev_y: undefined, time: { min: Infinity, max: 0 } })

    //   console.log(res)

    //   console.log()

    //   return (3600 * res.sum / (res.time.max-res.time.min)).toPrecision(4)
    // }
  },
  watch: {
    count() {
      this.calcHistory()
    },
    window(new_v) {
      console.log(new_v)
    }
  },
}
</script>

<style scoped>
</style>