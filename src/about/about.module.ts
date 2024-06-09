import { Module } from '@nestjs/common';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { About } from './models';

@Module({
  controllers: [AboutController],
  providers: [AboutService],
  imports: [
    SequelizeModule.forFeature([About]),
  ]
})
export class AboutModule {}
