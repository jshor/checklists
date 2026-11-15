import { useStore } from '../../store'
import Edit from '../Edit/Edit'
import './Footer.scss'

/**
 * Renders the three editable footer texts (left, center, right) shared by every page.
 */
export default function Footer() {
  const { footer, setFooterText } = useStore()
  
  return (
    <div className="footer">
      {footer.map((text, i) => (
        <div className="footer__cell" key={i}>
          <Edit className="footer__text" value={text} onChange={t => setFooterText(i, t)} />
        </div>
      ))}
    </div>
  )
}
