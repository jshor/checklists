import { useMemo, useState } from 'react'
import { px } from '../../utils/dom'
import { useDocumentWidth } from '../../utils/hooks'
import './NarrowWarning.scss'

/**
 * Renders an overlay warning that the editor is hard to use while the document is narrower than a page.
 * 
 * Once dismissed it will not re-appear until next page load.
 */
export default function NarrowWarning() {
  const pageWidth = useMemo(() => px('--page-w'), [])
  const narrow = useDocumentWidth() < pageWidth
  const [dismissed, setDismissed] = useState(false)

  if (!narrow || dismissed) return null

  return (
    <div className="narrow-warning no-print" role="alertdialog" aria-modal="true" aria-labelledby="narrow-warning-text">
      <div className="narrow-warning__box">
        <p id="narrow-warning-text" className="narrow-warning__text">
          This editor renders an A4 checklist and is designed to be used on a desktop.
        </p>
        <p>It will be hard to use on narrow viewports.</p>
        <button className="narrow-warning__ok" autoFocus onClick={() => setDismissed(true)}>OK</button>
      </div>
    </div>
  )
}
