// assuming 8-bits for Red Green and Blue and no alpha channel 

export const hexToInt = (hex) => parseInt(hex, 16)
export const intToHex = (int) => {
    if (int >= 255.5) return "ff"
    if (int < 0.5) return "00"
    return Math.round(int).toString(16).padStart(2, "0")
}

export const hexToRGB = (hex) => [hexToInt(hex.substring(1,3)), hexToInt(hex.substring(3,5)), hexToInt(hex.substring(5,7))]
export const RBGToHex = (rgb) => `#${intToHex(rgb[0])}${intToHex(rgb[1])}${intToHex(rgb[2])}`

export const blend = (a, b, p) => a + (b - a) * p

export const blendRGB = (rgb1, rgb2, p) => [blend(rgb1[0], rgb2[0], p), blend(rgb1[1], rgb2[1], p), blend(rgb1[2], rgb2[2], p)]
export const subRGB = (rgb1, rgb2) => [rgb1[0] - rgb2[0], rgb1[1] - rgb2[1], rgb1[2] - rgb2[2]]
export const addRGB = (rgb1, rgb2) => [rgb1[0] + rgb2[0], rgb1[1] + rgb2[1], rgb1[2] + rgb2[2]]
export const brightnessRGB = (rgb, i) => [rgb[0] * i, rgb[1] * i, rgb[2] * i]
export const makeRGBgradient = (rgb1, rgb2, size) => {
    const gradient = []
    for (let i = 0; i < size; i++) {
        gradient.push(blendRGB(rgb1, rgb2, i/(size-1)))
    } return gradient
}

export const blendHEX = (hex1, hex2, p) => RBGToHex(blendRGB(hexToRGB(hex1), hexToRGB(hex2), p))
export const subHEX = (hex1, hex2) => RBGToHex(subRGB(hexToRGB(hex1), hexToRGB(hex2)))
export const addHEX = (hex1, hex2) => RBGToHex(addRGB(hexToRGB(hex1), hexToRGB(hex2)))
export const brightnessHEX = (hex, i) => RBGToHex(brightnessRGB(hexToRGB(hex), i))
export const makeHEXgradient = (hex1, hex2, size) => makeRGBgradient(hexToRGB(hex1), hexToRGB(hex2), size).map((x) => RBGToHex(x))