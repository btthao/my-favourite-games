interface Size {
  width?: number
  height?: number
  maxH: number
  maxW: number
  aspectRatio: number
}

export const calculateRenderSize = (props: Size) => {
  const { width, height, maxH, maxW, aspectRatio } = props
  let renderHeight = 0
  let renderWidth = 0

  if (width && height) {
    if (width / aspectRatio > height) {
      renderHeight = Math.min(height, maxH)
      renderWidth = renderHeight * aspectRatio
    } else {
      renderWidth = Math.min(width, maxW)
      renderHeight = renderWidth / aspectRatio
    }
  }

  return { renderHeight, renderWidth }
}
