import { ListPlus, MessageSquarePlus, Trash2 } from 'lucide-react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useStore } from '../../store'
import type { Fragment } from '../../types'
import Arrows from '../Arrows/Arrows'
import Edit from '../Edit/Edit'
import IconButton from '../IconButton/IconButton'
import Row from '../Row/Row'
import './Section.scss'

/**
 * Renders one column's part of a section; later parts get "(cont.)", the last gets the actions.
 */
export default function Section({ s, items, cont, last }: Fragment) {
  const st = useStore()
  const append = (note: boolean) => {
    return st.insertItem(s.id, s.items.at(-1)?.id ?? null, note)
  }
  const dim = st.dragItem && !s.items.includes(st.dragItem)

  return (
    <div className={`section ${dim ? 'section--dim' : ''}`}>
      <div className="section__head">
        <Arrows className="section__tools" onMove={dir => st.move(s.id, dir)} />
        <Edit value={s.title} focusId={`title-${s.id}`} onChange={title => st.setTitle(s.id, title)}
          onEnter={note => st.insertItem(s.id, null, note)}
          onArrow={dir => { st.move(s.id, dir); st.focus(`title-${s.id}`) }} />
        {cont && ' (cont.)'}
        {last && (
          <span className="section__tools section__actions">
            <IconButton large icon={ListPlus} title="Add line" onClick={() => append(false)} />
            <IconButton large icon={MessageSquarePlus} title="Add note" onClick={() => append(true)} />
            <IconButton large icon={Trash2} title="Delete section"
              onClick={() => confirm(`Delete section "${s.title}"?`) && st.removeBlock(s.id)} />
          </span>
        )}
      </div>
      <SortableContext items={items.map(it => it.id)} strategy={verticalListSortingStrategy}>
        {items.map(it => <Row key={it.id} sectionId={s.id} item={it} />)}
      </SortableContext>
    </div>
  )
}
