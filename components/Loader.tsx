import { LoaderCircle } from 'lucide-react'
import React from 'react'

const Loader = () => {
  return (
    <div className='flex w-full items-center justify-center min-h-screen'>
      <LoaderCircle className='animate-spin' size={64}/>
    </div>
  )
}

export default Loader