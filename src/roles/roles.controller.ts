import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, DeleteRoleDto, UpdateRoleDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class RolesController {
    constructor(private rolesService: RolesService) {}

    @MessagePattern({ cmd: "createRole" })
    createRole(req: {body: CreateRoleDto}) {
        return this.rolesService.createRole(req.body);
    }

    @MessagePattern({ cmd: "getRoleByValue" })
    getRoleByValue(req: {param: {value: string}}) {
        return this.rolesService.getRoleByValue(req.param.value);
    }

    @MessagePattern({ cmd: "getAllRoles" })
    getAllRoles(req: {query: {limit: number, offset: number, search: string}}) {
        return this.rolesService.getAllRoles(req.query.limit, req.query.offset, req.query.search);
    }

    @MessagePattern({ cmd: "deleteRole" })
    deleteRole(req: {body: DeleteRoleDto}) {
        return this.rolesService.deleteRole(req.body);
    }

    @MessagePattern({ cmd: "updateRole" })
    updateRole(req: {body: UpdateRoleDto, param: {value: string}}) {
        return this.rolesService.updateRole(req.body, req.param.value);
    }
}
