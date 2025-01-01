declare type HeaderProps = {
    children: React.ReactNode;
    className?: string;
}

declare type CreateDocumentParams = {
    userId: string;
    email: string;
}

declare type AddDocumentButtonProps = {
    userId: string;
    email: string;
}

declare type SearchParamProps = {
    params: Promise<{ [key: string]: string }>;
    searchParams: { [key: string]: string | string[] | undefined };
};

declare type CollaborativeRoomProps = {
    roomId: string;
    roomMetadata: RoomMetadata;
    users?: User[];
    currentUserType?: UserType;
};