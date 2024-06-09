import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/users.model';
import { Role } from 'src/roles/models';
import { RolesModule } from 'src/roles/roles.module';
import { FilesModule } from 'src/files/files.module';
import { RefreshToken } from 'src/auth/models';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    SequelizeModule.forFeature([User, Role, RefreshToken]),
    RolesModule,
    FilesModule
  ],
  exports: [
    UsersService
  ]
})
export class UsersModule {}
