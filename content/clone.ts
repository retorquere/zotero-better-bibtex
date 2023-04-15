// https://www.measurethat.net/Benchmarks/Show/17971/0/lodash-clonedeep-vs-structuredclone-vs-json-parse
// https://www.measurethat.net/Benchmarks/Show/24742/0/lodash-clonedeep-vs-structuredclone-vs-json-parse-with

// import { cloneDeep } from 'lodash'
// export const clone = cloneDeep

export const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T

// structuredClone

