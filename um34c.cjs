const { Buffer } = require("buffer")
const { EventEmitter } = require("events")

class UM34C extends EventEmitter {
    constructor(serial) {
        super()
        this.timeFromStart = 0
        this.serial = serial
        this._readSoFar = Buffer.alloc(130)
        this._dataLength = 0
        this._interval = null
        
        this.data = {}
        this.startTime = new Date().getTime()

        this.serial.on('data', (data) => {
            data.copy(this._readSoFar, this._dataLength)
            this._dataLength += data.length
            if (this._dataLength >= 130)
                this.convert(this._readSoFar)
        })
    }

    convert(buffer) {
        this._dataLength = 0
        
        var hex = buffer.toString("hex") 

        const modes = {
            0: "Unknown",
            1: "QC2.0",
            2: "QC3.0",
            3: "APP2.4A",
            4: "APP2.1A",
            5: "APP1.0A",
            6: "APP0.5A",
            7: "DCP1.5A",
            8: "SAMSUNG"
        }

        var now = new Date().getTime()

        var data = {
            timestamp  : { 
                millis: now,
                fromStart: now-this.startTime,
            },
            // Voltage in "V"
            voltage    : parseInt("0x" + hex[4]  + hex[5]  + hex[6]  + hex[7])  / 100,
            // Current in "A"
            current    : parseInt("0x" + hex[8]  + hex[9]  + hex[10] + hex[11]) / 1000,
            // Power in "W"
            power      : parseInt("0x" + hex[12] + hex[13] + hex[14] + hex[15] + hex[16] + hex[17] + hex[18] + hex[19]) / 1000,
            // Temperature
            temperature: {
                celsius   : parseInt("0x" + hex[20] + hex[21] + hex[22] + hex[23]),
                fahrenheit: parseInt("0x" + hex[24] + hex[25] + hex[26] + hex[27])
            },
            // Selected group
            group      : parseInt("0x" + hex[28] + hex[29] + hex[30] + hex[31]),
            // Data of all groups, will be filled later, in "mAh" and "mWh"
            groups     : [],
            // USB data line voltage in "V"
            dataline   : {
                plus : parseInt("0x" + hex[192] + hex[193] + hex[194] + hex[195]) / 100,
                minus: parseInt("0x" + hex[196] + hex[197] + hex[198] + hex[199]) / 100
            },
            // Charging mode, name is set if known
            mode       : {
                name  : modes[parseInt("0x" + hex[200] + hex[201] + hex[202] + hex[203])],
                number: parseInt("0x" + hex[200] + hex[201] + hex[202] + hex[203]),
            },
            // Record page
            record     : {
                // Current in "mAh"
                current  : parseInt("0x" + hex[204] + hex[205] + hex[206] + hex[207] + hex[208] + hex[209] + hex[210] + hex[211]),
                // Power in "mWh"
                power    : parseInt("0x" + hex[212] + hex[213] + hex[214] + hex[215] + hex[216] + hex[217] + hex[218] + hex[219]),
                // Threshold to record data in "A"
                threshold: parseInt("0x" + hex[220] + hex[221] + hex[222] + hex[223]) / 100,
                // Recorded time in seconds
                time     : parseInt("0x" + hex[224] + hex[225] + hex[226] + hex[227] + hex[228] + hex[229] + hex[230] + hex[231])
            },
            // Seems to be 1 if a device is connected
            connected  : Boolean(parseInt("0x" + hex[232] + hex[233] + hex[234] + hex[235])),
            settings   : {
                // Screen timeout in minutes
                timeout   : parseInt("0x" + hex[236] + hex[237] + hex[238] + hex[239]),
                // Brightness from 0 to 5
                brightness: parseInt("0x" + hex[240] + hex[241] + hex[242] + hex[243])
            },
            // Resistence in "Ohm"
            resistence : parseInt("0x" + hex[244] + hex[245] + hex[246] + hex[247] + hex[248] + hex[249] + hex[250] + hex[251]) / 10,
            // Currently selected screen
            screen     : parseInt("0x" + hex[252] + hex[253] + hex[254] + hex[255]),
            // No idea what what this value could be, is higher when a load is present
            unknown0   : parseInt("0x" + hex[256] + hex[257] + hex[258] + hex[259])
        }

        // Fill groups with data
        for(var g=0; g<10; g++) {
            data.groups[g] = {
                // Current in "mAh"
                current: parseInt("0x" + hex[32+16*g] + hex[33+16*g] + hex[34+16*g] + hex[35+16*g] + hex[36+16*g] + hex[37+16*g] + hex[38+16*g] + hex[39+16*g]),
                // Power in "mWh"
                power  : parseInt("0x" + hex[40+16*g] + hex[41+16*g] + hex[42+16*g] + hex[43+16*g] + hex[44+16*g] + hex[45+16*g] + hex[46+16*g] + hex[47+16*g])
            }
        }

        this.data = data
        this.emit("read", this.data)
    }

    async next() {
        await this.serial.write(Buffer.from("f1", "hex"))
    }
    async prev() {
        await this.serial.write(Buffer.from("f3", "hex"))
    }
    async setGroup(group) {
        if (group > 9) group = 9
        if (group < 0) group = 0
        
        await this.serial.write(Buffer.from("a"+group, "hex"))
    }
    async setBrightness(brightness) {
        if (brightness > 5) brightness = 5
        if (brightness < 0) brightness = 0
        
        await this.serial.write(Buffer.from("d"+brightness, "hex"))
    }
    async setTimeout(time) {
        if (time > 5) time = 5
        if (time < 0) time = 0
        
        await this.serial.write(Buffer.from("e"+time, "hex"))
    }

    async readData() {
        await this.serial.write(Buffer.from("f0", "hex"))
    }

    readEvery(millis) {
        if (this._interval !== null) clearInterval(this._interval)
        this._interval = setInterval(async () => {
            await this.readData()
        }, millis)
    }

    async terminate() {
        if (this._interval !== null) clearInterval(this._interval)
        return this.serial.close()
    }
}

module.exports = {
    UM34C
}