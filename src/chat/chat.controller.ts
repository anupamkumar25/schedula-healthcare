import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SendMessageDto,
  ) {
    const senderId = req.user.userId;
    return await this.chatService.SendMessage(
      senderId,
      dto.recipientId,
      dto.content,
    );
  }

  @Get('history/:otherUserId')
  async getConversations(
    @Request() req: AuthenticatedRequest,
    @Param('otherUserId') otherUserId: string,
  ) {
    const myId = req.user.userId;
    return await this.chatService.getConversations(myId, otherUserId);
  }

  @Post('read')
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Body() dto: MarkAsReadDto,
  ) {
    const myId = req.user.userId;
    return await this.chatService.markAsRead(myId, dto.messageIds);
  }
}
