import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangePasswordDto {

    @ApiProperty({example: 'refreshToken', description: 'Токен обновления активируемого пользователя'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly refreshToken: string;

    @ApiProperty({example: 'qwerty123', description: 'Новый пароль'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly password: string;
}