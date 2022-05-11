<template>
    <canvas ref="graphCanvas" :width="width" :height="height"></canvas>
</template>

<script>

export default {
    name: "CustomChart",
    props: ["series", "width", "height"],
    mounted() {
        console.log(this.series)

        this.canvasCtx = this.$refs["graphCanvas"].getContext("2d")
        console.log(this.canvasCtx)

        this.canvasCtx.fillStyle = "rgb(255, 0, 0, 0.5)"

    },
    data() {
        return {
            ctx: undefined,
            padding: 50,
            pontsRadius: 2,
            span: {
                values: 50,
                from: 0
            }
        }
    },
    watch: {
        series(new_v) {
            this.canvasCtx.clearRect(0, 0, this.width, this.height)
                
            for (let serie of new_v) {
                let Xs = serie.data.map(p => p.x).slice(this.span.from, this.span.from + this.span.values)
                let minX = Math.min(...Xs)
                let maxX = Math.max(...Xs)

                let Ys = serie.data.map(p => p.y).filter((_, idx) => idx < this.span.from + this.span.values)
                // let minY = Math.min(...Ys)
                // let maxY = Math.max(...Ys)
                let minY = serie.min
                let maxY = serie.max

                // minY -= (maxY-minY) * .1
                // maxY += (maxY-minY) * .1
                

                let scaled_points = Xs.map(
                    (v, idx) => {
                        return {
                            x: this.scale(v, minX, maxX, this.padding, this.width - this.padding),
                            y: this.height - this.scale(Ys[idx], minY, maxY, this.padding, this.height - this.padding)
                        }
                })

                let x_from = 0
                let y_from = 0
                let x_to   = 0
                let y_to   = 0
                switch (serie.scalePos) {
                    case "left":
                        x_from = this.padding
                        y_from = this.height - this.padding
                        x_to   = this.padding
                        y_to   = this.padding
                        break
                    case "right":
                        x_from = this.width - this.padding
                        y_from = this.height - this.padding
                        x_to   = this.width - this.padding
                        y_to   = this.padding
                        break
                    case "bottom":
                        x_from = this.height - this.padding
                        y_from = this.height - this.padding
                        x_to   = this.width - this.padding
                        y_to   = this.height - this.padding
                        break
                    case "top":
                        x_from = this.padding
                        y_from = this.padding
                        x_to   = this.width - this.padding
                        y_to   = this.padding
                        break
                }

                this.drawScale({
                        from: {
                            x: x_from,
                            y: y_from
                        },
                        to: {
                            x: x_to,
                            y: y_to
                        },
                        min: minY,
                        max: maxY,
                        color: serie.color,
                        precision: 3,
                        label: serie.label
                    }, 10)

                this.drawScale({
                        from: {
                            x: this.padding,
                            y: this.height - this.padding
                        },
                        to: {
                            x: this.width - this.padding,
                            y: this.height - this.padding
                        },
                        min: minX,
                        max: maxX,
                        color: "rgb(0, 0, 0)",
                        padding: {
                            x: 0, y: 10
                        },
                        precision: 0,
                        label: {
                            text: "Temps (s.)",
                            padding: { x: this.width/2, y: 20 }
                        }
                    }, 10)

                this.canvasCtx.strokeStyle = serie.color
                this.canvasCtx.fillStyle = serie.color
                this.canvasCtx.beginPath()
                this.canvasCtx.moveTo(scaled_points[0].x, scaled_points[0].y)
                for (let point of scaled_points) {
                    this.canvasCtx.lineTo(point.x, point.y)
                }
                this.canvasCtx.stroke()
                this.canvasCtx.closePath()

                this.canvasCtx.moveTo(scaled_points[0].x, scaled_points[0].y)
                for (let point of scaled_points) {
                    this.canvasCtx.beginPath()
                    this.canvasCtx.arc(point.x, point.y, this.pontsRadius, 0, Math.PI*2)
                    this.canvasCtx.fill()
                }

            }
        }
    },
    methods: {
        scale(v, min, max, to_min, to_max) {
            return (v-min)/(max-min) * (to_max-to_min) + to_min
        },
        drawScale(settings, steps) {
            console.log(settings)
            settings = {
                from: {x: 0, y: 0}, to: {x: 0, y: 0},
                min: 0, max: 1,
                padding: {x: 5, y: 0},
                color: "rgb(0, 0, 0)", precision: 5,
                label: {
                    text: "serie",
                    padding: {
                        x: 5, y: 0
                    }
                },
                ...settings
            }


            this.canvasCtx.save()

            this.canvasCtx.beginPath()

            this.canvasCtx.strokeStyle = "rgb(0, 0, 0)"
            this.canvasCtx.fillStyle = settings.color
            this.canvasCtx.font = "10px sans-serif"
            this.canvasCtx.moveTo(settings.from.x, settings.from.y)
            this.canvasCtx.lineTo(settings.to.x, settings.to.y)

            for (let i = 0; i <= steps; i += 1) {
                this.canvasCtx.fillText(
                    (settings.min + i*(settings.max-settings.min)/steps).toFixed(settings.precision),
                    settings.padding.x + settings.from.x + i*(settings.to.x-settings.from.x)/steps,
                    settings.padding.y + settings.from.y + i*(settings.to.y-settings.from.y)/steps
                )
            }
            this.canvasCtx.fillText(settings.label.text, settings.from.x + settings.label.padding.x, settings.from.y + settings.label.padding.y)

            this.canvasCtx.stroke()
            this.canvasCtx.fill()

            this.canvasCtx.closePath()

            this.canvasCtx.restore()
        }
    }
}

</script>

<style scoped>

</style>
