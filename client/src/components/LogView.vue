<template>
    <v-card class="ma-6">
        <v-card-title>
            Log
            <v-btn icon="mdi-trash-can" class="ml-6" size="small" color="error" @click="$emit('clear')"></v-btn>
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
    props: ["data", "receivedHistory"],
    data: function() {
        return {
            curNum: 0
        }
    },
}
</script>

<style>

</style>