export const create = (x=0, y=0) => ({x: x, y: y})

export const equal = (vector1, vector2) => (vector1.x === vector2.x && vector1.y === vector2.y)

export const add = (vector1, vector2) => create(vector1.x + vector2.x, vector1.y + vector2.y)
export const add2 = (vector, ...vectorArray) => create(vector.x + vectorArray.reduce((prev, curr) => prev + curr.x, 0), vector.y + vectorArray.reduce((prev, curr) => prev + curr.y, 0))
export const addIp = (vector1, vector2) => {
    vector1.x += vector2.x
    vector1.y += vector2.y
    return vector1
}

export const sub = (vector1, vector2) => create(vector1.x - vector2.x, vector1.y - vector2.y)
export const sub2 = (vector, ...vectorArray) => create(vector.x - vectorArray.reduce((prev, curr) => prev + curr.x, 0), vector.y - vectorArray.reduce((prev, curr) => prev + curr.y, 0))
export const subIp = (vector1, vector2) => {
    vector1.x -= vector2.x
    vector1.y -= vector2.y
    return vector1
}

export const mul = (vector, fac) => create(vector.x * fac, vector.y * fac)
export const mulIp = (vector, fac) => {
    vector.x *= fac
    vector.y *= fac
    return vector
}

export const normalize = (vector) => mul(vector, 1 / magnitude(vector))
export const normalizeIp = (vector) => mulIp(vector, 1 / magnitude(vector))

export const angle = (vector) => Math.atan2(vector.x, vector.y)

export const magnitude = (vector) => Math.sqrt(vector.x * vector.x + vector.y * vector.y)

export const right = (vector) => create(vector.y, -vector.x)

export const left = (vector) => create(-vector.y, vector.x)

export const distance = (vector1, vector2) => Math.sqrt((vector1.x - vector2.x) * (vector1.x - vector2.x) + (vector1.y - vector2.y) * (vector1.y - vector2.y) )

export const translate = (vector, x, y) => create(vector.x + x, vector.y + y)
export const translateIp = (vector, x, y) => {
    vector.x += x
    vector.y += y
    return vector
}

export const rotatex = (x, y, c, s) => (c * x - s * y)
export const rotatey = (x, y, c, s) => (s * x + c * y)

export const rotate2 = (vector, c, s) => create(rotatex(vector.x, vector.y, c, s), rotatey(vector.x, vector.y, c, s))
export const rotate2Ip = (vector, c, s) => {
    const newX = rotatex(vector.x, vector.y, c, s)
    const newY = rotatey(vector.x, vector.y, c, s)
    vector.x = newX
    vector.y = newY
    return vector
}

export const rotate = (vector, angle) => rotate2(vector, Math.cos(angle), Math.sin(angle))
export const rotateIp = (vector, angle) => rotate2Ip(vector, Math.cos(angle), Math.sin(angle))


export const checkMatch = (vector, vectorArray) => {
    for (const otherVector of vectorArray) {
        if (equal(vector, otherVector)) {
            return true
        }
    } return false
}

export const findMatch = (vector, vectorArray) => {
    for (const otherVector of vectorArray) {
        if (equal(vector, otherVector)) {
            return otherVector
        }
    } return null
}

export const findNearest = (vector, vectorArray) => {
    let nearest = 0
    let dist1 = distance(vector, vectorArray[0])
    let dist2
    for (let i = 1; i < vectorArray.length; i++) {
        dist2 = distance(vector, vectorArray[i])
        if (dist2 < dist1) {
            nearest = i
            dist1 = dist2
        }
    } 
    return vectorArray[nearest]   
}