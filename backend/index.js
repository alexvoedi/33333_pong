const io = require('socket.io')()

let fieldWidth = 1000
let fieldHeight = 500

let paddleWidth = 15
let paddleHeight = 100

let ballWidth = 10
let ballHeight = 10
let ballVelocity = 0.2
let ballVelocityDefault = 0.2
let ballDirection = { x: 0.8, y: 0.2 }

let sides = [ 0 + 50, fieldWidth - 50 ]

let ball = { w: ballWidth, h: ballHeight }
let players = []

let lastUpdate = Date.now()
let paddleSpeed = 0.35

io.on('connection', (client) => {
	if (players.length < 2) {
		players.push({
			client: client,
			score: 0,
			move: '',
			paddle: {
				x: sides.pop(),
				y: fieldHeight / 2,
				w: paddleWidth,
				h: paddleHeight,
			},
		})

		console.log(`client ${client.id} connected`)

		client.on('move', (payload) => updateMovement(client.id, payload))
		client.on('disconnection', () => players.filter((player) => player.client.id === client.id))
	}

	if (players.length === 2) {
		io.emit('startGame', serialize())

		resetBall()

		setInterval(() => {
			var now = Date.now()
			var delta = now - lastUpdate
			lastUpdate = now

			loop(delta)

		}, 1000 / 100)
	}
})

function playSound() {
	io.emit('playSound')
}

function updateMovement(id, direction) {
	let player = getPlayer(id)
	player.move = direction
}

function getPlayer(id) {
	return players.find((player) => player.client.id === id)
}

function loop(delta) {
	collision()

	ball.x += ballDirection.x * ballVelocity * delta
	ball.y += ballDirection.y * ballVelocity * delta

	players.forEach((player) => {
		if (player.move) {
			if (player.move === 'up' && player.paddle.y - paddleHeight / 2 > 0) {
				player.paddle.y -= paddleSpeed * delta
			}

			if (player.move === 'down' && player.paddle.y + paddleHeight / 2 < fieldHeight) {
				player.paddle.y += paddleSpeed * delta
			}
		}
	})

	io.emit('update', serialize())
}

function serialize() {
	return {
		ball: ball,
		players: players.map((player) => ({
			id: player.client.id,
			paddle: player.paddle,
			score: player.score,
		})),
	}
}

function collision() {
	paddleCollision()
	fieldCollision()
}

function paddleCollision() {
	players.forEach((player) => {
		let { paddle } = player

		if (
			ball.x - ball.w / 2 < paddle.x + paddle.w / 2 &&
			ball.x + ball.w / 2 > paddle.x - paddle.w / 2 &&
			ball.y - ball.h / 2 < paddle.y + paddle.h / 2 &&
			ball.y + ball.h / 2 > paddle.y - paddle.h / 2
		) {
			ballDirection.x = -ballDirection.x
			ballVelocity *= 1.05
			playSound()
		}
	})
}

function fieldCollision() {
	if (
		ball.y - ball.h / 2 < 0 ||
		ball.y + ball.h / 2 > fieldHeight
	) {
		ballDirection.y = -ballDirection.y
		playSound()
	}

	if (ball.x - ball.w / 2 < 0) {
		players[1].score++
		resetBall()
	} else if (ball.x + ball.w / 2 > fieldWidth) {
		players[0].score++
		resetBall()
	}
}

function resetBall() {
	ball.x = fieldWidth / 2 - ball.w / 2
	ball.y = fieldHeight / 2 - ball.h / 2
	ballVelocity = ballVelocityDefault
}


io.listen(3000)
