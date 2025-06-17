import React from 'react';
import './theme.css';

export function Button({ children, ...props }) {
  return <button className="btn" {...props}>{children}</button>;
}

export function Card({ children, ...props }) {
  return <div className="card" {...props}>{children}</div>;
}

export function Input(props) {
  return <input className="input" {...props} />;
}

export function Title({ children, ...props }) {
  return <h1 className="title" {...props}>{children}</h1>;
}

export function Form({ children, ...props }) {
  return <form className="form" {...props}>{children}</form>;
}

export function FormGroup({ children, ...props }) {
  return <div className="form-group" {...props}>{children}</div>;
}
