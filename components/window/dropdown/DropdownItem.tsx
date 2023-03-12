import React from 'react'
import { BsCheck } from 'react-icons/bs'
export interface DropdownItemProps {
  text: string | number
  onClick: () => void
  isActive?: boolean
}

const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, text, isActive = false }) => {
  return (
    <div onClick={onClick}>
      <span>{isActive && <BsCheck />}</span>
      <span>{text}</span>
    </div>
  )
}

export default DropdownItem
