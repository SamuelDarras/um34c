<template>
  <v-card class="ma-6">
    <v-card-title> Graphe </v-card-title>
    <v-card-text>
      <apexchart
        width="1000"
        type="line"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </v-card-text>
    <v-card-actions> </v-card-actions>
  </v-card>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "GraphView",
  components: {
    apexchart: VueApexCharts,
  },
  props: ["data", "receivedHistory"],
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
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          type: "numeric",
          title: { text: "temps (s)" },
          range: 200,
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
      series: [],
    };
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
  },
};
</script>

<style scoped>
</style>