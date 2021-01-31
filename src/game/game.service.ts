import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GameService {

    constructor(
        private configService: ConfigService
    ){}


    gameLoop(userTwitch:string){
        return {username: this.configService.get('USERNAME'),password:this.configService.get<string>('OAUTH'), userTwitch};
    }
}
