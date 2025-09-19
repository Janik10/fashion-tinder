import { IsString, IsUUID } from 'class-validator';

export class InteractionParamDto {
  @IsUUID()
  itemId: string;
}

export class UserIdDto {
  @IsString()
  id: string;
}