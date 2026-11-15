import type { ChangeEvent } from 'react'

/**
 * Stops clicks beside an editable (padding, leaders, margins, background) from focusing it.
 */
export const blockStrayFocus = (e: MouseEvent) => {
  const el = e.target as HTMLElement

  if (el.isContentEditable || el.closest('button, label, [tabindex]')) return

  e.preventDefault()
  ;(document.activeElement as HTMLElement | null)?.blur()
}

/**
 * Asks the browser to confirm leaving or reloading the page.
 */
export const warnBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}

/**
 * Returns whether the user agrees to discard unsaved changes.
 */
export const confirmDiscard = () => confirm('Discard unsaved changes?')

/**
 * Focuses the element with this data-focus.
 */
export const focusById = (id: string) => {
  return document.querySelector<HTMLElement>(`[data-focus="${id}"]`)?.focus()
}

/**
 * Removes the URL hash without a hashchange event, as a new history entry so Back restores it.
 */
export const clearHash = () => {
  if (location.hash) history.pushState(null, '', location.pathname + location.search)
}

/**
 * Returns the file chosen in a file input, resetting the input so the same file can be chosen again.
 */
export const takeFile = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]

  e.target.value = ''
  return file
}

/**
 * Returns a name with characters not allowed in file names replaced by "-".
 */
export const safeFileName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-')

/**
 * Downloads JSON text as "<name>.json".
 */
export const downloadJson = (text: string, name: string) => {
  const a = document.createElement('a')

  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  a.download = `${safeFileName(name)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

/**
 * Returns a CSS custom property's length (e.g. "--page-w") in px.
 */
export const px = (name: string) => {
  const probe = document.body.appendChild(document.createElement('div'))

  probe.style.position = 'absolute'
  probe.style.width = `var(${name})`

  const width = probe.getBoundingClientRect().width

  probe.remove()
  return width
}
