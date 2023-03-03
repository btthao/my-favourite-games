import React, { useEffect, useState } from 'react'

const Timer: React.FC = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const myTimeout = setTimeout(() => setCount((count) => count + 1), 1000)
    return () => {
      clearTimeout(myTimeout)
    }
  }, [count])

  return <span>{count}</span>
}

export default Timer
