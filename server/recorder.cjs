class Recorder {
    constructor() {
        this.data = []
        this.records = []
        this.nb = 0
    }

    append(n_data) {
        this.data.push(n_data)
        this.nb++
        return {
            id: this.nb,
            data: n_data
        }
    }

    new() {
        this.records.push(this.data)
        this.data = []
        this.nb = 0
    }

    export(how) {
        how(this.data)
    }
}

module.exports = {
    Recorder
}