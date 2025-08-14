import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class MarkAsReadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  messageIds: string[];
}
