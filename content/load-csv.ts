import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS

import csv from 'papaparse'
import { log } from './logger'

async function read(path: string): Promise<string> {
  try {
    return (await $OS.File.exists(path)) ? (await $OS.File.read(path, { encoding: 'utf-8' }) as unknown as string) : ''
  }
  catch (err) {
    log.error('csv.read', path, 'error:', err)
    return ''
  }
}

function string2dict(path: string, data: string): Record<string, any>[] {
  if (!data) return []

  const parsed: any = csv.parse(data, { skipEmptyLines: 'greedy', header: true })
  if (parsed.errors.length) log.error('parsing', path, parsed.errors)
  return parsed.data as Record<string, any>[]
}

function string2list(path: string, data: string): string[][] {
  if (!data) return []

  const parsed: any = csv.parse(data, { skipEmptyLines: 'greedy' }) as string[][]
  if (parsed.errors.length) log.error('parsing', path, parsed.errors)
  return parsed.data as string[][]
}

export async function list(path: string): Promise<string[][]> {
  return string2list(path, await read(path))
}

export async function dict(path: string): Promise<Record<string, any>[]> {
  return string2dict(path, await read(path))
}

export function listsync(path: string): string[][] {
  return string2list(path, Zotero.BetterBibTeX.getContents(path))
}

export function dictsync(path: string): Record<string, any>[] {
  return string2dict(path, Zotero.BetterBibTeX.getContents(path))
}
