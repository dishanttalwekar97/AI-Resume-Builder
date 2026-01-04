import React from 'react'

const Title = ({title,description}) => {
  return (
    <div className='text-center mt-6 text-slate-700'>
      <h2 className='text-3x1 sm:text-4xl font-medium'>{title}</h2>
      <p className='max-sm max-w-2xl mt-4 text-slate'>{description}</p>
    </div>
  )
}

export default Title
