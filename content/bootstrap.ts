/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

declare const Cc: any
declare const Ci: any
declare const dump: (msg: string) => void

import { alert } from './prompt'

import { jwk as pubkey } from './public'
import { DebugLogSender } from 'zotero-plugin/debug-log'

const BOOTSTRAP_REASONS = {
  1: 'APP_STARTUP',
  2: 'APP_SHUTDOWN',
  3: 'ADDON_ENABLE',
  4: 'ADDON_DISABLE',
  5: 'ADDON_INSTALL',
  6: 'ADDON_UNINSTALL',
  7: 'ADDON_UPGRADE',
  8: 'ADDON_DOWNGRADE',
} as const
type ReasonId = keyof typeof BOOTSTRAP_REASONS
export type Reason = typeof BOOTSTRAP_REASONS[ReasonId]

function log(msg) {
  msg = `{better-bibtex} bootstrap: ${msg}`
  if (Zotero?.debug) {
    Zotero.debug(`Better BibTeX bootstrap: ${msg}`) // eslint-disable-line no-restricted-syntax
  }
  else {
    dump(`${msg}\n`) // eslint-disable-line no-restricted-syntax
  }
}

export function install(_data: any, _reason: ReasonId) {
  log('install, nothing to do')
}

export function onMainWindowLoad({ window }) {
  log('onMainWindowLoad')
  Zotero.BetterBibTeX.onMainWindowLoad({ window })
}

export function onMainWindowUnload({ window }) {
  log('onMainWindowUnload')
  Zotero.BetterBibTeX.onMainWindowUnload({ window })
}

let chromeHandle: any = null
let sandbox: any = null
const BBT: { profiler?: AllocationProfiler | null } = ((Zotero as any).BBT = {})

function makeSandbox(wantGlobalProperties: string[] = []): any {
  const Sandbox = Components.utils.Sandbox as unknown as new(principal: any, options?: any) => any
  return new Sandbox(Components.utils.getObjectPrincipal(globalThis), {
    freshZone: true,
    freshCompartment: true,
    wantGlobalProperties,
  })
}

export async function startup({ resourceURI, rootURI = resourceURI.spec }: { resourceURI: any; rootURI?: string }, reason: ReasonId) {
  const prefix = 'translators.better-bibtex.'
  const pluginID = 'better-bibtex@iris-advies.com'
  const sender = new DebugLogSender(pluginID, 'Fallback Better BibTeX debug log (if regular fails)', [prefix, `${prefix}$autoExport.`], pubkey)
  sender.enabled = true

  if (Zotero.BetterBibTeX) throw new Error('Better BibTeX is already started')

  // if (!Zotero.Debug.storing && Zotero.Prefs.get('translators.better-bibtex.forceLogging')) Zotero.Debug.setStore(true)
  Zotero.Debug.setStore(true)

  sandbox = makeSandbox([
    'atob',
    'btoa',
    'ChromeUtils',
    'DOMParser',
    'FormData',
    'structuredClone',
    'TextDecoder',
    'TextEncoder',
    'XMLHttpRequest',
    'URL',
    'URLSearchParams',
    'fetch',
  ])

  try {
    log('startup started')

    const aomStartup = Cc['@mozilla.org/addons/addon-manager-startup;1'].getService(Ci.amIAddonManagerStartup)
    const manifestURI = Services.io.newURI(`${rootURI}manifest.json`)
    log(manifestURI.spec)
    chromeHandle = aomStartup.registerChrome(manifestURI, [
      ['content', 'zotero-better-bibtex', 'content/'],
      ['locale', 'zotero-better-bibtex', 'en-US', 'locale/en-US/'],
      ['locale', 'zotero-better-bibtex', 'fr-FR', 'locale/fr-FR/'],
      ['locale', 'zotero-better-bibtex', 'pt-BR', 'locale/pt-BR/'],
      ['locale', 'zotero-better-bibtex', 'zh-CN', 'locale/zh-CN/'],
      ['locale', 'zotero-better-bibtex', 'it-IT', 'locale/it-IT/'],
    ])

    const { FileUtils } = ChromeUtils.importESModule('resource://gre/modules/FileUtils.sys.mjs')
    // Waive Xrays on the sandbox global before assigning properties across compartment boundaries
    Object.assign(Components.utils.waiveXrays(sandbox), {
      Zotero,
      ChromeWorker,
      rootURI,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Localization,
      FileUtils,
      PathUtils,
      IOUtils,
    })

    Services.scriptloader.loadSubScriptWithOptions(`${rootURI}content/better-bibtex.js`, {
      charset: 'utf-8',
      target: sandbox,
    })

    // @ts-expect-error TS2339
    await Zotero.BetterBibTeX.startup(BOOTSTRAP_REASONS[reason])
    log('startup done')

    if (Zotero.Prefs.get('translators.better-bibtex.memoryDebugger')) {
      BBT.profiler = new AllocationProfiler
    }
    else {
      BBT.profiler = null
    }
    sender.enabled = false
  }
  catch (err) {
    alert({ title: 'Better BibTeX startup failed', text: `${err}\n${(err as any).stack}` })
    log(`${err}\n${(err as any).stack}`)
  }
}

export async function shutdown(data: any, reason: ReasonId) {
  try {
    log('shutdown started')

    if (typeof chromeHandle !== 'undefined' && chromeHandle) {
      chromeHandle.destruct()
      chromeHandle = undefined
    }

    if (Zotero.BetterBibTeX) {
      log('shutdown started')
      await Zotero.BetterBibTeX.shutdown(BOOTSTRAP_REASONS[reason])
      log('shutdown completed')
      delete (Zotero as any).BetterBibTeX
      log('BBT deleted')
    }

    // Clear sandbox references to allow GC reaping
    if (sandbox) Components.utils.nukeSandbox(sandbox)
    sandbox = null

    log('bootstrap: shutdown: done')
    BBT.profiler = null
  }
  catch (err) {
    alert({ title: 'Better BibTeX shutdown failed', text: `${err}` })
    log(`${err}\n${(err as any).stack}`)
  }
}

export function uninstall(_data: any, _reason: ReasonId) {
  log('uninstall, nothing to do')
}

interface AllocationStackSummary {
  stack: string
  count: number
  totalBytes: number
  totalMB: number
}

export class AllocationProfiler {
  private sandbox: any | null = null
  private dbg: any | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private stackMap: Map<string, { count: number; bytes: number }> = new Map
  private drainFn: (() => any[]) | null = null
  private drainedEntries = 0
  private drainedWithFrames = 0
  private drainedWithoutFrames = 0
  private unknownDrainShapeLogged = false
  public isRecording = false

  constructor() {
    const { addDebuggerToGlobal } = ChromeUtils.importESModule('resource://gre/modules/jsdebugger.sys.mjs')

    // 1. Correct camelCase for scriptSecurityManager
    const principal = Services.scriptSecurityManager.getSystemPrincipal()

    // 2. Call Sandbox directly as a function (Cu.Sandbox or Components.utils.Sandbox)
    const Sandbox = Components.utils.Sandbox as unknown as (principal: any, options?: any) => any
    this.sandbox = Sandbox(principal, {
      freshZone: true,
      wantGlobalProperties: ['ChromeUtils'],
    })

    addDebuggerToGlobal(this.sandbox)
    this.dbg = new this.sandbox.Debugger

    this.dbg.allowUnobservedAsmJS = false
    this.dbg.uncaughtExceptionHook = (e: any) => log(`[Profiler Error] ${e}`)
  }

  /**
   * Start recording allocations in the global `sandbox`.
   */
  public start(pollMs = 50, sampleProbability = 1.0, maxLogLength = 50000): void {
    if (this.isRecording) return

    if (!this.dbg || !this.dbg.memory) {
      throw new Error('[Profiler FATAL] Debugger instance or Debugger.Memory is not initialized.')
    }

    if (typeof sandbox === 'undefined' || !sandbox) {
      throw new Error('[Profiler FATAL] Global `sandbox` reference is undefined or null.')
    }

    // 1. Gather potential allocation sources across compartments
    const debuggeeCandidates = [
      sandbox,
      Components.utils.waiveXrays(sandbox),
      globalThis,
      Components.utils.waiveXrays(globalThis),
      Zotero,
    ].filter(Boolean)

    // 2. Remove existing debuggees to avoid state corruption
    for (const d of this.dbg.getDebuggees()) {
      try {
        this.dbg.removeDebuggee(d)
      }
      catch {}
    }

    // 3. Attach debuggees FIRST
    let attached = 0

    // Prefer broad capture for leak diagnosis: attach every global when supported.
    if (typeof this.dbg.addAllGlobalsAsDebuggees === 'function') {
      try {
        this.dbg.addAllGlobalsAsDebuggees()
        attached = this.dbg.getDebuggees().length
      }
      catch {
        // Continue with explicit candidates below.
      }
    }

    for (const target of debuggeeCandidates) {
      try {
        this.dbg.addDebuggee(target)
        attached += 1
      }
      catch {
        // Not every candidate can be attached as debuggee in all runtimes.
      }
    }

    const debuggees = this.dbg.getDebuggees()
    if (debuggees.length === 0 || attached === 0) {
      throw new Error('[Profiler FATAL] addDebuggee succeeded but getDebuggees() returned 0 targets.')
    }

    // 4. Configure memory tracking AFTER debuggee is attached
    const mem = this.dbg.memory
    mem.maxAllocationsLogLength = maxLogLength
    mem.allocationSamplingProbability = sampleProbability

    // Enabling trackingAllocationSites invalidates JIT fast-paths for attached debuggees
    mem.trackingAllocationSites = true

    // 5. Resolve native log extraction method
    const logMethod = mem.drainAllocationsLog || mem.drainAllocationLog || mem.takeAllocationLog

    if (typeof logMethod !== 'function') {
      mem.trackingAllocationSites = false
      const availableKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(mem)).join(', ')
      throw new Error(`[Profiler FATAL] No valid allocation log method found on dbg.memory. Available: [${availableKeys}]`)
    }

    this.drainFn = logMethod.bind(mem)
    this.isRecording = true
    this.stackMap.clear()
    this.drainedEntries = 0
    this.drainedWithFrames = 0
    this.drainedWithoutFrames = 0
    this.unknownDrainShapeLogged = false

    // 6. Start polling interval
    this.intervalId = setInterval(() => this.drain(), pollMs)
    log(`[Profiler] Recording started on target sandbox (${debuggees.length} debuggee attached, ${sampleProbability * 100}% sampling).`)
  }

  private normalizeEntry(entry: any): { stack: string; bytes: number; hasFrame: boolean } {
    const bytes = Number(entry?.bytes ?? entry?.size ?? entry?.byteSize ?? 0) || 0
    let frame = entry?.frame ?? entry?.allocationSite ?? entry?.site ?? null

    if (!frame) {
      const cls = entry?.class || entry?.constructor || entry?.type || 'unknown'
      return {
        stack: `(no-frame) ${cls}`,
        bytes,
        hasFrame: false,
      }
    }

    let stackStr = ''
    while (frame) {
      const fnName: string = frame.functionDisplayName || frame.displayName || frame.name || '(anonymous)'
      const source: string = frame.source || frame.sourceUrl || frame.filename || '(unknown source)'
      const line: number = frame.line ?? frame.lineNumber ?? 0
      const column: number = frame.column ?? frame.columnNumber ?? 0
      stackStr += `${fnName}@${source}:${line}:${column}\n`
      frame = frame.parent || frame.older || null
    }

    return {
      stack: stackStr || '(empty-frame-chain)',
      bytes,
      hasFrame: true,
    }
  }

  private extractEntries(raw: any): any[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (typeof raw[Symbol.iterator] === 'function') return Array.from(raw)

    // Older SpiderMonkey shapes can return an object with allocations + frames tables.
    if (Array.isArray(raw.allocations)) {
      if (!Array.isArray(raw.frames)) return raw.allocations as any[]

      const frames = raw.frames
      const resolveFrame = (idx: number): any => {
        let frame = frames[idx]
        if (!frame) return null

        // Normalize likely frame-table encodings into the structure normalizeEntry expects.
        frame = {
          functionDisplayName: frame.functionDisplayName || frame.displayName || frame.name,
          source: frame.source || frame.sourceUrl || frame.filename,
          line: frame.line ?? frame.lineNumber,
          column: frame.column ?? frame.columnNumber,
          parent: typeof frame.parent === 'number' ? resolveFrame(frame.parent) : null,
        }
        return frame
      }

      const allocations: unknown[] = raw.allocations as unknown[]
      return allocations.map((alloc: unknown) => {
        if (typeof alloc === 'number') {
          return { frame: resolveFrame(alloc), bytes: 0, class: 'unknown' }
        }

        if (Array.isArray(alloc) && alloc.length) {
          const frameIdx = typeof alloc[0] === 'number' ? alloc[0] : -1
          return {
            frame: frameIdx >= 0 ? resolveFrame(frameIdx) : null,
            bytes: alloc[1],
            class: alloc[2],
          }
        }

        if (alloc && typeof alloc === 'object') {
          const entry = alloc as { frame?: unknown; bytes?: unknown; class?: unknown; size?: unknown; type?: unknown }
          return {
            frame: typeof entry.frame === 'number' ? resolveFrame(entry.frame) : entry.frame,
            bytes: entry.bytes ?? entry.size ?? 0,
            class: entry.class ?? entry.type ?? 'unknown',
          }
        }

        return { frame: null, bytes: 0, class: 'unknown' }
      })
    }

    if (Array.isArray(raw.log)) return raw.log as any[]
    if (Array.isArray(raw.data)) return raw.data as any[]

    if (!this.unknownDrainShapeLogged) {
      this.unknownDrainShapeLogged = true
      const keys = Object.keys(raw).join(', ')
      log(`[Profiler WARNING] Unknown allocation log shape (${Object.prototype.toString.call(raw)}). Keys: [${keys}]`)
    }
    return []
  }

  /**
   * Drain SpiderMonkey's allocation buffer into aggregate stack map.
   */
  private drain(): void {
    if (!this.drainFn || !this.dbg) {
      throw new Error('[Profiler FATAL] Drain called without an active session.')
    }

    if (this.dbg.memory.allocationsLogOverflowed) {
      log('[Profiler WARNING] Allocation log overflowed! Consider lowering pollMs or increasing maxAllocationsLogLength.')
    }

    const logged = this.extractEntries(this.drainFn())
    if (logged.length === 0) return

    this.drainedEntries += logged.length

    for (const entry of logged) {
      const normalized = this.normalizeEntry(entry)
      if (normalized.hasFrame) this.drainedWithFrames += 1
      else this.drainedWithoutFrames += 1

      const existing = this.stackMap.get(normalized.stack) || { count: 0, bytes: 0 }
      this.stackMap.set(normalized.stack, {
        count: existing.count + 1,
        bytes: existing.bytes + normalized.bytes,
      })
    }
  }

  /**
   * Stop recording allocations and return sorted callstacks.
   */
  public stop(topN = 15): AllocationStackSummary[] {
    if (!this.isRecording) {
      return [{
        stack: '[sentinel] profiler.stop called while not recording',
        count: 0,
        totalBytes: 0,
        totalMB: 0,
      }]
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // Flush any remaining allocations in the buffer
    this.drain()

    if (this.dbg) {
      this.dbg.memory.trackingAllocationSites = false

      for (const global of this.dbg.getDebuggees()) {
        try {
          this.dbg.removeDebuggee(global)
        }
        catch {
          /* ignore detached */
        }
      }
    }

    this.isRecording = false

    const results: AllocationStackSummary[] = []
    for (const [stack, data] of this.stackMap.entries()) {
      results.push({
        stack,
        count: data.count,
        totalBytes: data.bytes,
        totalMB: parseFloat((data.bytes / (1024 * 1024)).toFixed(2)),
      })
    }

    if (this.drainedEntries === 0) {
      results.push({
        stack: `[sentinel] no allocation entries drained (withFrame=${this.drainedWithFrames}, withoutFrame=${this.drainedWithoutFrames})`,
        count: 0,
        totalBytes: 0,
        totalMB: 0,
      })
    }
    else if (results.length === 0) {
      results.push({
        stack: `[sentinel] drained ${this.drainedEntries} entries but aggregation produced no stacks`,
        count: this.drainedEntries,
        totalBytes: 0,
        totalMB: 0,
      })
    }

    results.sort((a: AllocationStackSummary, b: AllocationStackSummary) => b.totalBytes - a.totalBytes)
    log(`[Profiler] Allocation entries drained: total=${this.drainedEntries}, withFrame=${this.drainedWithFrames}, withoutFrame=${this.drainedWithoutFrames}.`)
    log('[Profiler] Background allocation profiling stopped.')
    return results.slice(0, topN)
  }

  /**
   * Clean up and destroy profiler resources.
   */
  public destroy(): void {
    this.stop()
    this.dbg = null

    if (this.sandbox) {
      Components.utils.nukeSandbox(this.sandbox)
      this.sandbox = null
    }

    this.stackMap.clear()
    log('[Profiler] Profiler sandbox nuked and resources destroyed.')
  }
}
