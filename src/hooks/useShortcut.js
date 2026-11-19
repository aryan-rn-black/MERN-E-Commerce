import { useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

/**
 * Cmd/Ctrl+K to open the search drawer.
 */
export default function useGlobalShortcuts() {
  const { openDrawer } = useApp()
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openDrawer('search')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openDrawer])
}
