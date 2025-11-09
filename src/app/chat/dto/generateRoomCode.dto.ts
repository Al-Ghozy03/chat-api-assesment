import { IsNotEmpty, IsNumber } from 'class-validator';

export class GenerateRoomcodeDto {
  @IsNotEmpty()
  @IsNumber()
  user_1: number;

  @IsNotEmpty()
  @IsNumber()
  user_2: number;
}
