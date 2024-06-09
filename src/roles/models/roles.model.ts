import { ApiProperty } from '@nestjs/swagger';
import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/models';
import { UserRoles } from './';

interface RoleCreationAttributes {
  value: string;
  name: string;
  isNessessory: boolean;
  isSuperuser: boolean;
  isMailReceiver: boolean;
  isBlocked: boolean;
}

@Table({ tableName: 'roles' })
export class Role extends Model<Role, RoleCreationAttributes> {

  @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: 'ADMIN', description: 'Уникальное значение роли'})
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  value: string;

  @ApiProperty({example: 'Администратор', description: 'Название роли'})
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({example: true, description: 'Ограничение возможности удаления роли'})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  isNessessory: boolean;

  @ApiProperty({example: true, description: 'Роль с правами суперпользователя'})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  isSuperuser: boolean;

  @ApiProperty({example: true, description: 'Роль для получения электронных писем с подтверждением аккаунтов'})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  isMailReceiver: boolean;

  @ApiProperty({example: false, description: 'Роль без права доступа к ресурсам'})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  isBlocked: boolean;

  @BelongsToMany(() => User, () => UserRoles)
  users: User[];
}
