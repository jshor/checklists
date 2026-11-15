import { createRoot } from 'react-dom/client'
import './root.scss'
import './main.scss'
import App from './components/App/App'
import NarrowWarning from './components/NarrowWarning/NarrowWarning'

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <NarrowWarning />
  </>
)
