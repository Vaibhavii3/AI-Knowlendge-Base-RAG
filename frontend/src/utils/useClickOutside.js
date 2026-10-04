import { useEffect } from 'react'

export default function useClickOutside(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside, active])
}
