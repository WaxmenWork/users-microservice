import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RecoverPasswordDto {

    @ApiProperty({example: 'user@mail.ru', description: 'Почта зарегистрированного пользователя'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly email: string;
}