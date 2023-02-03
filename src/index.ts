import { math } from './math/math'

const e = math('sqrt(x^2)')
console.log('e', e.string)
const n = e.normal
console.log('n', n.string)
