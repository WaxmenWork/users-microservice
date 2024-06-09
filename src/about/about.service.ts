import { HttpStatus, Injectable } from '@nestjs/common';
import { About } from './models';
import { RpcException } from '@nestjs/microservices';
import { UpdateAboutDto } from './dto';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AboutService {
    constructor(@InjectModel(About) private aboutRepository: typeof About) {}

    async getAbout() {
        const about = await this.aboutRepository.findByPk(1);

        if (about) {
            return about;
        }

        throw new RpcException({message: "Контент для 'О геопортале' не найден", status: HttpStatus.NOT_FOUND});
    }

    async updateAbout(dto: UpdateAboutDto) {
        const [about, created] = await this.aboutRepository.upsert({...dto, id: 1}, {conflictWhere: {id: 1}, returning: true});

        if (about) {
            return about;
        }

        throw new RpcException({message: 'Ошибка обновления данных', status: HttpStatus.BAD_REQUEST});
    }
}
