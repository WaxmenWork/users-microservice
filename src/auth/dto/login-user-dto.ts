import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty } from "class-validator";


export class LoginUserDto {

  @ApiProperty({example: 'user@mail.ru', description: 'Электронная почта'})
  @IsEmail({}, {message: "Некорректный Email"})
  @IsNotEmpty({message: "Поле не должно быть пустым"})
  readonly email: string;

  @ApiProperty({example: 'qwerty123', description: 'Пароль'})
  @IsString({message: "Поле должно быть строковым"})
  @IsNotEmpty({message: "Поле не должно быть пустым"})
  readonly password: string;
}