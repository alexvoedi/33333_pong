export default class Paddle {
	constructor(player) {
		this.id = player.id
		this.position = player.paddle
	}

	draw(canvas, ctx) {
		ctx.fillStyle = "white"

		let w = this.position.w
		let h = this.position.h

		let x = this.position.x - w / 2
		let y = this.position.y - h / 2

		ctx.fillRect(x, y, w, h)
	}
}
