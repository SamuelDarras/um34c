<template>
    <v-card class="ma-6">
        <v-card-title>
            Log
        </v-card-title>
        <v-card-text>
            <v-sheet :rounded="true" :elevation="4" class="ma-3 pa-3" v-for="d in receivedHistory" :key="d.id">
                <pre>
                    {{d.id}}: {{ JSON.stringify(d.data, null, 4) }}
                </pre>
            </v-sheet>
        </v-card-text>
        <v-card-actions>

        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    name: "LogView",
    props: ["data"],
    data: function() {
        return {
            receivedHistory: [],
            curNum: 0
        }
    },
    watch: {
        data: function(n) {
            if (this.receivedHistory.length > 4) this.receivedHistory.pop()
            this.curNum++
            this.receivedHistory.unshift({id: this.curNum, data: n})
        }
    }
}
</script>

<style>

</style>