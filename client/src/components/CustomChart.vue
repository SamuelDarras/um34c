<template>
    <canvas ref="graphCanvas" :width="width" :height="height" @mousedown="mouseStart" @mousemove="mouseMove" @mouseup="mouseEnd"></canvas>
    <v-btn v-if="settings.zoomable" icon="mdi-home" @click="resetScale" color="success"></v-btn>
</template>

<script>

export default {
    name: "CustomChart",
    emits: ["windowSet", "windowReset"],
    props: {
        plot: Object,
        width: Number,
        height: Number,
        settings: {
            type: Object,
            default: () => {
                return {
                    selectable: false,
                    zoomable: false,
                    values: 300
                }
            }
        }
    },
    // props: ["plot", "width", "height"],
    mounted() {
        this.canvas = this.$refs["graphCanvas"]
        this.canvasCtx = this.canvas.getContext("2d")

        this.canvasCtx.fillStyle = "rgb(255, 0, 0, 0.5)"

        this.padding    = Math.max(this.width, this.height) * 0.05
        this.drawWidth  = this.width  - this.padding*2
        this.drawHeight = this.height - this.padding*2

        this.calcSeries(this.plot)
        console.log(this.settings, this.series)
    },

    data() {
        return {
            scaleX:  1,
            offsetX: 0,
            scaleY:  1,
            offsetY: 0,
            values: 300,

            scalesSteps: 20,

            mouseClicked: false,
            mouseStartPos: undefined,
            mouseEndPos: undefined,
            rawPlot: undefined
        }
    },

    watch: {
        plot(new_v) {
            this.calcSeries(new_v)
        }
    },
    methods: {
        calcSeries(plot) {
            this.series = JSON.parse(JSON.stringify(plot)).series

            this.series.forEach(serie => {
                serie.span = [
                    Math.min(serie.span[0], Math.min(...serie.data.map(p => p.y))),
                    Math.max(serie.span[1], Math.max(...serie.data.map(p => p.y))),
                ]
                serie.data = serie.data.filter((_, idx) => idx < this.settings.values)

                let minx = Math.min(...serie.data.map(p => p.x))
                let maxx = Math.max(...serie.data.map(p => p.x))

                serie.data = serie.data.map(point => {
                    return {
                        x: this.mapX(point.x, minx, maxx),
                        y: this.mapY(point.y, serie.span[0], serie.span[1])
                    }
                })

                serie.data = serie.data.filter(p => p.x >= this.padding && p.y <= this.width-this.padding)
                
                minx = this.plot.series[0].data[serie.data.length-1].x
                maxx = this.plot.series[0].data[0].x
                this.tMin = minx
                this.tMax = maxx
            })



            this.updateCanvas()

        },
        mapX(v, min, max) {
            return ((this.drawWidth) * (v-min) / (max-min)) * this.scaleX + this.offsetX + this.padding
        },
        mapY(v, min, max) {
            return (this.height - (this.drawHeight) * (v-min) / (max-min)) * this.scaleY + this.offsetY - this.padding
        },

        updateCanvas() {
            this.canvasCtx.fillStyle = "rgb(235, 235, 235)"
            this.canvasCtx.fillRect(0, 0, this.width, this.height)
            
            this.drawGrid()

            for (let serie of this.series) {
                this.canvasCtx.strokeStyle = serie.color
                this.canvasCtx.fillStyle = serie.color
                this.canvasCtx.beginPath()
                for (let point of serie.data) {
                    if (point.x < this.padding || point.x > this.width-this.padding) continue
                    let x = point.x
                    let y = point.y
                    this.canvasCtx.lineTo(x, y)
                }
                this.canvasCtx.stroke()
                this.canvasCtx.closePath()
                
                for (let point of serie.data) {
                    if (point.x < this.padding || point.x > this.width-this.padding) continue

                    this.canvasCtx.beginPath()
                    let x = point.x
                    let y = point.y
                    this.canvasCtx.arc(x, y, 2, 0, Math.PI*2)
                    this.canvasCtx.fill()
                }
                
                if (serie.leftScale !== undefined) {
                    this.drawScale(this.padding, this.height-this.padding, this.padding, this.padding, serie.span, serie.leftScale, -40, 4)
                }
                if (serie.rightScale !== undefined) {
                    this.drawScale(this.width-this.padding, this.height-this.padding, this.width-this.padding, this.padding, serie.span, serie.rightScale, 10, 4)
                }
            }

            this.canvasCtx.fillStyle = "#000000"
            this.drawScale(this.padding, this.height-this.padding, this.width-this.padding, this.height-this.padding, [this.tMin, this.tMax], {label: "Temps (s.)", offY: 30}, -5, 20)

            if (this.mouseEndPos !== undefined && this.mouseEndPos.x != this.mouseStartPos.x)
                this.drawSelect()
        },

        drawScale(x1, y1, x2, y2, span, info, valuesOffsetX, valuesOffsetY) {
            info = { label: "label", offX: -20, offY: -20, ...info }

            let angle = Math.atan((y2-y1)/(x2-x1))

            this.canvasCtx.strokeStyle = "#000000"
            this.canvasCtx.beginPath()
            this.canvasCtx.moveTo(x1, y1)
            this.canvasCtx.lineTo(x2, y2)

            for (let i = 0; i <= this.scalesSteps; i++) {
                let x = (x2-x1) * i/this.scalesSteps + x1
                let y = (y2-y1) * i/this.scalesSteps + y1
                this.drawDash(x, y, angle, 6)
                let text = ((span[1]-span[0]) * i/this.scalesSteps + span[0]).toPrecision(4)
                this.canvasCtx.fillText(text, x+valuesOffsetX, y+valuesOffsetY)
            }

            this.canvasCtx.stroke()
            this.canvasCtx.closePath()

            this.canvasCtx.fillText(info.label, x2 + info.offX, y2 + info.offY)
        },
        drawDash(x, y, angle, length) {
            angle -= Math.PI/2

            let x1 = x - Math.cos(angle)*length/2
            let y1 = y - Math.sin(angle)*length/2
            let x2 = x + Math.cos(angle)*length/2
            let y2 = y + Math.sin(angle)*length/2

            this.canvasCtx.moveTo(x1, y1)
            this.canvasCtx.lineTo(x2, y2)
        },
        drawGrid() {
            this.canvasCtx.save()

            this.canvasCtx.beginPath() 
            this.canvasCtx.strokeStyle = "rgb(255, 255, 255)"
            for (let i = 0; i <= this.scalesSteps; i++) {
                this.canvasCtx.moveTo(
                    this.padding,
                    this.drawHeight * i/this.scalesSteps + this.padding
                )
                this.canvasCtx.lineTo(
                    this.drawWidth + this.padding,
                    this.drawHeight * i/this.scalesSteps + this.padding
                )

                this.canvasCtx.moveTo(
                    this.drawWidth * i/this.scalesSteps + this.padding,
                    this.drawHeight + this.padding
                )
                this.canvasCtx.lineTo(
                    this.drawWidth * i/this.scalesSteps + this.padding,
                    this.padding
                )
            }
            this.canvasCtx.stroke()
            this.canvasCtx.closePath()

            this.canvasCtx.restore()
        },
        drawSelect() {
            if (!this.settings.selectable) return
            if (this.mouseStartPos === undefined ||this.mouseEndPos === undefined) return

            this.canvasCtx.fillStyle = "rgb(0, 30, 180, .1)"
            this.canvasCtx.fillRect(this.mouseStartPos.x, this.padding, this.mouseEndPos.x - this.mouseStartPos.x, this.drawHeight)
            this.canvasCtx.strokeStyle = "rgb(0, 30, 180)"
            
            this.canvasCtx.beginPath()
            this.canvasCtx.moveTo(this.mouseStartPos.x, this.padding)
            this.canvasCtx.lineTo(this.mouseStartPos.x, this.drawHeight + this.padding)
            this.canvasCtx.moveTo(this.mouseEndPos.x, this.padding)
            this.canvasCtx.lineTo(this.mouseEndPos.x, this.drawHeight + this.padding)
            this.canvasCtx.stroke()
            this.canvasCtx.closePath()
        },

        clamp(v, min, max) {
            if (v >= max) return max
            if (v <= min) return min
            return v
        },

        mouseStart(e) {
            if (!this.settings.selectable) return
            var rect = this.canvas.getBoundingClientRect()
            let posx = e.clientX - rect.left
            let posy = e.clientY - rect.top

            this.mouseStartPos = { x: posx, y: posy }
            this.mouseEndPos = { x: posx, y: posy }

            this.mouseClicked = true
        },
        mouseMove(e) {
            if (!this.settings.selectable) return
            if (this.mouseClicked) {
                var rect = this.canvas.getBoundingClientRect()
                let posx = e.clientX - rect.left
                let posy = e.clientY - rect.top

                this.mouseEndPos = { x: this.clamp(posx, this.padding, this.width-this.padding), y: posy }
            }
            this.updateCanvas()
        },
        mouseEnd() {
            if (!this.settings.selectable) return
            this.mouseClicked = false

            // this.scaleX *= (this.drawWidth)/(Math.abs(this.mouseEndPos.x-this.mouseStartPos.x))
            // this.offsetX -= this.mouseEndPos.x*this.scaleX - this.padding

            this.calcSeries(this.plot)
            this.updateCanvas()

            if (this.mouseEndPos.x == this.mouseStartPos.x) {
                this.mouseStartPos = undefined
                this.mouseEndPos = undefined
                this.$emit("windowReset")
            } else {
                let v1 = (this.tMax-this.tMin) * (this.mouseStartPos.x-this.padding)/this.drawWidth + this.tMin
                let v2 = (this.tMax-this.tMin) * (this.mouseEndPos.x-this.padding)/this.drawWidth + this.tMin
                this.$emit("windowSet", [
                    Math.min(v1, v2),
                    Math.max(v1, v2),
                ])
            }
        },
        resetScale() {
            if (!this.settings.selectable) return
            this.scaleX = 1
            this.scaleY = 1
            this.offsetX = 0
            this.offsetY = 0

            this.calcSeries(this.plot)
            this.updateCanvas()
        }
    }
}

</script>

<style scoped>

</style>
