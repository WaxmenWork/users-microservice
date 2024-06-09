import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_SERVICE,
          port: parseInt(process.env.MAIL_SERVICE_PORT),
          auth: {
            user: process.env.MAIL_SENDER,
            pass: process.env.MAIL_PASSWORD
          },
          secure: true,
          ignoreTLS: true
        }
      })
    }),
    UsersModule
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
