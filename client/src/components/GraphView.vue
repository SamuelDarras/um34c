<template>
  <v-card class="ma-6">
    <v-card-title> Graphe </v-card-title>
    <v-card-text>
      <div class="d-flex">
        <ReadSwitch></ReadSwitch>
        <v-text-field v-model="rate" :rules="[!isNaN(parseInt(rate)) || 'La valeur doit être un nombre']"
          suffix="millisecondes"></v-text-field>
        <v-btn color="success" class="ml-3" @click="changeRate()">Appliquer</v-btn>
      </div>
      <div class="d-flex">
        <Chart :series="series" width="800" height="600"></Chart>
        <!-- <apexchart width="1000" type="line" :options="chartOptions" :series="series"></apexchart> -->
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
    </v-card-text>
    <v-card-actions>
      <!-- <v-btn color="success" class="ml-3" @click="exportData()">Exporter</v-btn> -->

      <v-dialog v-model="dialog">
        <template v-slot:activator="{ props }">
          <v-btn color="success" v-bind="props">
            Exporter
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="text-h5">User Profile</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  Champs à exporter :
                </v-col>
                <v-col cols="12" sm="16">
                  <!-- <v-autocomplete
                    :items="['Skiing', 'Ice hockey', 'Soccer', 'Basketball', 'Hockey', 'Reading', 'Writing', 'Coding', 'Basejump']"
                    label="Interests" multiple></v-autocomplete> -->
                  <v-combobox v-model="selectedFields" :items="possibleFields" label="Champs" multiple chips>
                  </v-combobox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="exportPath" label="Fichier"></v-text-field>
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
import ReadSwitch from "@/components/ReadSwitch.vue"
import CustomChart from "@/components/CustomChart.vue"

export default {
  name: "GraphView",
  components: {
    Chart: CustomChart,
    ReadSwitch
  },
  mounted() {
    this.wsm.controller.on("exportFile", data => {
      console.log(data)
      this.download(data, this.exportPath, "csv")
    })
  },
  props: ["data", "receivedHistory"],
  data: () => {
    return {
      rate: 1000,
      series: [],
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
      exportPath: "export.csv",

    }
  },
  methods: {
    changeRate() {
      this.wsm.controller.send("changeRate", { rate: parseInt(this.rate) })
    },
    exportData() {
      // let fields = this.exportFields.split(",").map(v => v.trim())
      this.wsm.controller.send("export", { fields: this.selectedFields, path: this.exportPath })
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
    }
  },
  watch: {
    data() {
      this.series = [
        {
          label: {
            text: "Tension",
            padding: { x: -40, y: 20 }
          },
          color: "rgb(0, 255, 0)",
          scalePos: "left",
          min: 0,
          max: 6,
          data: this.receivedHistory.map((v) => {
            return { x: v.data.timestamp.fromStart / 1000, y: v.data.voltage }
          }),
        },
        {
          label: {
            text: "Courrant",
            padding: { x: 0, y: 20 }
          },
          color: "rgb(0, 0, 255)",
          min: 0,
          max: 1,
          scalePos: "right",
          data: this.receivedHistory.map((v) => {
            return { x: v.data.timestamp.fromStart / 1000, y: v.data.current }
          }),
        },
      ]
    },
  },
}
</script>

<style scoped>
</style>