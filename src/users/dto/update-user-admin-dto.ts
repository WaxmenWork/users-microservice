import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Readable } from "stream";
import { FileWithBase64Buffer } from ".";

export class UpdateUserAdminDto {

  @ApiProperty({example: 'user@mail.ru', description: 'Электронная почта'})
  @IsEmail({}, {message: "Некорректный Email"})
  readonly email: string;

  //@IsString({message: "Поле должно быть строковым"})
  @ApiProperty({example: 'qwerty123', description: 'Пароль'})
  readonly password: string;

  @IsString({message: "Поле должно быть строковым"})
  @ApiProperty({example: 'Иван', description: 'Имя'})
  readonly name: string;

  @IsString({message: "Поле должно быть строковым"})
  @ApiProperty({example: 'Иванов', description: 'Фамилия'})
  readonly surname: string;

  @IsString({message: "Поле должно быть строковым"})
  @ApiProperty({example: 'Иванович', description: 'Отчество'})
  readonly patronomic: string;

  @IsString({message: "Поле должно быть строковым"})
  @ApiProperty({example: 'Yandex', description: 'Название организации'})
  readonly organizationName: string;

  @ApiProperty({example: 'document.pdf', description: 'Документ с заявкой на регистрацию'})
  readonly file: FileWithBase64Buffer;
}
