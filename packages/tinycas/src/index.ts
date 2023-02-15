import { math } from './math/math'
import type { EvalArg } from './math/types'
console.log('toto')
const e = math('1/0')
const n = e.normal
const node = n.node
console.log('e', e.string)
console.log('n', n.string)

export type { EvalArg }
export default math
