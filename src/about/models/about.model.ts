import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript";

interface AboutCreationAttributes {
    id: number;
    content: string;
}

@Table({tableName: 'about'})
export class About extends Model<About, AboutCreationAttributes> {
    
    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'Геопортал посвящен...', description: 'Контентное наполнение'})
    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;
}