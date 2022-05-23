<template>
  <v-switch v-model="state.read" label="Lire"></v-switch>
</template>

<script>
import { useState } from '@/stores/stateStore'

export default {
    name: "ReadSwitch",
    setup() {
        const state = useState()
        return {
            state
        }
    },
    watch: {
        "state.read": function(new_v) {
            if (new_v) this.wsm.controller.send("readOn", null)
            else this.wsm.controller.send("readOff", null)
        }
    } 
}
</script>

<style>

</style>