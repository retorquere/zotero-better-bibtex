const kB = 1024
const MB = kB * kB

const memoryReporterManager = Components.classes['@mozilla.org/memory-reporter-manager;1'].getService(Components.interfaces.nsIMemoryReporterManager)
memoryReporterManager.init()
const inUseAtStart = memoryReporterManager.resident / MB

export type State = { snapshot: string; resident: number; delta: number; deltaSinceStart: number }
const snapshots: Record<string, State> = {}

export function state(snapshot: string): State {
  const resident = memoryReporterManager.resident / MB
  const delta = resident - (snapshots[snapshot]?.resident || resident)
  const deltaSinceStart = resident - inUseAtStart
  return (snapshots[snapshot] = { snapshot, resident, delta, deltaSinceStart })
}
