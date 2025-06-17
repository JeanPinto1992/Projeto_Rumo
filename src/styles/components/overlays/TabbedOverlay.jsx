import React from 'react';
import '../../theme.css';

export function TabbedOverlay({ isOpen, title, icon, children }) {
  if (!isOpen) return null;
  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
