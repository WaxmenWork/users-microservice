import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/users.model';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { AddRoleDto, CreateUserDto, FileWithBase64Buffer, UpdateUserAdminDto, UpdateUserDto } from './dto';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/models';
import { FilesService } from 'src/files/files.service';
import * as bcrypt from 'bcryptjs';
import { RpcException } from '@nestjs/microservices';
import { Op } from 'sequelize';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User) private userRepository: typeof User,
              private rolesService: RolesService,
              private filesService: FilesService) {}

  async onModuleInit() {
      if (await this.userRepository.count() > 0) return;
      await this.createDefaultUser();
  }

  async createUser(dto: CreateUserDto, file: FileWithBase64Buffer, roleValue: string = "INACTIVE") {
    const candidate = await this.getUserByEmail(dto.email);
    
    if (candidate) {
        throw new RpcException({message: 'Пользователь с таким email существует', status: HttpStatus.BAD_REQUEST})
    }

    const role = await this.rolesService.getRoleByValue(roleValue);

    if (role) {
      const fileName = file ? await this.filesService.createFile(file) : "";
      const hashPassword = await bcrypt.hash(dto.password, 5);
      const user = await this.userRepository.create({...dto, filePath: fileName, password: hashPassword});
      await user.$set('roles', [role.id]);
      user.roles = [role]
      delete user.password
      return user;
    }
    
    throw new RpcException({message: "Роль не найдена", status: HttpStatus.NOT_FOUND});
  }

  async getAllUsers(limit: number = 20, offset: number = 0, search: string | null = null) {

    if (limit == 0) {
      return {
        users: [],
        totalPages: 0,
        currentPage: 0
      };
    }

    let options = {
      attributes: {
        exclude: ['password']
      },
      include: [{
        model: Role,
        attributes: ['id', 'name', 'value'],
        through: {
          attributes: []
        }
      }],
      distinct: true,
      limit,
      offset,
      where: {}
    }

    if (search && search.trim().length > 0) {
      const terms = search.split(' ').map(term => term.trim()).filter(term => term.length > 0);

      const searchConditions = terms.map(term => ({
        [Op.or]: [
          { name: { [Op.iLike]: `%${term}%` } },
          { surname: { [Op.iLike]: `%${term}%` } },
          { patronomic: { [Op.iLike]: `%${term}%` } }
        ]
      }));

      options.where = {
        [Op.and]: searchConditions
      };
    }
    const {count, rows} = await this.userRepository.findAndCountAll(options);

    const totalPages = Math.ceil(count / limit);
    const currentPage = totalPages > 0 ? offset / limit + 1 : 0;
  
    return {
      users: rows,
      totalPages,
      currentPage
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {email},
      attributes: {
        exclude: ['UserRoles']
      },
      include: [{
        model: Role,
        attributes: ['id', 'name', 'value', 'isSuperuser', 'isMailReceiver', 'isBlocked'],
        through: {
          attributes: []
        }
      }],
    });
    return user;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findByPk(id, {
      attributes: {
        exclude: ['UserRoles', 'password']
      },
      include: [{
        model: Role,
        attributes: ['id', 'name', 'value', 'isSuperuser', 'isMailReceiver', 'isBlocked'],
        through: {
          attributes: []
        }
      }],
    });
    return user;
  }

  async getUsersByRole(value: string, limit: number = 20, offset: number = 0) {
    const users = await this.userRepository.findAll({
      attributes: {
        exclude: ['UserRoles', 'password']
      },
      include: [{
        model: Role,
        attributes: ['id', 'name', 'value', 'isNessessory', 'isSuperuser', 'isMailReceiver', 'isBlocked'],
        where: {value},
        through: {
          attributes: []
        }
      }],
      limit,
      offset
    });
    return users;
  }

  async getUsersByRoleFlag(flag: string, limit: number = 20, offset: number = 0) {
    const users = await this.userRepository.findAll({
      attributes: {
        exclude: ['UserRoles', 'password']
      },
      include: [{
        model: Role,
        attributes: ['id', 'name', 'value', 'isNessessory', 'isSuperuser', 'isMailReceiver', 'isBlocked'],
        where: {[flag]: true},
        through: {
          attributes: []
        }
      }],
      limit,
      offset
    });
    return users;
}


  async updateUser(dto: UpdateUserDto | UpdateUserAdminDto, id: number) {

    let data = {...dto};
    if ('password' in dto) {
      const hashPassword = await bcrypt.hash(dto.password, 5);
      data = {...dto, password: hashPassword};
    }
    
    const user = await this.userRepository.update(data, {where: {id}});

    if (user[0] > 0) {
      return dto;
    }

    throw new RpcException({message: 'Пользователь не найден', status: HttpStatus.NOT_FOUND});
  }

  async deleteUser(id: number) {
    const count = await this.userRepository.destroy({where: {id}, cascade: true});

    if (count > 0) {
      return true;
    }

    throw new RpcException({message: 'Пользователь не найден', status: HttpStatus.NOT_FOUND});
  }

  async addRole(dto: AddRoleDto) {
    const user = await this.getUserById(dto.userId);
    const role = await this.rolesService.getRoleByValue(dto.value);
    if (user.roles && user.roles.some(r => r.value === role.value)) {
      throw new RpcException({message: 'Пользователь уже имеет данную роль', status: HttpStatus.BAD_REQUEST});
    }

    if (role && user) {
      await user.$add('role', role.id);
      return dto;
    }

    throw new RpcException({message: 'Пользователь или роль не найдены', status: HttpStatus.NOT_FOUND});
  }

  async removeRole(dto: AddRoleDto) {
    const user = await this.getUserById(dto.userId);
    const role = await this.rolesService.getRoleByValue(dto.value);

    if (role && user) {
      await user.$remove<Role>('role', role.id);
      return dto;
    }

    throw new RpcException({message: 'Пользователь или роль не найдены', status: HttpStatus.NOT_FOUND});
  }

  private async createDefaultUser() {
    if ((await this.rolesService.getAllRoles()).roles.length === 0) {
      await this.rolesService.createDefaultRoles();
    }
    const hashPassword = await bcrypt.hash("admin", 5);
    const user = await this.userRepository.create({
      name: "Имя",
      surname: "Фамилия",
      patronomic: "Отчество",
      email: "admin@admin.ru",
      password: hashPassword,
      filePath: "none",
      organizationName: "Организация"
    })
    await this.addRole({value: "ADMIN", userId: user.id});
    await this.addRole({value: "USER", userId: user.id});
  }

}
