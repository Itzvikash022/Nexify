import React from 'react'

const Button = ({
    label = '',
    className = '',
    icon = null,
    onClick = () => null,
}) => {
  return (
    <button onClick={onClick} className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}>{icon && <span className="mr-2">{icon}</span>} 
      {label}</button>
  )
}

export default Button