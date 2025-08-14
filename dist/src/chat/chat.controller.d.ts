import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
    };
}
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    sendMessage(req: AuthenticatedRequest, dto: SendMessageDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/message-entities").Message;
    }>;
    getConversations(req: AuthenticatedRequest, otherUserId: string): Promise<{
        success: boolean;
        data: import("../entities/message-entities").Message[];
        count: number;
    }>;
    markAsRead(req: AuthenticatedRequest, dto: MarkAsReadDto): Promise<{
        success: boolean;
        message: string;
        updatedCount: number;
    }>;
}
export {};
