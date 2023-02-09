import { math } from './math/math'
console.log('toto')
const e = math('1/0')
const n = e.normal
const node = n.node
console.log('e', e.string)
console.log('n', n.string)
export default math
