import React from 'react'
import { BsCheck } from 'react-icons/bs'
export interface DropdownItemProps {
  text: string | number
  onSelect: () => void
  onDeselect: () => void
  isActive?: boolean
}

const DropdownItem: React.FC<DropdownItemProps> = ({ onDeselect, onSelect, text, isActive }) => {
  return (
    <div>
      {isActive !== undefined && <span>{isActive && <BsCheck />}</span>}
      <span>{text}</span>
    </div>
  )
}

export default DropdownItem
