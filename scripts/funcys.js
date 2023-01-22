export const randInt = (start, end, step=1) => start + Math.floor(Math.random() * (Math.ceil((end - start) / step))) * step
export const randRange = (start, end) => Math.random() * (end - start) + start

export const randomElement = (array) => array[Math.floor(Math.random() * array.length)]
export const lastElement = (array) => array[array.length-1]
export const removeElement = (element, array) => array.splice(array.indexOf(element), 1)

export function* objectFactory(cls, n) {
    for (let i = 0; i < n; i++) {
        yield new cls()
    }
}

export const loadSVG = (svg) => {
    const image = new Image()
    image.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg)
    return image
}