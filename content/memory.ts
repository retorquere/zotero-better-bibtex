const kB = 1024
const MB = kB * kB

const memoryReporterManager = Components.classes['@mozilla.org/memory-reporter-manager;1'].getService(Components.interfaces.nsIMemoryReporterManager)
memoryReporterManager.init()

const format = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false, // 24-hour time format
})

type Timer = ReturnType<typeof setInterval>

export const memory = new class {
  #header = true
  #scale = MB
  #timer: Timer
  #prefix = '[[better-bibtex memory state]]'

  public scale(scale: number) {
    this.#scale = scale
  }

  get resident() {
    return memoryReporterManager.resident / this.#scale
  }

  get explicit() {
    return memoryReporterManager.explicit / this.#scale
  }

  public record(on: boolean) {
    if (this.#timer) clearInterval(this.#timer)
    if (on) this.#timer = setInterval(this.log.bind(this, 'recording'), 10000)
  }

  public log(msg = ''): void {
    if (this.#header) {
      Zotero.debug(`${this.#prefix}timestamp,resident,explicit,message`)
      this.#header = false
    }

    if (msg && /[",\n\r]/.test(msg)) msg = `"${msg.replace(/"/g, '""')}"`
    Zotero.debug(`${this.#prefix}${format.format(new Date).replace(',', '')},${this.resident},${this.explicit},${msg}`)
  }
}
