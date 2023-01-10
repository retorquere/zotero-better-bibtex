// https://www.measurethat.net/Benchmarks/Show/17971/0/lodash-clonedeep-vs-structuredclone-vs-json-parse
import { cloneDeep } from 'lodash'
// const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T
// structuredClone

export const clone = cloneDeep
