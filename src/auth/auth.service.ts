import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, FileWithBase64Buffer } from 'src/users/dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import * as uuid from 'uuid';
import { User } from 'src/users/models';
import { RefreshToken } from './models/refreshToken.model';
import { InjectModel } from '@nestjs/sequelize';
import { ChangePasswordDto, ConfirmUserDto, LoginUserDto, RecoverPasswordDto, RegistrationUserDto } from 'src/auth/dto';
import { Tokens } from './types';
import { MailService } from 'src/mail/mail.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(RefreshToken) private refreshTokenRepository: typeof RefreshToken,
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService) {}

        async login(userDto: LoginUserDto): Promise<Tokens> {
            const user = await this.usersService.getUserByEmail(userDto.email);

            if (!user) {
                throw new RpcException({message: 'Пользователь с таким Email не найден', status: HttpStatus.BAD_REQUEST});
            }

            const isPassEquals = await bcrypt.compare(userDto.password, user.password);
            if (!isPassEquals) {
                throw new RpcException({message: 'Неверный пароль', status: HttpStatus.BAD_REQUEST});
            }

            const tokens = await this.generateTokens(user);
            await this.saveToken(user.id, tokens.refreshToken);

            return {...tokens};
        }
    
        async registration(userDto: RegistrationUserDto, file: FileWithBase64Buffer) {
            const tempPassword = uuid.v4();
            const user = await this.usersService.createUser({...userDto, password: tempPassword}, file);

            const tokens = await this.generateTokens(user);
            await this.saveToken(user.id, tokens.refreshToken);

            const activateUrl = `${process.env.CLIENT_URL}/confirm?token=${tokens.refreshToken}`;
            await this.mailService.sendConfirmationMail(userDto, activateUrl, file);

            return {...tokens}
        }

        async activateUser(dto: ConfirmUserDto) {
            const userData = await this.validateToken(dto.refreshToken);
            const user = await this.usersService.getUserById(userData.id);

            if (user && user.roles.some((role) => role.value === "INACTIVE")) {
                await this.removeToken(user.id);
                await this.usersService.updateUser({email: user.email, password: dto.password}, user.id);
                await this.usersService.addRole({userId: user.id, value: 'USER'});
                await this.usersService.removeRole({userId: user.id, value: 'INACTIVE'});
                await this.mailService.sendActivatedUserMail({...user.dataValues, file: null, password: dto.password});
                return true;
            }

            throw new RpcException({message: 'Пользователь уже активирован', status: HttpStatus.BAD_REQUEST});

        }

        async forgotPassword(dto: RecoverPasswordDto) {
            const user = await this.usersService.getUserByEmail(dto.email);

            if (user && !user.roles.some(role => role.isBlocked)) {
                const tokens = await this.generateTokens(user);
                const url = `${process.env.CLIENT_URL}/Restore_password?token=${tokens.refreshToken}`;
                await this.mailService.sendRecoveryMail({...user.dataValues, file: undefined, password: null}, url)
            }

            throw new RpcException({message: 'Пользователь не найден или заблокирован', status: HttpStatus.NOT_FOUND});
        }

        async changePassword(dto: ChangePasswordDto) {
            const userData = await this.validateToken(dto.refreshToken);
            const user = await this.usersService.getUserById(userData.id);

            if (user && !user.roles.some(role => role.isBlocked)) {
                await this.removeToken(user.id);
                return await this.usersService.updateUser({email: user.email, password: dto.password}, user.id);
            }

            throw new RpcException({message: 'Пользователь не найден или заблокирован', status: HttpStatus.NOT_FOUND});
        }

        async logout(userId: number) {
            const token = await this.removeToken(userId);
            return token;
        }

        async refresh(refreshToken: string) {
            if (!refreshToken) {
                throw new RpcException({message: 'Пользователь не авторизован', status: HttpStatus.UNAUTHORIZED});
            }

            const userData = this.validateToken(refreshToken);
            const tokenFromDb = await this.findToken(refreshToken);
            if (!userData || !tokenFromDb) {
                throw new RpcException({message: 'Пользователь не авторизован', status: HttpStatus.UNAUTHORIZED});
            }

            const user = await this.usersService.getUserByEmail(userData.email);
            if (!user) {
                throw new RpcException({message: 'Пользователь не авторизован', status: HttpStatus.UNAUTHORIZED});
            }

            const tokens = await this.generateTokens(user);
            await this.saveToken(user.id, tokens.refreshToken);

            delete user.password;
            return {...tokens};
        }

        private validateToken(token: string) {
            try {
                const userData = this.jwtService.verify(token, {secret: process.env.JWT_REFRESH_KEY});
                return userData;
            } catch (e) {
                return null;
            }
        }
    
        private async generateTokens(user: User) {
            const payload = { email: user.email, id: user.id, roles: user.roles };

            const [accessToken, refreshToken] = await Promise.all([
                this.jwtService.signAsync(payload,
                    {
                        secret: process.env.JWT_ACCESS_KEY,
                        expiresIn: '30m'
                    }),
                this.jwtService.signAsync(payload,
                    {
                        secret: process.env.JWT_REFRESH_KEY,
                        expiresIn: '30d'
                    })
            ])
    
            return {
                accessToken,
                refreshToken,
            };
        }
    
        private async saveToken(userId: number, refreshToken: string) {
            const tokenData = await this.refreshTokenRepository.findOne({where: {userId}});
            if (tokenData) {
                tokenData.refreshToken = refreshToken;
                return tokenData.save();
            }
            const token = await this.refreshTokenRepository.create({userId, refreshToken});
            return token;
        }
    
        async removeToken(userId: number) {
            const tokenData = await this.refreshTokenRepository.findOne({where: {userId}});
            if (tokenData) {
                await tokenData.destroy();
            }
        }
    
        async findToken(refreshToken: string) {
            const tokenData = await this.refreshTokenRepository.findOne({where: {refreshToken}});
            return tokenData;
        }

        async findTokenById(userId: number) {
            const tokenData = await this.refreshTokenRepository.findOne({where: {userId}});
            return tokenData;
        }
}
