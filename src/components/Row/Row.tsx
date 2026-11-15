import { GripVertical, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store'
import type { Item } from '../../types'
import Edit from '../Edit/Edit'
import IconButton from '../IconButton/IconButton'
import './Row.scss'

/**
 * Renders a checklist line (label/value or note) with drag grip and delete button.
 */
export default function Row({ sectionId, item }: { sectionId: number; item: Item }) {
  const st = useStore()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const edit = (key: 'label' | 'value' | 'note', className = '') => (
    <Edit className={className} value={item[key]!} focusId={key === 'value' ? undefined : `item-${item.id}`}
      onChange={text => st.setItem(sectionId, item.id, key, text)}
      onEnter={note => st.insertItem(sectionId, item.id, note)} />
  )
  
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`row ${item.note != null ? 'row--note' : ''} ${isDragging ? 'row--dragging' : ''}`}>
      <IconButton bare ref={setActivatorNodeRef} className="row__grip" icon={GripVertical} title="Drag to reorder"
        {...attributes} {...listeners} />
      {item.note != null ? edit('note') : <>
        {edit('label', 'row__label')}
        <span className="row__dots" />
        {edit('value', 'row__value')}
      </>}
      <IconButton bare className="row__delete" icon={Trash2} title="Delete" onClick={() => st.removeItem(sectionId, item.id)} />
    </div>
  )
}

/**
 * Renders a static copy of a line shown under the pointer while dragging.
 */
export const RowGhost = ({ item }: { item: Item }) => (
  <div className={`row row--ghost ${item.note != null ? 'row--note' : ''}`}>
    {item.note ?? <>
      <span className="row__label">{item.label}</span>
      <span className="row__dots" />
      <span className="row__value">{item.value}</span>
    </>}
  </div>
)
