"use server"

import { nanoid } from 'nanoid'
import { liveblocks } from '../liveblocks';
import { RoomAccesses } from '@liveblocks/node';
import { revalidatePath } from 'next/cache';

export const createDocument = async ({userId, email}: CreateDocumentParams) => {
  const roomId = nanoid();
  try {
    const metadata = {
      owner: userId,
      email,
      title: "Untitled"
    }

    const usersAccesses: RoomAccesses = {
      [email]: ['room:write']
    }

    const room = await liveblocks.createRoom(roomId, {
      defaultAccesses: [],
      usersAccesses,
      metadata,
    });

    revalidatePath('/')
    return JSON.parse(JSON.stringify(room))

  } catch (error) {
    console.log("Error occured while creating document", error)
  }
}

export const getDocument = async ({roomId, userId}: {roomId: string, userId: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);
  
    if(!hasAccess) {
      throw new Error("You do not have permission to access this document");
    }
  
    return JSON.parse(JSON.stringify(room))
  } catch (error) {
    console.log("Error occured while fetching your document", error);
  }
}

export const updateDocument = async ({ roomId, title }: {roomId: string, title: string}) => {
  try {
    const room = liveblocks.updateRoom(roomId, {
      metadata: {
        title
      }
    })

    revalidatePath(`/document/${roomId}`);
    return JSON.parse(JSON.stringify(room));

  } catch (error) {
    console.log("Error occured while updating document", error)
  }
}

export const getAllDocuments = async (email: string) => {
  try {
    const room = await liveblocks.getRooms({userId: email});
  
    return JSON.parse(JSON.stringify(room))
  } catch (error) {
    console.log("Error occured while fetching all documents", error);
  }
}