import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class ConfirmUserDto {

    @ApiProperty({example: 'refreshToken', description: 'Токен обновления активируемого пользователя'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly refreshToken: string;

    @ApiProperty({example: 'qwerty123', description: 'Новый пароль для активируемого пользователя'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly password: string;
}