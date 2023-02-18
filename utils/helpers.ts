export const partition = <T>(array: T[], callback: (element: T, index: number, array: T[]) => boolean) => {
  return array.reduce(
    function (result: T[][], element, i) {
      callback(element, i, array) ? result[0].push(element) : result[1].push(element)

      return result
    },
    [[], []]
  )
}

export const selectRandomFromList = <T>(list: T[]): T => {
  return list[Math.floor(Math.random() * list.length)]
}

export const adjustColorIntensity = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, (color) => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2))
}

export const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    swapInArray(array, i, j)
  }
}

export const swapInArray = (array: any[], idx1: number, idx2: number) => ([array[idx1], array[idx2]] = [array[idx2], array[idx1]])
