<template>
  <v-card class="ma-6">
    <v-card-title> Graphe </v-card-title>
    <v-card-text>
      <div class="d-flex">
        <v-switch v-model="state.read" color="primary" label="Lire"></v-switch>
        <v-text-field
          v-model="rate"
          :rules="[!isNaN(parseInt(rate)) || 'La valeur doit être un nombre']"
          suffix="millisecondes"
        ></v-text-field>
        <v-btn color="success" @click="changeRate()">Appliquer</v-btn>
      </div>
      <div class="d-flex">
        <apexchart
          width="1000"
          type="line"
          :options="chartOptions"
          :series="series"
        ></apexchart>
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
    <v-card-actions> </v-card-actions>
  </v-card>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

import { useState } from "@/stores/stateStore";

export default {
  name: "GraphView",
  components: {
    apexchart: VueApexCharts,
  },
  props: ["data", "receivedHistory"],
  setup() {
    const state = useState();
    return {
      state,
    };
  },
  data: () => {
    return {
      chartOptions: {
        colors: ["#00ff00", "#00ffe1"],
        stroke: {
          width: 1,
        },
        chart: {
          id: "voltage-current-graph",
          animations: {
            enabled: false,
          },
        },
        xaxis: {
          type: "numeric",
          title: { text: "temps (s)" },
          range: 50,
        },
        yaxis: [
          {
            title: {
              text: "Tension (V)",
            },
          },
          {
            opposite: true,
            title: {
              text: "Courrant (A)",
            },
          },
        ],
      },
      rate: 1000,
      series: [],
    };
  },
  methods: {
    changeRate() {
      this.wsm.controller.send("changeRate", { rate: this.rate });
    },
  },
  watch: {
    data() {
      this.series = [
        {
          name: "Tension",
          data: this.receivedHistory.map((v) => {
            return { x: v.data.timestamp.fromStart / 1000, y: v.data.voltage };
          }),
        },
        {
          name: "Courrant",
          data: this.receivedHistory.map((v) => {
            return { x: v.data.timestamp.fromStart / 1000, y: v.data.current };
          }),
        },
      ];
    },
    "state.read": function(new_v) {
      if (new_v) this.wsm.controller.send("readOn", null);
      else this.wsm.controller.send("readOff", null);
    },
  },
};
</script>

<style scoped>
</style>