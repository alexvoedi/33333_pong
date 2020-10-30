import io from 'socket.io-client'

import Field from './Field'
import Paddle from './Paddle'
import Ball from './Ball'

let client = io('ws://192.168.0.2:3000')
let beep = new sound('beep.wav')

let field = {}
let ball = {}
let paddles = []

client.on('startGame', (payload) => {
	field = new Field(payload.field)
	ball = new Ball(payload.ball)

	paddles = []

	payload.players.forEach((player) => {
		paddles.push(new Paddle(player))
	})

	loadEvents()
	loop()
})

client.on('update', (payload) => {
	field.leftScore = payload.players[0].score
	field.rightScore = payload.players[1].score

	ball.position = payload.ball

	payload.players.forEach((player) => {
		let paddle = paddles.find((paddle) => paddle.id === player.id)
		paddle.position = player.paddle
	})
})

function loop() {
	draw()
	window.requestAnimationFrame(loop)
}

client.on('playSound', () => {
	beep.play()
})

function sound(src) {
	this.sound = document.createElement("audio")
	this.sound.src = src
	this.sound.setAttribute("preload", "auto")
	this.sound.setAttribute("controls", "none")
	this.sound.style.display = "none"
	document.body.appendChild(this.sound)
	this.play = function () {
		this.sound.play()
	}
	this.stop = function () {
		this.sound.pause()
	}
}

function draw() {
	var canvas = document.getElementById("playfield")
	var ctx = canvas.getContext("2d")

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	field.draw(canvas, ctx)
	ball.draw(canvas, ctx)
	paddles.forEach((paddle) => {
		paddle.draw(canvas, ctx)
	})
}

function loadEvents() {
	document.addEventListener('keydown', (e) => onKeyDown(e))
	document.addEventListener('keyup', (e) => onKeyUp(e))
}

function onKeyDown(e) {
	// up
	if (e.keyCode === 38) {
		client.emit('move', 'up')
	}

	// down
	if (e.keyCode === 40) {
		client.emit('move', 'down')
	}
}

function onKeyUp(e) {
	// stop movement
	if (e.keyCode === 38 || e.keyCode === 40) {
		client.emit('move', '')
	}
}
