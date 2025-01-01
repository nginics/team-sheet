import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

const Header = ({ children, className }: HeaderProps) => {
  return (
    <div className={cn('min-w-full w-full flex items-center justify-between gap-2 px-16 py-8', className)}>
      <span className='w-1/3 text-base font-bold text-xl'>
        <Link href="/" className='md:flex-1'>TeamSheet</Link>
      </span>
      { children }
    </div>
  )
}

export default Header