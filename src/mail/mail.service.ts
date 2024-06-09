import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CreateUserDto, FileWithBase64Buffer } from 'src/users/dto';
import * as path from 'path';
import { UsersService } from 'src/users/users.service';
import { RegistrationUserDto } from 'src/auth/dto';

@Injectable()
export class MailService {

    constructor(
        private readonly mailerService: MailerService,
        private readonly usersService: UsersService
    ) {}

    async sendConfirmationMail(dto: RegistrationUserDto, url: string, file: FileWithBase64Buffer) {
        const fileBase64 = file.buffer;
        const emailReceivers = await this.usersService.getUsersByRoleFlag("isMailReceiver");
        for (const receiver of emailReceivers){
            await this.mailerService.sendMail({
                to: receiver.email,
                from: `"Система геопортала «Спутниковый мониторинг БПТ»" <${process.env.MAIL_SENDER}>`,
                subject: `Подтверждение регистрации пользователя ${dto.name} ${dto.patronomic.charAt(0)}. ${dto.surname.charAt(0)}.`,
                html: `<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; width: 500px; padding: 0; box-sizing: border-box; display: block; margin: 0;">
                            <div style="background-color: #0051ff; height: 4em; display: flex; padding-left: 1em; align-items: center">
                                <h3 style="color: white;">Подтвердждение регистрации</h3>
                            </div>
                            <div style="padding: 1.5em;">
                                <p>Пользователь <strong>${dto.surname} ${dto.name} ${dto.patronomic}</strong> подал заявку на регистрацию.</p>
                                <p>К данному письму прикреплён документ с заявкой на регистрацию, после проверки которой, вы можете подтвердить регистрацию аккаунта.</p>
                                <p><strong>Подтвердите аккаунт, нажав кнопку ниже:</strong></p>
                                <a href="${url}" style="display: inline-block; background-color: #0051ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Подтвердить аккаунт</a>
                                <br/><br/>
                                <p>Вы также можете связаться с данным пользователем по Email: ${dto.email}</p>
                            </div>
                        </div>`,
                attachments: [{
                    filename: `Заявка_${dto.surname}_${dto.name}_${dto.patronomic}.${path.extname(file.originalname)}`,
                    content: fileBase64,
                    encoding: 'base64',
                }]
            });
        }
    }

    async sendActivatedUserMail(dto: CreateUserDto) {
        await this.mailerService.sendMail({
            to: dto.email,
            from: `"Система геопортала «Спутниковый мониторинг БПТ»" <${process.env.MAIL_SENDER}>`,
            subject: 'Ваш аккаунт подтверждён',
            html: `<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; width: 500px; padding: 0; box-sizing: border-box; display: block; margin: 0;">
                        <div style="background-color: #0051ff; height: 4em; display: flex; padding-left: 1em; align-items: center">
                            <h3 style="color: white;">Уважаемый(-ая) ${dto.name} ${dto.surname.charAt(0)},</h3>
                        </div>
                        <div style="padding: 1.5em;">
                            <p>Ваша заявка на регистрацию на сайте спутникового мониторинга БПТ была подтверждена.</p>
                            <p>Для Вас теперь доступны все возможности геопортала.</p>
                            <p>Ваши данные для входа:<br/>Email: <strong>${dto.email}</strong><br/>Пароль: <strong>${dto.password}</strong></p>
                            <p><strong>Нажмите на кнопку, чтобы перейти на страницу авторизации</strong></p>
                            <a href="${process.env.CLIENT_URL}" style="display: inline-block; background-color: #0051ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Перейти</a>
                        </div>
                    </div>`,
        });
    }

    async sendRecoveryMail(dto: CreateUserDto, url: string) {
        await this.mailerService.sendMail({
            to: dto.email,
            from: `"Система геопортала «Спутниковый мониторинг БПТ»" <${process.env.MAIL_SENDER}>`,
            subject: `Восстановление доступа пользователя ${dto.name} ${dto.patronomic.charAt(0)}. ${dto.surname.charAt(0)}.`,
            html: `<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; width: 500px; padding: 0; box-sizing: border-box; display: block; margin: 0;">
                        <div style="background-color: #0051ff; height: 4em; display: flex; padding-left: 1em; align-items: center">
                            <h3 style="color: white;">Смена пароля</h3>
                        </div>
                        <div style="padding: 1.5em;">
                            <p>${dto.surname} ${dto.name} ${dto.patronomic}, Ваша почта ${dto.email} была указана для восстановления пароля.</p>
                            <p><strong>Если это были не вы, проигнорируйте данное сообщение.</strong></p>
                            <a href="${url}" style="display: inline-block; background-color: #0051ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Сменить пароль</a>
                        </div>
                    </div>`,
        });
    }
}
