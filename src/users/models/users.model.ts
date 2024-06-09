import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, BelongsToMany, Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';
import { RefreshToken } from 'src/auth/models';
import { Role, UserRoles } from 'src/roles/models';

interface UserCreationAttributes {
  email: string;
  password: string;
  name: string;
  surname: string;
  patronomic: string;
  organizationName: string;
  filePath: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttributes> {

  @ApiProperty({example: '1', description: 'Уникальный идентификатор'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: 'Иван', description: 'Имя'})
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({example: 'Иванов', description: 'Фамилия'})
  @Column({ type: DataType.STRING, allowNull: false })
  surname: string;

  @ApiProperty({example: 'Иванович', description: 'Отчество'})
  @Column({ type: DataType.STRING, allowNull: false })
  patronomic: string;

  @ApiProperty({example: 'user@mail.ru', description: 'Электронная почта'})
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  //@ApiProperty({example: 'qwerty123', description: 'Пароль'})
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  password: string;

  @ApiProperty({example: 'Yandex', description: 'Название организации'})
  @Column({ type: DataType.STRING, allowNull: false })
  organizationName: string;

  @ApiProperty({example: 'document.pdf', description: 'Путь к заявке на регистрацию'})
  @Column({ type: DataType.STRING, allowNull: false })
  filePath: string;

  @ApiProperty({example: [{id: 1, value: 'ADMIN', name: 'Администратор'}], description: 'Список ролей пользователя'})
  @BelongsToMany(() => Role, () => UserRoles)
  roles: Role[];

  @HasOne(() => RefreshToken, {onDelete: 'CASCADE'})
  refreshToken: RefreshToken;
}
