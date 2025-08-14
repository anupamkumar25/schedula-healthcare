import { Message } from 'src/entities/message-entities';
import { Repository } from 'typeorm';
export declare class ChatService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<Message>);
    private validateMessageIds;
    SendMessage(senderId: string, recipientId: string, content: string): Promise<{
        success: boolean;
        message: string;
        data: Message;
    }>;
    getConversations(userA: string, userB: string): Promise<{
        success: boolean;
        data: Message[];
        count: number;
    }>;
    markAsRead(userId: string, messageIds: string[]): Promise<{
        success: boolean;
        message: string;
        updatedCount: number;
    }>;
}
