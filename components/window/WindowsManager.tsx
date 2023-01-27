import { createContext, useMemo, useState } from 'react'

interface WindowsManagerState {
  currentActiveGame: string
  currentHighestZIndex: number
}

const DEFAULT_WINDOWS_MANAGER_STATE: WindowsManagerState = {
  currentActiveGame: '',
  currentHighestZIndex: 50,
}

interface WindowsManagerContext extends WindowsManagerState {
  updateCurrentActiveGame: (game: string) => void
}

export const WindowsManagerContext = createContext<WindowsManagerContext>({
  ...DEFAULT_WINDOWS_MANAGER_STATE,
  updateCurrentActiveGame() {
    return ''
  },
})

const WindowsManager = ({ children }: { children: JSX.Element }) => {
  const [{ currentActiveGame, currentHighestZIndex }, setCurrentState] = useState<WindowsManagerState>(DEFAULT_WINDOWS_MANAGER_STATE)

  const updateCurrentActiveGame = (game: string) => {
    setCurrentState((prev) => {
      return { currentActiveGame: game, currentHighestZIndex: prev.currentHighestZIndex + 1 }
    })
  }

  const value = useMemo(() => ({ currentHighestZIndex, currentActiveGame, updateCurrentActiveGame }), [currentActiveGame, currentHighestZIndex])

  return <WindowsManagerContext.Provider value={value}>{children}</WindowsManagerContext.Provider>
}

export default WindowsManager
