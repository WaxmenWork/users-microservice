import { Controller } from '@nestjs/common';
import { AddRoleDto, CreateUserDto, UpdateUserAdminDto, UpdateUserDto } from './dto';
import { UsersService } from './users.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern({ cmd: "createUser" })
  createUser(req: {body: CreateUserDto, query: {roleValue: string}}) {
    return this.usersService.createUser(req.body, req.body.file, req.query.roleValue);
  }

  @MessagePattern({ cmd: "getAllUsers" })
  getAllUsers(req: {query: {limit: number, offset: number, search: string}}) {
    return this.usersService.getAllUsers(req.query.limit, req.query.offset, req.query.search);
  }

  @MessagePattern({ cmd: "getProfile" })
  getProfile(req: {context: {userId: number}}) {
    return this.usersService.getUserById(req.context.userId);
  }

  @MessagePattern({ cmd: "updateProfile" })
  updateProfile(req: {body: UpdateUserDto, context: {userId: number}}) {
    return this.usersService.updateUser(req.body, req.context.userId);
  }

  @MessagePattern({ cmd: "getUserById" })
  getUserById(req: {param: {id: number}}) {
    return this.usersService.getUserById(req.param.id);
  }

  @MessagePattern({ cmd: "updateProfileById" })
  updateProfileById(req: {body: UpdateUserAdminDto, param: {id: number}}) {
    return this.usersService.updateUser(req.body, req.param.id);
  }

  @MessagePattern({ cmd: "deleteUser" })
  deleteUser(req: {param: {id: number}}) {
    return this.usersService.deleteUser(req.param.id);
  }

  @MessagePattern({ cmd: "addRoleToUser" })
  addRoleToUser(req: {body: AddRoleDto}) {
    return this.usersService.addRole(req.body);
  }

  @MessagePattern({ cmd: "removeRoleFromUser"})
  removeRoleFromUser(req: {body: AddRoleDto}) {
    return this.usersService.removeRole(req.body);
  }
}
