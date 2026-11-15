import { createRoot } from 'react-dom/client'
import './root.scss'
import './main.scss'
import App from './components/App/App'

createRoot(document.getElementById('root')!).render(<App />)
