import { useStore } from '../../store'
import Edit from '../Edit/Edit'
import './Footer.scss'

/**
 * Returns footer text with the following placeholders replacements:
 * 
 *   - `{n}` - the page number
 *   - `{m}` - the page count
 */
export const fillFooter = (text: string, page: number, pages: number) => {
  return text.replaceAll('{n}', String(page)).replaceAll('{m}', String(pages))
}

/**
 * Renders the three editable footer texts (left, center, right) shared by every page.
 */
export default function Footer({ page, pages }: { page: number; pages: number }) {
  const { footer, setFooterText } = useStore()

  return (
    <div className="footer">
      {footer.map((text, i) => (
        <div className="footer__cell" key={i}>
          <Edit className="footer__text" value={text} display={fillFooter(text, page, pages)}
            onChange={t => setFooterText(i, t)} />
        </div>
      ))}
    </div>
  )
}
