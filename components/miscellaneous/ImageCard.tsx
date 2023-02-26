import React from 'react'
import Image from 'next/image'
import styles from 'styles/ImageCard.module.scss'
import { AiFillCheckCircle } from 'react-icons/ai'

interface ImageCardProps {
  name: string
  src: string
  onClick: (name?: string) => void
  selected: boolean
  width: number
  height: number
}

const ImageCard: React.FC<ImageCardProps> = ({ name, src, onClick, selected = false, height, width }) => {
  return (
    <div className={styles.card} onClick={() => onClick(name)}>
      <Image src={src} alt={name} width={width} height={height} />
      <p>{name}</p>
      {selected && (
        <div className={styles.selected}>
          <AiFillCheckCircle />
        </div>
      )}
    </div>
  )
}

export default ImageCard
