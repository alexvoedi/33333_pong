export default class Field {
	constructor() {
		this.leftScore = 0
		this.rightScore = 0
	}

	draw(canvas, ctx) {
		ctx.beginPath()
		ctx.moveTo(500,0)
		ctx.lineTo(500, 750)
		ctx.strokeStyle = "white"
		ctx.stroke()

		ctx.font = "40px Arial"
		ctx.fillStyle = "white"
		ctx.fillText(this.leftScore, 450, 50)

		ctx.font = "40px Arial"
		ctx.fillText(this.rightScore, 530, 50)
	}
}
