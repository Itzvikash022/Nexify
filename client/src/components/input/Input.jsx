import React from 'react'

const Input = ({
    name = '',
    id = '',
    label = '',
    type = 'text',
    placeholder = '',
    className='',
    value = '',
    onChange = () => null,
    required = true,
}) => {
  return (
    <div className='mb-4'>
        {/* Component for input */}
        {
            label &&
            <label htmlFor={name} className='block text-gray-700 text-[16px] font-serif fond mb-2'>{label}</label>
        }
        <input type={type} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`} placeholder={placeholder} name={name} value={value} onChange={onChange} required={required} id={id}/>
    </div>
  )
}

export default Input