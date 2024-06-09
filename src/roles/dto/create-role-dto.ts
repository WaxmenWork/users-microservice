import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {

    @ApiProperty({example: 'ADMIN', description: 'Уникальное значение роли'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly value: string;

    @ApiProperty({example: 'Администратор', description: 'Название роли'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly name: string;

    @ApiProperty({example: true, description: 'Ограничение возможности удаления роли'})
    @IsBoolean({message: "Поле должно быть логическим"})
    readonly isNessessory: boolean;

    @ApiProperty({example: true, description: 'Роль с правами суперпользователя'})
    @IsBoolean({message: "Поле должно быть логическим"})
    readonly isSuperuser: boolean;

    @ApiProperty({example: true, description: 'Роль для получения электронных писем с подтверждением аккаунтов'})
    @IsBoolean({message: "Поле должно быть логическим"})
    readonly isMailReceiver: boolean;

    @ApiProperty({example: false, description: 'Роль без права доступа к ресурсам'})
    @IsBoolean({message: "Поле должно быть логическим"})
    readonly isBlocked: boolean;
}