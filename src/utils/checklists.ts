import type { JsonChecklist } from '../types'

const urls = import.meta.glob<string>('../checklists/*.json', { eager: true, query: '?url', import: 'default' })

/** Available checklist URLs by name (file name without .json). */
export const checklists: Record<string, string> = Object.fromEntries(
  Object.entries(urls).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -'.json'.length), url])
)

/** Returns the name of the checklist in the URL hash. */
export const hashName = () => decodeURIComponent(location.hash.slice(1))

/**
 * Returns a checklist fetched by XHR.
 */
export const request = (url: string) => {
  return new Promise<JsonChecklist>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open('GET', url)
    xhr.responseType = 'json'
    xhr.onload = () => {
      if (xhr.status >= 400) {
        return reject(new Error(`${url}: HTTP ${xhr.status}`))
      }
      resolve(xhr.response)
    }
    xhr.onerror = () => reject(new Error(`${url}: network error`))
    xhr.send()
  })
}

/**
 * Returns the checklist in a JSON file's text.
 */
export const parseChecklist = (text: string): JsonChecklist => {
  const json = JSON.parse(text)
  const checklist = Array.isArray(json) ? { blocks: json } : json

  if (!Array.isArray(checklist?.blocks)) throw new Error('not a checklist file')

  return checklist
}
