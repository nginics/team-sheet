'use client'

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react'
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import React, { useEffect, useRef, useState } from 'react'
import ActiveCollaborators from './ActiveCollaborators'
import { Input } from './ui/input'
import { LoaderCircle, Lock, SquarePen } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { updateDocument } from '@/lib/actions/room.actions'
import Loader from './Loader'

const CollaborativeRoom = ({roomId, roomMetadata}: CollaborativeRoomProps) => {

  //TODO: update variable based on user permission. Hard coded for now!!
  const currentUserType = 'editor'

  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateTitleHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setLoading(true);
      try {
        const updatedDoc = await updateDocument({roomId, title: documentTitle})
        if(updatedDoc) setEditing(false);
      } catch (error) {
        console.log("Error while updating title", error)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if(containerRef.current && !containerRef.current.contains(event.target as Node)){
        updateDocument({roomId, title: documentTitle})
        setEditing(false)
      }
    }

    if (editing){
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }

  }, [documentTitle, roomId, editing])

  useEffect(() => {
    if(editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing])
  
  

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className='w-full'>
        <Header>
          <div className="flex w-1/3 items-center justify-center gap-2 text-center" ref={containerRef}>
            {
              editing && !loading ? (
                <Input
                  type='text'
                  value={documentTitle}
                  ref={inputRef}
                  placeholder='After editing press Enter'
                  onChange={(e) => {
                    setDocumentTitle(e.target.value)
                  }}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className='flex-shrink-0 flex-grow min-w-20 max-w-full text-center font-semibold lg:text-base md:text-base text-sm focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-900 border-none'
                />
                // border-none bg-transparent px-0 text-left text-base font-semibold leading-[24px] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:text-black sm:text-xl md:text-center
              ) : (
                <>
                  <p className='truncate font-semibold text-base'>{documentTitle}</p>
                </>
              )
            }
            {/* Edit Title Pencil */}
            {
              currentUserType === 'editor' && !editing && (
                <TooltipProvider delayDuration={50}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    {/* <Button size="sm" variant='ghost' onClick={() => setEditing(true)}> */}
                      <SquarePen size={18} onClick={() => setEditing(true)} className='cursor-pointer shrink-0'/>
                    {/* </Button> */}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Title</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            }
            {/* View Only Title Lock */}
            {
              currentUserType !== 'editor' && !editing && (
                <TooltipProvider delayDuration={50}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock size={18} className='shrink-0'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Only</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            }
            {/* Loading */}
            {
              loading && (
                <LoaderCircle size={18} className='animate-spin shrink-0'/>
              )
            }
          </div>
          <div className='flex flex-1 justify-end'>
            <ActiveCollaborators />
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </Header>
        <Editor />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom