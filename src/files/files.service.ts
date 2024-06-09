import { HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { FileWithBase64Buffer } from 'src/users/dto';
import { RpcException } from '@nestjs/microservices';

const requiredExts = ['.doc', '.docx', '.pdf', '.obt', '.jpeg', '.jpg', '.png'];
const maxSize = 10 * 1024 * 1024; //10 mb

@Injectable()
export class FilesService {

    async createFile(file: FileWithBase64Buffer): Promise<string> {
        try {
            const fileExt = path.extname(file.originalname);
            if (!requiredExts.includes(fileExt)) {
                throw new RpcException({message: 'Формат файла не поддерживается', status: HttpStatus.BAD_REQUEST});
            }
            if (file.size > maxSize) {
                throw new RpcException({message: 'Слишком большой файл', status: HttpStatus.BAD_REQUEST});
            }
            const fileName = uuid.v4() + fileExt;
            const filePath = path.resolve(__dirname, '..', '..', 'static');
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {recursive: true});
            }
            fs.writeFileSync(path.join(filePath, fileName), Buffer.from(file.buffer, 'base64'));
            return fileName;
        } catch(e) {
            console.log(e);
            if (e.response && e.status !== HttpStatus.INTERNAL_SERVER_ERROR){
                throw new RpcException({message: e.response, status: e.status});
            }
            throw new RpcException({message: 'Ошибка при записи файла', status: HttpStatus.INTERNAL_SERVER_ERROR})
        }
    }
}
