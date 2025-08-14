"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const message_entities_1 = require("../entities/message-entities");
const typeorm_2 = require("typeorm");
const typeorm_3 = require("typeorm");
let ChatService = class ChatService {
    messageRepo;
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    validateMessageIds(messageIds) {
        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            throw new common_1.BadRequestException('Message IDs array is required and cannot be empty');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        for (const messageId of messageIds) {
            if (!messageId || messageId === 'null' || messageId === 'undefined') {
                throw new common_1.BadRequestException('Invalid message ID provided');
            }
            if (!uuidRegex.test(messageId)) {
                throw new common_1.BadRequestException(`Invalid message ID format: ${messageId}`);
            }
        }
    }
    async SendMessage(senderId, recipientId, content) {
        if (!senderId || senderId === 'null' || senderId === 'undefined') {
            throw new common_1.BadRequestException('Invalid sender ID provided');
        }
        if (!recipientId || recipientId === 'null' || recipientId === 'undefined') {
            throw new common_1.BadRequestException('Invalid recipient ID provided');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(senderId)) {
            throw new common_1.BadRequestException('Invalid sender ID format');
        }
        if (!uuidRegex.test(recipientId)) {
            throw new common_1.BadRequestException('Invalid recipient ID format');
        }
        if (!content || content.trim().length === 0) {
            throw new common_1.BadRequestException('Message content cannot be empty');
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
    async getConversations(userA, userB) {
        if (!userA || userA === 'null' || userA === 'undefined') {
            throw new common_1.BadRequestException('Invalid user A ID provided');
        }
        if (!userB || userB === 'null' || userB === 'undefined') {
            throw new common_1.BadRequestException('Invalid user B ID provided');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userA)) {
            throw new common_1.BadRequestException('Invalid user A ID format');
        }
        if (!uuidRegex.test(userB)) {
            throw new common_1.BadRequestException('Invalid user B ID format');
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
    async markAsRead(userId, messageIds) {
        this.validateMessageIds(messageIds);
        if (!userId || userId === 'null' || userId === 'undefined') {
            throw new common_1.BadRequestException('Invalid user ID provided');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            throw new common_1.BadRequestException('Invalid user ID format');
        }
        await this.messageRepo.update({
            recipientId: userId,
            messageId: (0, typeorm_3.In)(messageIds),
        }, {
            isRead: true,
        });
        return {
            success: true,
            message: 'Messages marked as read successfully',
            updatedCount: messageIds.length,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entities_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map