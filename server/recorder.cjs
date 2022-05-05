class Recorder {
    constructor() {
        this.data = []
        this.records = []
        this.nb = 0

        this.fields = ["timestamp.fromStart"]
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
        const flattenObj = (obj, parent, res = {}) => {
            for (const key of Object.keys(obj)) {
                const propName = parent ? parent + '.' + key : key.toString()
                if (typeof obj[key] === 'object') {
                    flattenObj(obj[key], propName, res)
                } else {
                    res[propName] = obj[key]
                }
            }
            return res
        }

        let flattened_data = this.data.map(v => flattenObj(v, undefined))

        let filtered_data = flattened_data.map(
            v => Object.fromEntries(
                    Object.entries(v).filter(
                            entry => this.fields.includes(entry[0])
                        )
                )
        )

        how(filtered_data)
    }
}

module.exports = {
    Recorder
}