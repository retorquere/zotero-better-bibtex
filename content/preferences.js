const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const trigger = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '-' + window.document.readyState
Zotero.debug(`bbt-preferences: pre-load ${trigger}`)

let stickyFrame = null
let stickyContainer = null
let bootFrame = null

function toPixels(length, basis) {
  const value = (length || '').trim()
  if (!value) return 0
  const root = window.document.documentElement || basis
  if (value.endsWith('px')) return parseFloat(value)
  if (value.endsWith('rem')) return parseFloat(value) * parseFloat(window.getComputedStyle(root).fontSize)
  if (value.endsWith('em')) return parseFloat(value) * parseFloat(window.getComputedStyle(basis).fontSize)
  return parseFloat(value) || 0
}

function pileSectionHeaders() {
  if (!stickyContainer) return

  const groups = [...window.document.querySelectorAll('.bbt-prefs-section, .bbt-prefs-subsection')]
  if (!groups.length) return

  for (const group of groups) {
    const header = group.querySelector(':scope > label > h2')
    if (header) header.style.transform = ''
  }

  const topHeader = window.document.querySelector('.bbt-prefs-section > label > h2')
  if (!topHeader) return

  const style = window.getComputedStyle(topHeader)
  const top = toPixels(style.getPropertyValue('--bbt-prefs-sticky-top'), topHeader)
  const gap = toPixels(style.getPropertyValue('--bbt-prefs-sticky-gap'), topHeader)
  const topHeight = topHeader.getBoundingClientRect().height
  const nestedHeader = window.document.querySelector('.bbt-prefs-subsection > label > h2')
  const nestedHeight = nestedHeader ? nestedHeader.getBoundingClientRect().height : topHeight
  const containerTop = stickyContainer.getBoundingClientRect().top

  for (const group of groups) {
    const header = group.querySelector(':scope > label > h2')
    if (!header) continue

    const depth = group.classList.contains('bbt-prefs-section') ? 0 : group.parentElement?.closest('.bbt-prefs-subsection') ? 2 : 1
    const offset = depth === 0 ? top : top + topHeight + gap + ((depth - 1) * (nestedHeight + gap))
    const headerRect = header.getBoundingClientRect()
    const groupRect = group.getBoundingClientRect()
    const desiredTop = containerTop + offset
    const maxShift = Math.max(0, groupRect.bottom - headerRect.height - headerRect.top)
    const shift = Math.max(0, Math.min(desiredTop - headerRect.top, maxShift))

    if (shift) header.style.transform = `translateY(${shift}px)`
  }
}

function queuePile() {
  if (stickyFrame !== null) return
  stickyFrame = window.requestAnimationFrame(() => {
    stickyFrame = null
    pileSectionHeaders()
  })
}

function initPiling() {
  stickyContainer = window.document.getElementById('prefs-content')
  if (!stickyContainer) return false

  if (!window.document.querySelector('.bbt-prefs-section > label > h2')) return false

  stickyContainer.addEventListener('scroll', queuePile, { passive: true })
  window.addEventListener('resize', queuePile)
  queuePile()
  return true
}

function bootPiling() {
  if (initPiling()) {
    bootFrame = null
    return
  }

  bootFrame = window.requestAnimationFrame(bootPiling)
}

function unloadPiling() {
  stickyContainer?.removeEventListener('scroll', queuePile)
  window.removeEventListener('resize', queuePile)
  if (bootFrame !== null) window.cancelAnimationFrame(bootFrame)
  if (stickyFrame !== null) window.cancelAnimationFrame(stickyFrame)
  bootFrame = null
  stickyFrame = null
  stickyContainer = null
}

bootPiling()

window.addEventListener('unload', (event) => {
  unloadPiling()
})
