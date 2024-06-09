import { Controller } from '@nestjs/common';
import { AboutService } from './about.service';
import { MessagePattern } from '@nestjs/microservices';
import { UpdateAboutDto } from './dto';

@Controller()
export class AboutController {
    constructor(private aboutService: AboutService) {}

    @MessagePattern({ cmd: "getAbout" })
    getAbout() {
        return this.aboutService.getAbout();
    }

    @MessagePattern({ cmd: "updateAbout" })
    updateAbout(req: {body: UpdateAboutDto}) {
        return this.aboutService.updateAbout(req.body);
    }
}
