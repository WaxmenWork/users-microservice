import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto, DeleteRoleDto, UpdateRoleDto } from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './models/roles.model';
import { UserRoles } from './models/user-roles.model';
import { RpcException } from '@nestjs/microservices';
import { Op } from 'sequelize';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role) private roleRepository: typeof Role,
        @InjectModel(UserRoles) private userRolesRepository: typeof UserRoles
        ) {}


    async createRole(dto: CreateRoleDto) {
        const res = await this.getRoleByValue(dto.value);
        if (res) {
            throw new RpcException({message: 'Роль с таким значением уже существует', status: HttpStatus.BAD_REQUEST});
        }
        const role = await this.roleRepository.create(dto);
        return role;
    }

    async getRoleByValue(value: string) {
        const role = await this.roleRepository.findOne({where: {value}});
        return role;
    }

    async getAllRoles(limit: number = 20, offset: number = 0, search: string | null = null) {

        if (limit == 0) {
            return {
                roles: [],
                totalPages: 0,
                currentPage: 0,
            }
        }

        let options = {
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
                    { value: { [Op.iLike]: `%${term}%` } }
                ]
            }));
      
            options.where = {
                [Op.and]: searchConditions
            };
        }

        const {count, rows} = await this.roleRepository.findAndCountAll(options);

        const totalPages = Math.ceil(count / limit);
        const currentPage = totalPages > 0 ? offset / limit + 1 : 0;
  
        return {
            roles: rows,
            totalPages,
            currentPage
        };
    }

    async deleteRole(dto: DeleteRoleDto) {
        const role = await this.roleRepository.findOne({where: {value: dto.value}});
        if (role && !role.isNessessory) {
            await this.userRolesRepository.destroy({where: {id: role.id}});
            await this.roleRepository.destroy({where: {id: role.id}});
            return dto;
        }

        throw new RpcException({message: 'Роль не найдена или недоступна для удаления', status: HttpStatus.NOT_FOUND});
    }

    async updateRole(dto: UpdateRoleDto, value: string) {
        const role = await this.roleRepository.update(dto, {where: {value}});
        if (role[0] > 0) {
            return dto;
        }

        throw new RpcException({message: 'Роль не найдена', status: HttpStatus.NOT_FOUND});
    }

    async createDefaultRoles() {
        const defaultRoles = [
            {value: "ADMIN", name: "Администратор", isNessessory: true, isSuperuser: true, isMailReceiver: false, isBlocked: false},
            {value: "USER", name: "Пользователь", isNessessory: true, isSuperuser: false, isMailReceiver: false, isBlocked: false},
            {value: "MAIL", name: "Приём электронных писем", isNessessory: true, isSuperuser: false, isMailReceiver: true, isBlocked: false},
            {value: "INACTIVE", name: "Требует активации", isNessessory: true, isSuperuser: false, isMailReceiver: false, isBlocked: true},
            {value: "BANNED", name: "Заблокированный пользователь", isNessessory: true, isSuperuser: false, isMailReceiver: false, isBlocked: true}
        ]
        defaultRoles.forEach(async role => await this.createRole(role));
    }
}
