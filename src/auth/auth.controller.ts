import { Controller } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ConfirmUserDto, LoginUserDto, RecoverPasswordDto, RegistrationUserDto } from 'src/auth/dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {

    constructor(private authService: AuthService) {}

    @MessagePattern({ cmd: "login" })
    login(req: {body: LoginUserDto}) {
        return this.authService.login(req.body);
    }

    @MessagePattern({ cmd: "registration" })
    registration(req: {body: RegistrationUserDto}) {
        return this.authService.registration(req.body, req.body.file);
    }

    @MessagePattern({ cmd: "logout" })
    logout(req: {context: {userId: number}}) {
        return this.authService.logout(req.context.userId);
    }

    @MessagePattern({ cmd: "refresh" })
    refresh(req: {context: {refreshToken: string}}) {
        return this.authService.refresh(req.context.refreshToken);
    }

    @MessagePattern({ cmd: "confirm" })
    confirm(req: {body: ConfirmUserDto}) {
        return this.authService.activateUser(req.body);
    }

    @MessagePattern({ cmd: "forgotPassword" })
    forgotPassword(req: {body: RecoverPasswordDto}) {
        return this.authService.forgotPassword(req.body);
    }

    @MessagePattern({ cmd: "changePassword" })
    changePassword(req: {body: ChangePasswordDto}) {
        return this.authService.changePassword(req.body);
    }

}
