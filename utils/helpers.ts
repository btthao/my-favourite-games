export const partition = <T>(array: T[], callback: (element: T, index: number, array: T[]) => boolean) => {
  return array.reduce(
    function (result: T[][], element, i) {
      callback(element, i, array) ? result[0].push(element) : result[1].push(element)

      return result
    },
    [[], []]
  )
}

export const selectRandomFromList = <T>(options: T[]): T => {
  return options[Math.floor(Math.random() * options.length)]
}

export const adjustColor = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, (color) => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2))
}
