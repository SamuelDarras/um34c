<template>
  <v-card class="ma-6">
    <v-card-title>
        Appareils
        <v-progress-circular
            v-if="state.scanning"
            style="margin-left: 1rem"
            :width="3"
            :size="20"
            indeterminate
        ></v-progress-circular>
    </v-card-title>
    <v-card-text class="pa-6">
        <v-table>
            <thead>
            <tr>
                <th>Appareil</th>
                <th>Action</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="device in devices" :key="device.address">
                <th>
                {{ device.name }}
                </th>
                <th>
                <v-btn
                    v-if="device.address != connectedAddr"
                    icon="mdi-bluetooth"
                    size="x-small"
                    @click="wsm.connect(device.address)"
                    color="primary"
                >
                </v-btn>
                <v-btn
                    v-else
                    icon="mdi-bluetooth-connect"
                    size="x-small"
                    color="success"
                >
                </v-btn>
                </th>
            </tr>
            </tbody>
        </v-table>
    </v-card-text>
    <v-card-actions>
        <v-btn color="primary" @click="wsm.scan()">Scanner</v-btn>
        <v-btn color="primary" @click="wsm.disconnect()">Deconnecter</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { useState } from "@/stores/stateStore";

export default {
    name: "DevicesList",
    props: ["data"],
    data() {
        return {
            devices: [],
            connectedAddr: "",
        }
    },
    setup() {
        const state = useState()
        return {
            state
        }
    },
    created() {
        this.wsm.controller
            .on("ready", () => {
                this.wsm.scan()
            })
            .on("list", (data) => {
                this.devices = data
            })
            .on("info", (data) => {
                switch (data.what) {
                case "scanning":
                    this.state.scanning = true
                    break

                default:
                    break
                }
                console.log(this.state)
                })
            .on("success", (data) => {
                switch (data.what) {
                case "scanning":
                    this.state.scanning = false
                    break
                case "connect":
                    this.connectedAddr = data.addr
                    break

                default:
                    break
                }
            })
    },
}
</script>

<style>
</style>