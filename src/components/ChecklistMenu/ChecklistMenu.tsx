import { useState } from 'react'
import { FileText } from 'lucide-react'
import { checklists, hashName } from '../../utils/checklists'
import IconButton from '../IconButton/IconButton'
import './ChecklistMenu.scss'

/**
 * Renders a document button with a dropdown of the available checklists.
 */
export default function ChecklistMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="checklist-menu" onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <IconButton icon={FileText} title="Open checklist" onClick={() => setOpen(o => !o)} />
      {open && (
        <ul className="checklist-menu__list">
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
