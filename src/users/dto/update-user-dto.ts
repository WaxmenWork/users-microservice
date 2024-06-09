import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {

  @ApiProperty({example: 'user@mail.ru', description: 'Электронная почта'})
  @IsEmail({}, {message: "Некорректный Email"})
  //@IsNotEmpty({message: "Поле не должно быть пустым"})
  readonly email: string;

  //@IsString({message: "Поле должно быть строковым"})
  //@IsNotEmpty({message: "Поле не должно быть пустым"})
  @ApiProperty({example: 'qwerty123', description: 'Пароль'})
  readonly password: string;
}
