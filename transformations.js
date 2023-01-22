export const maxCap = (t, val) => {if (t > val) {return val} else {return t}}
export const minCap = (t, val) => {if (t < val) {return val} else {return t}}

export const pow2 = (t) => t * t // one multiplication
export const pow3 = (t) => t * t * t // two multiplications
export const pow4 = (t) => pow2(pow2(t)) // two multiplications
export const pow5 = (t) => pow2(pow2(t)) * t // three multiplications

export const easeIn2 = (t) => pow2(t)
export const easeIn3 = (t) => pow3(t)
export const easeIn4 = (t) => pow4(t)
export const easeIn5 = (t) => pow5(t)

export const easeOut2 = (t) => 1-pow2(1-t)
export const easeOut3 = (t) => 1-pow3(1-t)
export const easeOut4 = (t) => 1-pow4(1-t)
export const easeOut5 = (t) => 1-pow5(1-t)

export const easeInOut2 = (t) => 0.5 * (easeIn2(t) + easeOut2(t))
export const easeInOut3 = (t) => 0.5 * (easeIn3(t) + easeOut3(t))
export const easeInOut4 = (t) => 0.5 * (easeIn4(t) + easeOut4(t))
export const easeInOut5 = (t) => 0.5 * (easeIn5(t) + easeOut5(t))

export const mix = (a, b, m, t) => (1-m) * a(t) + (m) * b(t)

export const bezier2 = (z1, z2, p) => (z2 - z1) * p + z1
export const dBezier2 = (z1, z2) => (z2 - z1)
export const bezier3 = (z1, z2, z3, p) => ((z3 - z2 - z2 + z1) * p + z2 + z2 - z1 - z1) * p + z1 // bez2(bez2(z1, z2, p), bez2(z2, z3, p), p)
export const dBezier3 = (z1, z2, z3, p) => 2 * ((z3 - z2 - z2 + z1) * p + z2 - z1)

// bezier notes: https://docs.google.com/document/d/1S6kvIYASbaGJxjfgCmhXEuyJhIr_SMtGR5vVoSJYb1w/edit?usp=sharing