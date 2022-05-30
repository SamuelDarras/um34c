const fs = require("fs")
const sqlite3 = require("sqlite3")

let base_exitsts = fs.existsSync("./recordings/base.sqlite3")

const db = new sqlite3.Database('./recordings/base.sqlite3')
if (!base_exitsts) {
    db.run("CREATE TABLE records (\
        id INTEGER PRIMARY KEY,\
        date DATE DEFAULT (datetime('now','localtime')),\
        name TEXT,\
        sampleRate INTEGER,\
        time INTEGER,\
        filePath TEXT\
    )", (res, err) => {
        console.log("Data base created")
    })
}

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

        let result = how(filtered_data)

        db.run("INSERT INTO records (name, sampleRate, time, filePath) VALUES ($name, $sampleRate, $time, $filePath);", {
            $name: result.name,
            $sampleRate: 100,
            $time: 1000,
            $filePath: result.path 
        })
    }
}

module.exports = {
    Recorder
}