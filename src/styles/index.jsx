import './index.css'

export function Button(props) {
  return <button className="btn" {...props} />
}

export function Card({ children }) {
  return <div className="card">{children}</div>
}

export function Input(props) {
  return <input className="input" {...props} />
}

export function Title({ children }) {
  return <h2>{children}</h2>
}

export function Form(props) {
  return <form className="form" {...props} />
}

export function FormGroup({ children }) {
  return <div className="form-group">{children}</div>
}

