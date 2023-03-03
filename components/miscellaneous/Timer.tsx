import React, { useEffect, useState } from 'react'

interface TimerProps {
  stop: boolean
}

const Timer: React.FC<TimerProps> = ({ stop }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (stop) return
    const myTimeout = setTimeout(() => setCount((count) => count + 1), 1000)
    return () => {
      clearTimeout(myTimeout)
    }
  }, [count, stop])

  return <span>{count}</span>
}

export default Timer
