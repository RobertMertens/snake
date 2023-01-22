import { brightnessHEX, makeHEXgradient } from "./scripts/color.js"
import { bezier2, bezier3, dBezier2, dBezier3, easeOut3, easeOut5, maxCap, minCap, pow2 } from "./scripts/transformations.js"
import { randomElement, lastElement, objectFactory, randRange, loadSVG } from "./scripts/funcys.js"
import * as v from "./scripts/vector.js"

// MAIN SETTINGS

const COLOR = {
    SNAKE1: "#78E1FF",
    SNAKE2: "#b46ee8",
    BOARD1: "#2A3763",
    BOARD2: "#2E3C6B",
    FRUIT: "#FD2020",
    STAR: "#FFFFFF",
    WHITE: "#FFFFFF",
    BLACK: "#000000",
}

const TILE_SIZE = 64 // in pixels
const HORIZONTAL_TILES = 10
const VERTICAL_TILES = 10
const SNAKE_VELOCITY = 6 // in tiles per second
const SNAKE_ACCEL = 0 // in tiles per second per second
const FRUIT_COUNT = 3

// CALCULATED CONSTANTS

const EVEN_WIDTH = (HORIZONTAL_TILES % 2 === 0)
const HALF_TILE_SIZE = TILE_SIZE * 0.5
const TILE_COUNT = HORIZONTAL_TILES * VERTICAL_TILES
const CANVAS_CENTER_X = HORIZONTAL_TILES * TILE_SIZE * 0.5
const CANVAS_CENTER_Y = VERTICAL_TILES * TILE_SIZE * 0.5

// HTML ELEMENTS

const scoreText = document.getElementById("snake_score")
const bestText = document.getElementById("snake_best")
const canvas = document.getElementById("snake_canvas")
canvas.width = TILE_SIZE * HORIZONTAL_TILES
canvas.height = TILE_SIZE * VERTICAL_TILES
const context = canvas.getContext("2d")

// GENERAL CONSTANTS

const STATE = {
    ALIVE: 0,
    DEAD: 1,
    CHICKEN_DINNER: 2,
    PAUSED: 3,
}

const STATE_DARKEN_SPEED = 1 // change in alpha per second
const STATE_DARKEN = 0.6 // alpha of black top layer

const KEY = {
    R: 82,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    W: 87,
    S: 83,
    A: 65,
    D: 68
}

const KEYS = {
    UP: [KEY.UP, KEY.W], 
    DOWN: [KEY.DOWN, KEY.S],
    LEFT: [KEY.LEFT, KEY.A], 
    RIGHT: [KEY.RIGHT, KEY.D], 
    ARROWS: [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT],
    CONTROLS: [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.W, KEY.S, KEY.A, KEY.D]
}

// STAR CONSTANTS

const STAR_SPIKES = 5
const STAR_COUNT = 8
const STAR_RADIUS_MIN = 0.15 * TILE_SIZE
const STAR_RADIUS_MAX = 0.3 * TILE_SIZE
const STAR_EXPLOSION_RANGE_MIN = 0.5 * TILE_SIZE
const STAR_EXPLOSION_RANGE_MAX = 1.5 * TILE_SIZE
const STAR_EXPLOSION_DURATION_MIN = 0.7
const STAR_EXPLOSION_DURATION_MAX = 1.0

// SNAKE CONSTANTS

const START_POS = v.create(HALF_TILE_SIZE, HALF_TILE_SIZE)
const START_DIRECTION = KEY.RIGHT
const START_LENGTH = 3

const DEATH_ANIM_LEN = 0.8
const DEATH_ANIM_KNOCKBACK = 1.5 // Tiles

const SNAKE_MAX_WIDTH = (0.75 * TILE_SIZE) 
const SNAKE_MIN_WIDTH = (0.40 * TILE_SIZE)
let SNAKE_SHRINK = (SNAKE_MAX_WIDTH - SNAKE_MIN_WIDTH) / (TILE_COUNT - 1)
if (SNAKE_SHRINK > 0.5) {
    SNAKE_SHRINK = 0.5
}

COLOR.NOSTRIL = brightnessHEX(COLOR.SNAKE1, 0.5)
COLOR.SNAKE_GRADIENT = makeHEXgradient(COLOR.SNAKE1, COLOR.SNAKE2, TILE_COUNT)

// SNAKE FACE CONSTANTS

const EYE_RADIUS1 = (0.17 * TILE_SIZE)
const EYE_BORDER = (0.05 * TILE_SIZE)
const NOSTRIL_RADIUS = (0.03 * TILE_SIZE)

const EYE_SPACING = (0.25 * TILE_SIZE)
const NOSTRIL_SPACING = (0.13 * TILE_SIZE)

const PUPIL_RADIUS = (0.6 * EYE_RADIUS1)
const DEAD_EYES_RADIUS = (0.7 * EYE_RADIUS1)
const DEAD_EYES_THICKNESS = (0.35 * EYE_RADIUS1)
const HAPPY_EYES_RADIUS = (0.7 * EYE_RADIUS1)
const HAPPY_EYES_THICKNESS = (0.35 * EYE_RADIUS1)

const EYE_RADIUS2 = (EYE_RADIUS1 + EYE_BORDER)
const EYE_TO_PUPIL = (EYE_RADIUS1 - PUPIL_RADIUS)

const EXPRESSION = {
    NONE: 0,
    NORMAL: 1,
    HAPPY: 2,
    DEAD: 3,
}

// SNAKE FACE COORDINATES

const EYE0x = (-0.25 * TILE_SIZE)
const EYE0y = EYE_SPACING
const EYE1x = EYE0x
const EYE1y = -EYE0y
const EYES = [v.create(EYE0x, EYE0y), v.create(EYE1x, EYE1y)]

const NOSTRIL0x = (0.2 * TILE_SIZE)
const NOSTRIL0y = NOSTRIL_SPACING
const NOSTRIL1x = NOSTRIL0x
const NOSTRIL1y = -NOSTRIL0y
const NOSTRILS = [v.create(NOSTRIL0x, NOSTRIL0y), v.create(NOSTRIL1x, NOSTRIL1y)]

const HAPPY_EYES0x = -HAPPY_EYES_RADIUS
const HAPPY_EYES0y = 0
const HAPPY_EYES1y = 0.5 * Math.sqrt(3) * HAPPY_EYES_RADIUS
const HAPPY_EYES1x = 0.5 * HAPPY_EYES_RADIUS 
const HAPPY_EYES2y = -HAPPY_EYES1y
const HAPPY_EYES2x = HAPPY_EYES1x
const HAPPY_EYES = [v.create(HAPPY_EYES0x, HAPPY_EYES0y), v.create(HAPPY_EYES1x, HAPPY_EYES1y), v.create(HAPPY_EYES2x, HAPPY_EYES2y)]

const DEAD_EYES0x = Math.sqrt(0.5) * DEAD_EYES_RADIUS
const DEAD_EYES0y = DEAD_EYES0x
const DEAD_EYES1x = -DEAD_EYES0x
const DEAD_EYES1y = -DEAD_EYES0y
const DEAD_EYES2x = DEAD_EYES0x
const DEAD_EYES2y = -DEAD_EYES0y
const DEAD_EYES3x = -DEAD_EYES0x
const DEAD_EYES3y = DEAD_EYES0y
const DEAD_EYES = [v.create(DEAD_EYES0x, DEAD_EYES0y), v.create(DEAD_EYES1x, DEAD_EYES1y), v.create(DEAD_EYES2x, DEAD_EYES2y), v.create(DEAD_EYES3x, DEAD_EYES3y)]

// IMAGES

const FRUIT_IMG = loadSVG(
    `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
        <g>
            <path fill="#fd2018" d="m141.85866 500.00262l0 0c0 -195.91757 160.34554 -354.74014 358.14172 -354.74014l0 0c94.98508 0 186.07986 37.3743 253.24448 103.900986c67.16455 66.52669 104.89728 156.75624 104.89728 250.83916l0 0c0 195.9176 -160.34552 354.74017 -358.14175 354.74017l0 0c-197.7962 0 -358.14172 -158.82257 -358.14172 -354.74017z" fill-rule="evenodd"/>
            <path fill="#4ad310" d="m945.5617 216.40059l0 0c46.009216 62.44731 61.66162 129.01234 34.960632 148.67717l0 0c-12.822327 9.443359 -33.896362 6.5871887 -58.58618 -7.9402466c-24.68988 -14.527435 -50.97296 -39.53607 -73.06738 -69.52432l0 0c-46.009216 -62.447327 -61.66162 -129.01236 -34.960632 -148.67717l0 0c26.700989 -19.664818 85.64429 15.017242 131.65356 77.46457z" fill-rule="evenodd"/>
            <path fill="#ff7f7b" d="m269.84866 262.53806l0 0c56.2287 -50.784103 118.61975 -73.34613 139.35434 -50.393692l0 0c9.957092 11.0221405 8.779907 31.2807 -3.2726135 56.319016c-12.052551 25.03833 -33.993134 52.80539 -60.995087 77.19278l0 0c-56.2287 50.78412 -118.61975 73.34613 -139.35434 50.393707l0 0c-20.734604 -22.952423 8.039032 -82.72769 64.2677 -133.51181z" fill-rule="evenodd"/>
            <path fill="#9c594c" d="m681.9238 331.5875l0 0c-14.472473 -12.846069 -15.794189 -34.994965 -2.9521484 -49.47101l157.71533 -177.7824c6.166931 -6.9516373 14.842163 -11.167961 24.117249 -11.721443c9.275024 -0.55348206 18.390137 2.6012268 25.340027 8.770119l0 0l0 0c14.472473 12.846062 15.794189 34.99498 2.9521484 49.47101l-157.71527 177.7824c-12.842102 14.476044 -34.984863 15.797394 -49.457336 2.9513245z" fill-rule="evenodd"/>
        </g>
    </svg>`
)

// RENDER FUNCTIONS

const renderText = (text, x, y, font, color=COLOR.WHITE, textAlign="center", textBaseline="middle") => {
    context.font = font
    context.fillStyle = color
    context.textAlign = textAlign
    context.textBaseline = textBaseline
    context.fillText(text, x, y)
}

const renderCircle = (x, y, r, color, start=0, end=2*Math.PI) => {
    context.fillStyle = color
    context.beginPath()
    context.arc(x, y, r, start, end, false)
    context.fill()
}

const renderLine = (x1, y1, x2, y2, width, color) => {
    context.lineWidth = width
    context.strokeStyle = color
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}

const renderQuadraticCurve = (x1, y1, cpx, cpy, x2, y2, width, color) => {
    context.lineWidth = width
    context.strokeStyle = color
    context.beginPath()
    context.moveTo(x1, y1)
    context.quadraticCurveTo(cpx, cpy, x2, y2)
    context.stroke()
}

const renderBoard = (color1, color2) => {
    let z = true
    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        for (let x = 0; x < canvas.width; x += TILE_SIZE) {  
            if (z) {
                context.fillStyle = color1
            } else {
                context.fillStyle = color2
            }
            context.fillRect(x, y, TILE_SIZE, TILE_SIZE)
            z = !z
        }
        if (EVEN_WIDTH) z = !z
    }
}

const renderStar = (x, y, radius, rotation, color) => {
    const step = Math.PI / STAR_SPIKES
    
    context.beginPath()
    context.moveTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius)
    for (let i = 0; i < STAR_SPIKES; i++) {
        rotation += step
        context.lineTo(x + Math.cos(rotation) * radius * 0.5, y + Math.sin(rotation) * radius * 0.5)
        rotation += step
        context.lineTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius)
    }
    context.fillStyle = color
    context.fill()
} // Adjusted and improved version of: https://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5

const renderBody = (d1, d2, b, width, color) => {
    if (d1.x === d2.x || d1.y === d2.y) {
        renderLine(d1.x, d1.y, d2.x, d2.y, width, color)
    } else {
        renderQuadraticCurve(d1.x, d1.y, b.x, b.y, d2.x, d2.y, width, color)
    }
}

const renderEnd = (d1, d2, b, width, color, p, flip=false, expression=false) => {
    if (flip) {
        [d2, d1] = [d1, d2]
        p = 1 - p
    }
    
    let endx
    let endy
    let dEndx
    let dEndy
    if (d1.x === d2.x || d1.y === d2.y) {
            
        endx = bezier2(d1.x, d2.x, p)
        endy = bezier2(d1.y, d2.y, p)
        dEndx = dBezier2(d1.x, d2.x)
        dEndy = dBezier2(d1.y, d2.y)

        renderLine(d1.x, d1.y, endx, endy, width, color)
    
    } else {

        endx = bezier3(d1.x, b.x, d2.x, p)
        endy = bezier3(d1.y, b.y, d2.y, p)
        dEndx = dBezier3(d1.x, b.x, d2.x, p)
        dEndy = dBezier3(d1.y, b.y, d2.y, p)
        
        renderQuadraticCurve(d1.x, d1.y, bezier2(d1.x, b.x, p), bezier2(d1.y, b.y, p), endx, endy, width, color)
    
    }
    
    renderCircle(endx, endy, width / 2, color, Math.atan2(-dEndx, dEndy) - 0.1, Math.atan2(dEndx, -dEndy) + 0.1)
    
    if (expression) {
        renderFace(endx, endy, dEndx, dEndy, expression)
    }
}

const renderFace = (endx, endy, dEndx, dEndy, expression) => {

    const c = dEndx / Math.sqrt(dEndx * dEndx + dEndy * dEndy)
    const s = dEndy / Math.sqrt(dEndx * dEndx + dEndy * dEndy)

    const [nostril1, nostril2] = NOSTRILS.map((x) => v.translateIp(v.rotate2(x, c, s), endx, endy))

    renderCircle(nostril1.x, nostril1.y, NOSTRIL_RADIUS, COLOR.NOSTRIL)
    renderCircle(nostril2.x, nostril2.y, NOSTRIL_RADIUS, COLOR.NOSTRIL)

    const [eye1, eye2] = EYES.map((x) => v.translateIp(v.rotate2(x, c, s), endx, endy))

    renderCircle(eye1.x, eye1.y, EYE_RADIUS2, COLOR.SNAKE1)
    renderCircle(eye2.x, eye2.y, EYE_RADIUS2, COLOR.SNAKE1)
    renderCircle(eye1.x, eye1.y, EYE_RADIUS1, COLOR.WHITE)
    renderCircle(eye2.x, eye2.y, EYE_RADIUS1, COLOR.WHITE)

    if (expression === EXPRESSION.NORMAL) {

        let distx1 = Infinity
        let disty1 = Infinity
        let dist1 = Infinity

        for (const fruit of activeFruits.values()) {  
            
            const distx2 = fruit.x - endx
            const disty2 = fruit.y - endy
            const dist2 = Math.sqrt(pow2(distx2) + pow2(disty2))

            if (dist2 < dist1) {
                distx1 = distx2
                disty1 = disty2
                dist1 = dist2
            }
        }

        const xOffset = (distx1 / dist1) * EYE_TO_PUPIL
        const yOffset = (disty1 / dist1) * EYE_TO_PUPIL

        renderCircle(eye1.x + xOffset, eye1.y + yOffset, PUPIL_RADIUS, COLOR.BLACK)
        renderCircle(eye2.x + xOffset, eye2.y + yOffset, PUPIL_RADIUS, COLOR.BLACK)

    } else if (expression === EXPRESSION.HAPPY) {
        
        const [happyEye1, happyEye2, happyEye3] = HAPPY_EYES.map((x) => v.rotate2(x, c, s))

        context.lineCap = "round"
        renderLine(eye1.x + happyEye1.x, eye1.y + happyEye1.y, eye1.x + happyEye2.x, eye1.y + happyEye2.y, HAPPY_EYES_THICKNESS, COLOR.BLACK)
        renderLine(eye1.x + happyEye1.x, eye1.y + happyEye1.y, eye1.x + happyEye3.x, eye1.y + happyEye3.y, HAPPY_EYES_THICKNESS, COLOR.BLACK)
        renderLine(eye2.x + happyEye1.x, eye2.y + happyEye1.y, eye2.x + happyEye2.x, eye2.y + happyEye2.y, HAPPY_EYES_THICKNESS, COLOR.BLACK)
        renderLine(eye2.x + happyEye1.x, eye2.y + happyEye1.y, eye2.x + happyEye3.x, eye2.y + happyEye3.y, HAPPY_EYES_THICKNESS, COLOR.BLACK)
        context.lineCap = "butt"

    } else if (expression === EXPRESSION.DEAD) {

        const [dead_eye1, dead_eye2, dead_eye3, dead_eye4] = DEAD_EYES.map((x) => v.rotate2(x, c, s))

        context.lineCap = "round"
        renderLine(eye1.x + dead_eye1.x, eye1.y + dead_eye1.y, eye1.x + dead_eye2.x, eye1.y + dead_eye2.y, DEAD_EYES_THICKNESS, COLOR.BLACK)
        renderLine(eye1.x + dead_eye3.x, eye1.y + dead_eye3.y, eye1.x + dead_eye4.x, eye1.y + dead_eye4.y, DEAD_EYES_THICKNESS, COLOR.BLACK)
        renderLine(eye2.x + dead_eye1.x, eye2.y + dead_eye1.y, eye2.x + dead_eye2.x, eye2.y + dead_eye2.y, DEAD_EYES_THICKNESS, COLOR.BLACK)
        renderLine(eye2.x + dead_eye3.x, eye2.y + dead_eye3.y, eye2.x + dead_eye4.x, eye2.y + dead_eye4.y, DEAD_EYES_THICKNESS, COLOR.BLACK)
        context.lineCap = "butt"

    }
}

const renderIntroScreen = (phase) => {
    const texty = bezier2(CANVAS_CENTER_Y + canvas.height, CANVAS_CENTER_Y, phase)
    context.fillStyle = `rgba(0, 0, 0, ${phase * STATE_DARKEN})`
    context.fillRect(0, 0, canvas.width, canvas.height)
    renderText("SNAKE GAME", CANVAS_CENTER_X, texty - 25, "40px Poppins", COLOR.WHITE, "center", "middle")
    renderText("Use ARROWS or WASD to start moving!", CANVAS_CENTER_X, texty + 15, "22px Poppins", COLOR.WHITE, "center", "middle")
}

const renderWinScreen = (phase) => {
    const texty = bezier2(-CANVAS_CENTER_Y, CANVAS_CENTER_Y, phase)
    context.fillStyle = `rgba(0, 0, 0, ${phase * STATE_DARKEN})`
    context.fillRect(0, 0, canvas.width, canvas.height)
    renderText("YOU WIN!", CANVAS_CENTER_X, texty - 15, "40px Poppins", COLOR.WHITE, "center", "middle")
    renderText(`Time: ${Math.round(lastStateDuration * 100) / 100} seconds`, CANVAS_CENTER_X, texty + 15, "22px Poppins", COLOR.WHITE, "center", "middle")
    renderText(`Restart: [R]`, CANVAS_CENTER_X, texty + 60, "22px Poppins", COLOR.WHITE, "center", "middle")

}

// SNAKE (DRAW)POSITION AND DIRECTION RELATED FUNCTIONS
const drawPos = (pos, d) => {
    if (d === KEY.UP) return v.create(pos.x, pos.y + HALF_TILE_SIZE)
    if (d === KEY.DOWN) return v.create(pos.x, pos.y - HALF_TILE_SIZE)
    if (d === KEY.LEFT) return v.create(pos.x + HALF_TILE_SIZE, pos.y)
    if (d === KEY.RIGHT) return v.create(pos.x - HALF_TILE_SIZE, pos.y)
}

const nextPos = (pos, d, times=1) => {
    if (d === KEY.UP) return v.create(pos.x, pos.y - TILE_SIZE * times) 
    if (d === KEY.DOWN) return v.create(pos.x, pos.y + TILE_SIZE * times) 
    if (d === KEY.LEFT) return v.create(pos.x - TILE_SIZE * times, pos.y) 
    if (d === KEY.RIGHT) return v.create(pos.x + TILE_SIZE * times, pos.y)
}

const nextDrawPos = (pos, d) => {
    // Faster variant of drawPos(nextPos(pos, d), d)
    if (d === KEY.UP) return v.create(pos.x, pos.y - HALF_TILE_SIZE) 
    if (d === KEY.DOWN) return v.create(pos.x, pos.y + HALF_TILE_SIZE) 
    if (d === KEY.LEFT) return v.create(pos.x - HALF_TILE_SIZE, pos.y) 
    if (d === KEY.RIGHT) return v.create(pos.x + HALF_TILE_SIZE, pos.y)
}

const directionFromDrawpos = (pos, dpos) => {
    if (dpos.y === pos.y + HALF_TILE_SIZE) return KEY.UP
    if (dpos.y === pos.y - HALF_TILE_SIZE) return KEY.DOWN
    if (dpos.x === pos.x + HALF_TILE_SIZE) return KEY.LEFT
    if (dpos.x === pos.x - HALF_TILE_SIZE) return KEY.RIGHT
} 

const flipDirection = (d) => {
    if (d === KEY.UP) return KEY.DOWN
    if (d === KEY.DOWN) return KEY.UP
    if (d === KEY.LEFT) return KEY.RIGHT
    if (d === KEY.RIGHT) return KEY.LEFT
}

// CLASSES
class Snake {
    constructor() {
        this.spawn()
        this.drawTail = true
    }

    // OTHER FUNCTIONS
    spawn() {
        this.body = []
        this.bodyDraw = []
        
        for (let i = 0; i < START_LENGTH; i++) {
            this.body.push(nextPos(START_POS, START_DIRECTION, i))
            this.bodyDraw.push(drawPos(this.body[i], START_DIRECTION))
        }

        this.bodyBackup = []
        this.bodyDrawBackup = []

        this.directions = [START_DIRECTION]
        this.grow = false
        this.wait = false

        this.expression = EXPRESSION.NORMAL

        this.phase = 0.5
        this.velocity = SNAKE_VELOCITY
        this.acceleration = SNAKE_ACCEL
    }

    eat(fruit) {

        fruit.spawn()
        incrementScore()

        if (this.body.length === TILE_COUNT) {

            // WIN
            setState(STATE.CHICKEN_DINNER)
            this.expression = EXPRESSION.HAPPY

        }
    }

    die(head, direction) {
    
        if (this.wait) {
            
            this.wait = false
            this.moveForward()
        
        } else {
            
            const {x, y} = drawPos(head, direction)
            generateStars(x, y, flipDirection(direction))
    
            setState(STATE.DEAD)
            this.expression = EXPRESSION.DEAD
            this.acceleration = 0
            this.velocity = 0
            this.phase = 1

        }
    }

    // UPDATEING
    update() {

        this.velocity += dt * this.acceleration
        this.phase += dt * this.velocity

        if (state === STATE.DEAD) {
            
            // Death animation
            this.phase -= DEATH_ANIM_KNOCKBACK * (easeOut5(maxCap((stateActive) / DEATH_ANIM_LEN, 1)) - easeOut5(maxCap((stateActive - dt) / DEATH_ANIM_LEN, 1)))
            
        }

        while (this.phase > 1) this.moveForward()
        while (this.phase < 0) this.moveBackward()

    }

    moveForward() {

        // Moving head
        const direction = this.nextDirection()
        const head = nextPos(lastElement(this.body), direction)
        
        // Wall collisions
        if (head.x < 0 || head.y < 0 || head.x > canvas.width || head.y > canvas.height) {
            this.die(head, direction)
            return
        }

        // Self collisions
        if ((this.grow && v.checkMatch(head, this.body)) || (!this.grow && v.checkMatch(head, this.body.slice(1)))) {
            this.die(head, direction)
            return
        }

        // Moving the snake
        this.body.push(head)
        this.bodyDraw.push(drawPos(head, direction))
        
        if (!this.grow) {
            this.bodyBackup.push(this.body.shift())
            this.bodyDrawBackup.push(this.bodyDraw.shift())
            
            if (this.bodyBackup > Math.ceil(DEATH_ANIM_KNOCKBACK)) {
                this.bodyBackup.shift()
                this.bodyDrawBackup.shift()  
            }
        } this.grow = false

        if (this.directions.length > 1 && !this.wait) {
            this.directions.shift()
        } this.wait = false

        // Fruit collisions
        const fruit = v.findMatch(head, activeFruits)
        if (fruit instanceof Fruit) {

            this.grow = true
            this.eat(fruit)

        }

        // Changing variables n stuff
        
        this.phase -= 1
    }

    moveBackward() {

        // Updating directions
        this.directions = [directionFromDrawpos(lastElement(this.body), lastElement(this.bodyDraw))]

        if (this.bodyBackup.length > 0) {
            
            // Move snake back using saved locations
            this.body.unshift(this.bodyBackup.pop())
            this.bodyDraw.unshift(this.bodyDrawBackup.pop())
            this.body.pop()
            this.bodyDraw.pop()
        
        } else {

            // Moving tail
            const direction = directionFromDrawpos(this.body[0], this.bodyDraw[0])
            const tail = nextPos(this.body[0], flipDirection(direction))
            
            // Moving the snake
            this.body.unshift(tail)
            this.bodyDraw.unshift(drawPos(tail, direction))
            this.body.pop()
            this.bodyDraw.pop()
        }

        this.phase += 1
    }

    // EVENT HANDLING
    event(event) {

        if (this.directions.length <= 3) {
            if (KEYS.UP.includes(event.keyCode)) {
                if (KEY.DOWN !== lastElement(this.directions) && KEY.UP !== lastElement(this.directions)) {
                    this.addDirection(KEY.UP)
                }
            }
            else if (KEYS.DOWN.includes(event.keyCode)) {
                if (KEY.DOWN !== lastElement(this.directions) && KEY.UP !== lastElement(this.directions)) {
                    this.addDirection(KEY.DOWN)
                }
            }
            else if (KEYS.LEFT.includes(event.keyCode)) {
                if (KEY.LEFT !== lastElement(this.directions) && KEY.RIGHT !== lastElement(this.directions)) {
                    this.addDirection(KEY.LEFT)
                }
            }
            else if (KEYS.RIGHT.includes(event.keyCode)) {
                if (KEY.LEFT !== lastElement(this.directions) && KEY.RIGHT !== lastElement(this.directions)) {
                    this.addDirection(KEY.RIGHT)
                }
            }
        }
    }

    addDirection(d) {
        if (this.phase > 0.7 && this.directions.length === 1) {
            this.wait = true
        } this.directions.push(d)
    }

    // RENDERING
    nextDirection() {
        if (this.directions.length === 1 || this.wait) return this.directions[0]
        return this.directions[1]
    }

    render() {

        const HEAD_I = this.body.length - 1
        let i = 0
        let width = SNAKE_MAX_WIDTH - SNAKE_SHRINK * HEAD_I

        // TAIL
        if (this.grow && this.velocity > 0) {
            renderEnd(this.bodyDraw[i], this.bodyDraw[i+1], this.body[i], width, COLOR.SNAKE_GRADIENT[HEAD_I-i], 0, true)
        } else {
            renderEnd(this.bodyDraw[i], this.bodyDraw[i+1], this.body[i], width, COLOR.SNAKE_GRADIENT[HEAD_I-i], this.phase, true)
        }

        width += SNAKE_SHRINK
        i++

        // BODY
        while (i < HEAD_I) {

            renderBody(this.bodyDraw[i], this.bodyDraw[i+1], this.body[i], width, COLOR.SNAKE_GRADIENT[HEAD_I-i])

            width += SNAKE_SHRINK
            i++
        }
        
        // HEAD 
        renderEnd(this.bodyDraw[i], nextDrawPos(this.body[i], this.nextDirection()), this.body[i], width, COLOR.SNAKE_GRADIENT[HEAD_I-i], this.phase, false, this.expression)

    }
}

class Fruit {
    constructor() {
        this.spawn()
    }

    spawn() {
        this.t = 0
        
        let positions = []
        for (let y = HALF_TILE_SIZE; y < canvas.height; y += TILE_SIZE) {
            for (let x = HALF_TILE_SIZE; x < canvas.width; x += TILE_SIZE) {
                let p = v.create(x, y)
                if (!(v.checkMatch(p, activeFruits) || v.checkMatch(p, snake.body))) {
                    positions.push(p)    
                }
            }
        }
        
        if (positions.length === 0) {
            activeFruits.delete(this)
        
        } else {
            activeFruits.add(this)
            const randomPos = randomElement(positions)
            this.x = randomPos.x
            this.y = randomPos.y
        }
    }

    update() {
        this.t += dt
    }

    render() {
        const size = TILE_SIZE * (0.15 * Math.cos(this.t * Math.PI) + 1.1)
        context.drawImage(FRUIT_IMG, this.x - size * 0.5, this.y - size * 0.5, size, size)
    }
}

class Star {
    constructor(x1, y1, x2, y2, duration, radius, rotation) {
        this.spawnTime = performance.now()
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.duration = duration
        this.radius = radius
        this.rotation = rotation
    }

    render() {
        const phase = easeOut5(maxCap(((performance.now() - this.spawnTime) * 0.001) / (this.duration), 1))
        renderStar(bezier2(this.x1, this.x2, phase), bezier2(this.y1, this.y2, phase), this.radius, this.rotation, COLOR.STAR)
    }
}

const generateStars = (x, y, direction) => {
    
    let angles = []
    if (direction === KEY.UP) for (let n = 0; n < STAR_COUNT; n++) angles.push(randRange(1.25 * Math.PI, 1.75 * Math.PI))
    else if (direction === KEY.DOWN) for (let n = 0; n < STAR_COUNT; n++) angles.push(randRange(0.25 * Math.PI, 0.75 * Math.PI))
    else if (direction === KEY.LEFT) for (let n = 0; n < STAR_COUNT; n++) angles.push(randRange(0.75 * Math.PI, 1.25 * Math.PI))
    else if (direction === KEY.RIGHT) for (let n = 0; n < STAR_COUNT; n++) angles.push(randRange(1.75 * Math.PI, 2.25 * Math.PI))
    else throw "Invalid direction"

    for (const angle of angles) {
        const distance = randRange(STAR_EXPLOSION_RANGE_MIN, STAR_EXPLOSION_RANGE_MAX)
        particles.push(new Star(x, y, x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, randRange(STAR_EXPLOSION_DURATION_MIN, STAR_EXPLOSION_DURATION_MAX), randRange(STAR_RADIUS_MIN, STAR_RADIUS_MAX), randRange(0, 2 * Math.PI)))
    }
}

// MAINLOOP

const start = () => {

    const loop = () => {

        stateActive = (performance.now() - stateStart) * 0.001
        dt = (performance.now() - t) * 0.001
        t = performance.now()
            
        update()
        render()
        requestAnimationFrame(loop)
    }

    window.addEventListener("keydown", event)
    loop()

}

const update = () => {

    switch (state) {
        case (STATE.ALIVE):
            activeFruits.forEach((x) => x.update())
            snake.update()
            break
        
        case (STATE.DEAD):
            if (stateActive > 1.2) reset()
            activeFruits.forEach((x) => x.update())
            snake.update()
            break

        case (STATE.CHICKEN_DINNER):
            break

        case (STATE.PAUSED):
            activeFruits.forEach((x) => x.update())
            break
    }

}

const render = () => {

    renderBoard(COLOR.BOARD1, COLOR.BOARD2)
    activeFruits.forEach((x) => x.render())
    snake.render()
    particles.forEach((x) => x.render())

    switch (state) {
        case (STATE.ALIVE):
            if (intro) renderIntroScreen(easeOut3(minCap((STATE_DARKEN - stateActive * STATE_DARKEN_SPEED) / STATE_DARKEN, 0)))
            break

        case (STATE.DEAD):
            break
        
        case (STATE.CHICKEN_DINNER):
            renderWinScreen(easeOut3(maxCap((stateActive * STATE_DARKEN_SPEED) / STATE_DARKEN, 1))) 
            break 

        case (STATE.PAUSED):
            if (intro) renderIntroScreen(1)
            break

    }

}

const event = (event) => {
    
    if (KEYS.ARROWS.includes(event.keyCode)) event.preventDefault()
    if (event.keyCode === KEY.R) reset()

    switch (state) {
        case (STATE.ALIVE):
            snake.event(event)
            break

        case (STATE.DEAD):
            break

        case (STATE.CHICKEN_DINNER):
            break

        case (STATE.PAUSED):
            if (KEYS.CONTROLS.includes(event.keyCode)) setState(STATE.ALIVE)
            snake.event(event)
            break
    }   
}

const reset = () => {
    
    resetScore()
    particles.length = 0
    snake.spawn()
    fruits.forEach((x) => x.spawn())

    intro = false
    setState(STATE.PAUSED)

}


// GLOBAL VARIABLES

let score = 0
let best = 0

const resetScore = () => {
    score = 0
    scoreText.innerHTML = `Score: ${score}`
}

const incrementScore = () => {
    score++
    scoreText.innerHTML = `Score: ${score}`

    if (score > best) {
        best = score
        bestText.innerHTML = `Best: ${best}`
    }
}

let state = STATE.PAUSED
let lastStateDuration = 0
let stateStart = performance.now()
let stateActive = (performance.now() - stateStart) * 0.001

const setState = (newState) => {
    state = newState
    lastStateDuration = stateActive
    stateStart = performance.now()
    stateActive = 0
}

let dt = 0
let t = performance.now()

// Running the game

let intro = true

let snake = new Snake()
let particles = []
let activeFruits = new Set()
let fruits = new Set(objectFactory(Fruit, FRUIT_COUNT))

start()