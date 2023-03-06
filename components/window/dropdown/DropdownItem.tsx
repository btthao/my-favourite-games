import React from 'react'

export interface DropdownItemProps {
  text: string
  onSelect: () => void
  onDeselect: () => void
}

const DropdownItem: React.FC<DropdownItemProps> = ({ onDeselect, onSelect, text }) => {
  return <div>hi</div>
}

export default DropdownItem
