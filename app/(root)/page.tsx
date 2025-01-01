import AddDocumentButton from '@/components/AddDocumentButton'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { getAllDocuments } from '@/lib/actions/room.actions'
import { timeAgo } from '@/lib/utils'
import { SignedIn, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { Bell, Ellipsis, FileText, MoreHorizontal, Settings, Share2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

const Home = async () => {
  const clerkUser = await currentUser()

  if(!clerkUser) redirect("/sign-in")

  const documents = await getAllDocuments(clerkUser.emailAddresses[0].emailAddress)
  // console.log(documents)

  return (
    <main className='relative flex min-h-screen w-full flex-col items-center gap-5 sm:gap-10'>
      <Header className='sticky z-10 left-0 top-0'>
        <div className='flex items-center gap-2 lg:gap-6'>
          <Bell />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      {documents.data.length > 0 ? (
        <div className='w-9/12 md:px-8 py-10 rounded-lg dark:bg-zinc-900'>
          <div className='flex items-center px-6 justify-between'>
            <p className='text-2xl md:text-4xl font-semibold'>All Documents</p>
            <AddDocumentButton
              userId = {clerkUser.id}
              email = {clerkUser.emailAddresses[0].emailAddress}
            />
          </div>
          <Separator className="my-8" />
          <ScrollArea className='h-96'>
            <ul className='px-6'>
              {documents.data.map(({id, metadata, createdAt}: {id: string, metadata: any, createdAt: string}) => (
                <li key={id}>
                  <Link href={`/document/${id}`} className='flex'>
                    <div className='flex gap-4 items-center px-4 mb-4 w-full bg-zinc-800/30 shadow-inner shadow-zinc-800/90 ring-1 ring-slate-900/10 hover:ring-slate-800 h-24 rounded-lg'>
                      
                      <div className='relative w-12 h-12 md:h-16 md:w-16 flex-shrink-0 bg-zinc-800 shadow-inner shadow-zinc-700/50 rounded-lg'>
                        <FileText className='absolute fill-blue-600 stroke-blue-300 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-9 md:h-9 shadow-2xl shadow-blue-500'/>
                      </div>
                      
                      <div className='mr-auto'>
                        <p className='lg:text-xl text-sm md:text-xl trucate line-clamp-1 mb-2'>{metadata.title}</p>
                        <p className='text-xs text-teal-700'>{`Created about ${timeAgo(createdAt)}`}</p>
                      </div>

                      <div className='m-0 md:m-4'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size='icon'>
                              <span className="sr-only">Open menu</span>
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className='dark:bg-zinc-800 shadow-inner shadow-zinc-500/10 rounded-lg'>
                            <DropdownMenuItem><Share2 />Share</DropdownMenuItem>
                            <DropdownMenuItem><Trash2 />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        // box-shadow: 0px 8px 12px 0px #23304A0A inset;

        // box-shadow: 0px 20px 20px -16px #0000003D;
        
        // box-shadow: 16px 24px 64px -24px #23304A inset;
        
      ) : (
        <div className='flex w-full max-w-[730px] flex-col items-center justify-center gap-5 rounded-lg dark:bg-zinc-900 px-10 py-8'>
          <p className='text-4xl font-semibold my-4 dark:text-zinc-700'>No Items Found</p>
          <AddDocumentButton
            userId = {clerkUser.id}
            email = {clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  )
}

export default Home