import { useEffect, type ChangeEvent } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { StoreContext, toJson, useChecklist } from '../../store'
import { layout } from '../../layout'
import Page from '../Page/Page'
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
 * Downloads text as checklist.json.
 */
const download = (text: string) => {
  const a = document.createElement('a')
  
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  a.download = 'checklist.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

/**
 * Renders the pages, drag-and-drop context and the add/download controls.
 */
export default function App() {
  const st = useChecklist()

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

  const addImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    e.target.value = ''

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      const src = reader.result as string, im = new Image()
      im.onload = () => st.addImage(src, im.height / im.width)
      im.src = src
    }
    reader.readAsDataURL(file)
  }

  return (
    <StoreContext value={st}>
      <div className="app">
        <DndContext collisionDetection={closestCenter}
          onDragStart={e => st.setDragId(e.active.id as number)}
          onDragEnd={({ active, over }) => { st.setDragId(null); if (over) st.sortItems(active.id as number, over.id as number) }}
          onDragCancel={() => st.setDragId(null)}>
          {layout(st.blocks).map((page, p) => <Page key={p} page={page} />)}
          {/* The ghost lives in an overlay so it stays visible across columns and pages. */}
          <DragOverlay>{st.dragItem && <RowGhost item={st.dragItem} />}</DragOverlay>
        </DndContext>
        
        <div className="app__controls no-print">
          <button onClick={st.addSection}>+ Add section</button>
          <label className="app__upload">+ Add image<input type="file" accept="image/*" hidden onChange={addImage} /></label>
          <button onClick={() => download(toJson(st.blocks))}>Download JSON</button>
        </div>
      </div>
    </StoreContext>
  )
}
