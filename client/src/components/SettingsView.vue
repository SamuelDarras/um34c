<template>
  <v-card class="ma-6">
    <v-card-title> Paramètres </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="settings.timeout"
        :rules="[rules.number]"
        suffix="minutes"
        label="Pause"
      />
      <v-text-field
        v-model="settings.brightness"
        :rules="[rules.number]"
        label="Luminosité"
      />

      <v-btn color="success" @click="applySettings"> Appliquer </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import { useState } from "@/stores/stateStore";

export default {
  name: "SettingsView",
  props: ["data"],
  setup() {
    const state = useState();
    return {
      state,
    };
  },
  data: () => {
    return {
      settings: {
        timeout: undefined,
        brightness: undefined,
      },
      rules: {
        number: (value) =>
          !isNaN(parseInt(value)) || "La valeur doit être un nombre",
      },
    };
  },
  mounted() {
    this.settings = this.data.settings;
  },
  methods: {
    applySettings() {
      this.settings.timeout = parseInt(this.settings.timeout);
      this.settings.brightness = parseInt(this.settings.brightness);
      this.state.settings = { ...this.settings };
    },
  },
};
</script>

<style>
</style>