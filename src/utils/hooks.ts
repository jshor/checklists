import { useEffect, useRef, useState } from 'react'
import { DEFAULT_TITLE } from '../constants'
import type { Store } from '../types'
import { checklists, hashName, request } from './checklists'
import { blockStrayFocus, clearHash, confirmDiscard, focusById, warnBeforeUnload } from './dom'

/**
 * Loads the checklist named in the URL hash now and on every hash change.
 */
export function useHashChecklist(st: Store) {
  const [loading, setLoading] = useState(false)
  const dirty = useRef(st.dirty)
  const shownHash = useRef(location.hash)

  dirty.current = st.dirty

  useEffect(() => {
    let latest = 0
    const open = () => {
      if (latest && dirty.current && !confirmDiscard()) {
        return history.replaceState(null, '', shownHash.current || location.pathname + location.search)
      }

      shownHash.current = location.hash

      const id = ++latest, url = checklists[hashName()]

      setLoading(!!url)

      if (!url) return st.load({ blocks: [] })

      request(url)
        .then(json => id === latest && st.load(json))
        .catch(err => { console.error(err); st.load({ blocks: [] }) })
        .finally(() => id === latest && setLoading(false))
    }

    open()
    addEventListener('hashchange', open)
    return () => removeEventListener('hashchange', open)
  }, [])

  return {
    loading,
    detach: () => {
      clearHash()
      shownHash.current = ''
    },
  }
}

/**
 * Keeps the browser tab title in sync with the document title.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE
  }, [title])
}

/**
 * Warns before leaving or reloading the page while active (e.g. with unsaved changes).
 */
export function useUnloadWarning(active: boolean) {
  useEffect(() => {
    if (!active) return

    addEventListener('beforeunload', warnBeforeUnload)
    return () => removeEventListener('beforeunload', warnBeforeUnload)
  }, [active])
}

/**
 * Stops clicks beside editables from focusing them, for the lifetime of the component.
 */
export function useStrayFocusGuard() {
  useEffect(() => {
    document.addEventListener('mousedown', blockStrayFocus)
    return () => document.removeEventListener('mousedown', blockStrayFocus)
  }, [])
}

/**
 * Focuses the store's requested element once it has been laid out (it may land in another column/page).
 */
export function usePendingFocus(st: Store) {
  useEffect(() => {
    if (!st.focusId) return

    focusById(st.focusId)
    st.focus(null)
  }, [st.focusId])
}
