import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateAboutDto {

    @ApiProperty({example: 'Геопортал посвящен...', description: 'Контентное наполнение'})
    @IsString({message: "Поле должно быть строковым"})
    @IsNotEmpty({message: "Поле не должно быть пустым"})
    readonly content: string;
}