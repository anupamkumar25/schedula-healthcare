import { IsUUID, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  recipientId: string;

  @IsString()
  @MinLength(1)
  content: string;
}
