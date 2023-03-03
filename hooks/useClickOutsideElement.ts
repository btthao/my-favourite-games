import { useEffect, useState } from 'react'

export default function useClickOutsideElement(ref: React.MutableRefObject<any>, handleClickOutside: () => void) {
  const [clickOutside, setClickOutside] = useState(false)

  useEffect(() => {
    const checkClickOutside = (e: MouseEvent) => {
      setClickOutside(ref.current && !ref.current.contains(e.target))
    }

    document.addEventListener('mouseup', checkClickOutside)
    return () => {
      document.removeEventListener('mouseup', checkClickOutside)
    }
  }, [ref])

  useEffect(() => {
    if (clickOutside) {
      handleClickOutside()
    }
  }, [clickOutside, handleClickOutside])

  return clickOutside
}
