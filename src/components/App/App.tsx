import { useRef, type ChangeEvent } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { FolderOpen, ImagePlus, LoaderCircle, Printer, Redo2, Save, SquarePlus, Undo2 } from 'lucide-react'
import { DEFAULT_TITLE } from '../../constants'
import { StoreContext, toJson, useChecklist } from '../../store'
import { parseChecklist } from '../../utils/checklists'
import { confirmDiscard, downloadJson, takeFile } from '../../utils/dom'
import { useDocumentTitle, useHashChecklist, usePendingFocus, useStrayFocusGuard, useUnloadWarning } from '../../utils/hooks'
import { readImage } from '../../utils/images'
import { layout } from '../../utils/layout'
import ChecklistMenu from '../ChecklistMenu/ChecklistMenu'
import Edit from '../Edit/Edit'
import IconButton from '../IconButton/IconButton'
import Page from '../Page/Page'
import { RowGhost } from '../Row/Row'
import './App.scss'

/**
 * Renders the sticky toolbar, the pages and the drag-and-drop context, or a spinner while a checklist loads.
 */
export default function App() {
  const st = useChecklist()
  const imageInput = useRef<HTMLInputElement>(null)
  const jsonInput = useRef<HTMLInputElement>(null)
  const { loading, detach } = useHashChecklist(st)

  useDocumentTitle(st.title)
  useUnloadWarning(st.dirty)
  useStrayFocusGuard()
  usePendingFocus(st)

  const openFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = takeFile(e)

    if (!file || (st.dirty && !confirmDiscard())) return

    try {
      st.load(parseChecklist(await file.text()))
      detach()
    } catch (err) {
      alert(`Could not open ${file.name}: ${(err as Error).message}`)
    }
  }

  const addImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = takeFile(e)

    if (!file) return

    try {
      const { src, ratio } = await readImage(file)

      st.addImage(src, ratio)
    } catch (err) {
      alert(`Could not add ${file.name}: ${(err as Error).message}`)
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
            <IconButton icon={Save} title="Save JSON file" onClick={() => downloadJson(toJson(st), st.title || DEFAULT_TITLE)} />
            <IconButton icon={Undo2} title="Undo" aria-disabled={!st.canUndo} onClick={st.undo} />
            <IconButton icon={Redo2} title="Redo" aria-disabled={!st.canRedo} onClick={st.redo} />
            <IconButton icon={SquarePlus} title="Add section" onClick={st.addSection} />
            <IconButton icon={ImagePlus} title="Add image" onClick={() => imageInput.current?.click()} />
            <IconButton icon={Printer} title="Print" onClick={() => print()} />
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
