import { useEffect, useRef, type ChangeEvent } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { Download, ImagePlus, SquarePlus } from 'lucide-react'
import { StoreContext, toJson, useChecklist } from '../../store'
import { layout } from '../../layout'
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
 * Renders the sticky toolbar, the pages and the drag-and-drop context.
 */
export default function App() {
  const st = useChecklist()
  const fileInput = useRef<HTMLInputElement>(null)

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
      im.src = imageUrl(src)
    }

    if (file.type === 'image/svg+xml') {
      reader.readAsText(file) // keep SVG markup as-is
    } else {
      reader.readAsDataURL(file) // render as base64 data URL
    }
  }

  return (
    <StoreContext value={st}>
      <div className="app">
        <div className="app__toolbar no-print">
          <IconButton icon={SquarePlus} title="Add section" onClick={st.addSection} />
          <IconButton icon={ImagePlus} title="Add image" onClick={() => fileInput.current?.click()} />
          <IconButton icon={Download} title="Download JSON" onClick={() => download(toJson(st.blocks))} />
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={addImage} />
        </div>

        <DndContext collisionDetection={closestCenter}
          onDragStart={e => st.setDragId(e.active.id as number)}
          onDragEnd={({ active, over }) => { st.setDragId(null); if (over) st.sortItems(active.id as number, over.id as number) }}
          onDragCancel={() => st.setDragId(null)}>
          {layout(st.blocks).map((page, p) => <Page key={p} page={page} />)}
          {/* The ghost lives in an overlay so it stays visible across columns and pages. */}
          <DragOverlay>{st.dragItem && <RowGhost item={st.dragItem} />}</DragOverlay>
        </DndContext>
      </div>
    </StoreContext>
  )
}
