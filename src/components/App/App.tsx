import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { Download, FolderOpen, ImagePlus, LoaderCircle, Redo2, SquarePlus, Undo2 } from 'lucide-react'
import { DEFAULT_TITLE } from '../../constants'
import { StoreContext, toJson, useChecklist } from '../../store'
import { checklists, hashName, parseChecklist, request } from '../../utils/checklists'
import { layout } from '../../utils/layout'
import ChecklistMenu from '../ChecklistMenu/ChecklistMenu'
import Edit from '../Edit/Edit'
import IconButton from '../IconButton/IconButton'
import Page from '../Page/Page'
import { imageUrl } from '../ImageBlock/ImageBlock'
import { RowGhost } from '../Row/Row'
import './App.scss'

/**
 * Stops clicks beside an editable (padding, leaders, margins, background) from focusing it.
 */
const blockStrayFocus = (e: MouseEvent) => {
  const el = e.target as HTMLElement
  const activeEl = document.activeElement as HTMLElement | null

  if (el.isContentEditable || el.closest('button, label, [tabindex]')) return

  e.preventDefault()
  activeEl?.blur()
}

/**
 * Downloads JSON text as "<name>.json", replacing characters not allowed in file names.
 */
const download = (text: string, name: string) => {
  const a = document.createElement('a')

  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  a.download = `${name.replace(/[\\/:*?"<>|]/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

/**
 * Renders the sticky toolbar, the pages and the drag-and-drop context, or a spinner while a checklist loads.
 */
export default function App() {
  const st = useChecklist()
  const imageInput = useRef<HTMLInputElement>(null)
  const jsonInput = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const dirty = useRef(st.dirty)
  const shownHash = useRef(location.hash)

  dirty.current = st.dirty

  useEffect(() => {
    let latest = 0
    const open = () => {
      if (latest && dirty.current && !confirm('Discard unsaved changes?')) {
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

  useEffect(() => {
    document.title = st.title || DEFAULT_TITLE
  }, [st.title])

  // warn before leaving or reloading the page with unsaved changes
  useEffect(() => {
    if (!st.dirty) return

    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [st.dirty])

  useEffect(() => {
    document.addEventListener('mousedown', blockStrayFocus)
    return () => document.removeEventListener('mousedown', blockStrayFocus)
  }, [])

  // focus a requested element once it has been laid out (it may land in another column/page).
  useEffect(() => {
    if (!st.focusId) return

    document
      .querySelector<HTMLElement>(`[data-focus="${st.focusId}"]`)
      ?.focus()
    st.focus(null)

  }, [st.focusId])

  // load a checklist from a local JSON file
  const openFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    e.target.value = ''

    if (!file || (st.dirty && !confirm('Discard unsaved changes?'))) return

    try {
      st.load(parseChecklist(await file.text()))

      // clear the hash since it no longer names the document
      if (location.hash) {
        history.pushState(null, '', location.pathname + location.search)
      }
      shownHash.current = ''
    } catch (err) {
      alert(`Could not open ${file.name}: ${(err as Error).message}`)
    }
  }

  const addImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    e.target.value = ''

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      const src = reader.result as string, im = new Image()
      im.onload = () => st.addImage(src, im.height / im.width)
      im.src = imageUrl(src)
    }

    if (file.type === 'image/svg+xml') {
      reader.readAsText(file) // keep SVG markup as-is
    } else {
      reader.readAsDataURL(file) // render as base64 data URL
    }
  }

  if (loading) {
    return (
      <div className="app__loading">
        <LoaderCircle className="app__spinner" />
      </div>
    )
  }

  return (
    <StoreContext value={st}>
      <div className="app">
        <div className="app__toolbar no-print">
          <h1 className="app__title">
            <Edit value={st.title} onChange={st.setDocTitle} />
          </h1>
          <div className="app__tools">
            <ChecklistMenu />
            <IconButton icon={FolderOpen} title="Open JSON file" onClick={() => jsonInput.current?.click()} />
            <IconButton icon={Undo2} title="Undo" aria-disabled={!st.canUndo} onClick={st.undo} />
            <IconButton icon={Redo2} title="Redo" aria-disabled={!st.canRedo} onClick={st.redo} />
            <IconButton icon={SquarePlus} title="Add section" onClick={st.addSection} />
            <IconButton icon={ImagePlus} title="Add image" onClick={() => imageInput.current?.click()} />
            <IconButton icon={Download} title="Download JSON" onClick={() => download(toJson(st), st.title || DEFAULT_TITLE)} />
            <input ref={imageInput} type="file" accept="image/*" hidden onChange={addImage} />
            <input ref={jsonInput} type="file" accept=".json,application/json" hidden onChange={openFile} />
          </div>
        </div>

        <DndContext collisionDetection={closestCenter}
          onDragStart={e => st.setDragId(e.active.id as number)}
          onDragEnd={({ active, over }) => { st.setDragId(null); if (over) st.sortItems(active.id as number, over.id as number) }}
          onDragCancel={() => st.setDragId(null)}>
          {layout(st.blocks).map((page, p, pages) => <Page key={p} page={page} number={p + 1} total={pages.length} />)}
          {/* The ghost lives in an overlay so it stays visible across columns and pages. */}
          <DragOverlay>{st.dragItem && <RowGhost item={st.dragItem} />}</DragOverlay>
        </DndContext>
      </div>
    </StoreContext>
  )
}
