import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/message-entities';
import { Repository } from 'typeorm';
import { In } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  private validateMessageIds(messageIds: string[]): void {
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      throw new BadRequestException('Message IDs array is required and cannot be empty');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    for (const messageId of messageIds) {
      if (!messageId || messageId === 'null' || messageId === 'undefined') {
        throw new BadRequestException('Invalid message ID provided');
      }
      
      if (!uuidRegex.test(messageId)) {
        throw new BadRequestException(`Invalid message ID format: ${messageId}`);
      }
    }
  }

  async SendMessage(senderId: string, recipientId: string, content: string) {
    // Validate senderId and recipientId
    if (!senderId || senderId === 'null' || senderId === 'undefined') {
      throw new BadRequestException('Invalid sender ID provided');
    }

    if (!recipientId || recipientId === 'null' || recipientId === 'undefined') {
      throw new BadRequestException('Invalid recipient ID provided');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(senderId)) {
      throw new BadRequestException('Invalid sender ID format');
    }

    if (!uuidRegex.test(recipientId)) {
      throw new BadRequestException('Invalid recipient ID format');
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const message = this.messageRepo.create({
      senderId,
      recipientId,
      content: content.trim(),
    });

    const savedMessage = await this.messageRepo.save(message);

    return {
      success: true,
      message: 'Message sent successfully',
      data: savedMessage,
    };
  }

  async getConversations(userA: string, userB: string) {
    // Validate user IDs
    if (!userA || userA === 'null' || userA === 'undefined') {
      throw new BadRequestException('Invalid user A ID provided');
    }

    if (!userB || userB === 'null' || userB === 'undefined') {
      throw new BadRequestException('Invalid user B ID provided');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(userA)) {
      throw new BadRequestException('Invalid user A ID format');
    }

    if (!uuidRegex.test(userB)) {
      throw new BadRequestException('Invalid user B ID format');
    }

    const conversations = await this.messageRepo.find({
      where: [
        { senderId: userA, recipientId: userB },
        { senderId: userB, recipientId: userA },
      ],
      order: { createdAt: 'ASC' },
    });

    return {
      success: true,
      data: conversations,
      count: conversations.length,
    };
  }

  async markAsRead(userId: string, messageIds: string[]) {
    // Validate message IDs before processing
    this.validateMessageIds(messageIds);

    // Validate userId
    if (!userId || userId === 'null' || userId === 'undefined') {
      throw new BadRequestException('Invalid user ID provided');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    await this.messageRepo.update(
      {
        recipientId: userId,
        messageId: In(messageIds),
      },
      {
        isRead: true,
      },
    );

    return {
      success: true,
      message: 'Messages marked as read successfully',
      updatedCount: messageIds.length,
    };
  }
}
