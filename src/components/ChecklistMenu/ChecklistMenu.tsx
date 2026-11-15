import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useStore } from '../../store'
import { checklists, hashName } from '../../utils/checklists'
import { confirmDiscard } from '../../utils/dom'
import IconButton from '../IconButton/IconButton'
import './ChecklistMenu.scss'

/**
 * Renders a document button with a dropdown to start a new checklist or open an available one.
 */
export default function ChecklistMenu() {
  const st = useStore()
  const [open, setOpen] = useState(false)

  const newChecklist = () => {
    setOpen(false)

    if (location.hash) location.hash = ''
    else if (!st.dirty || confirmDiscard()) st.load({ blocks: [] })
  }

  return (
    <div className="checklist-menu" onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <IconButton icon={FileText} title="Open checklist" onClick={() => setOpen(o => !o)} />
      {open && (
        <ul className="checklist-menu__list">
          <li className="checklist-menu__new">
            <button className="checklist-menu__item" onClick={newChecklist}>New checklist</button>
          </li>
          {Object.keys(checklists).map(name => (
            <li key={name}>
              <button className={`checklist-menu__item ${name === hashName() ? 'checklist-menu__item--current' : ''}`}
                onClick={() => { location.hash = name; setOpen(false) }}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
