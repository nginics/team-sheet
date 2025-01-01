"use client"

import React from 'react'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { createDocument } from '@/lib/actions/room.actions'
import { useRouter } from 'next/navigation'

const AddDocumentButton = ({userId, email}: AddDocumentButtonProps) => {

  const router = useRouter();
  
  const addDocumentHandler = async () => {
    try {
      const room = await createDocument({userId, email});

      if(room) router.push(`/document/${room.id}`)
    } catch (error) {
      console.log("Error while handling add document", error)
    }
  }

  return (
    <Button type='submit' onClick={addDocumentHandler} className='gradient-blue flex gap-1 shadow-md'>
      <Plus />
      <p className='hidden sm:block'>Create</p>
    </Button>
  )
}

export default AddDocumentButton