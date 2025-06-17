import React from 'react'
import '../../index.css'

export function TabbedOverlay({ isOpen, title, children }) {
  if (!isOpen) return null
  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function useTabbedOverlay(initial = false) {
  const [isOpen, setIsOpen] = React.useState(initial)
  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  return { isOpen, open, close }
}
