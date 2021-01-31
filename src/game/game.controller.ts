import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}



  @Get('/')
  @Render('index')
  getGame(@Query('userTwitch') userTwitch: string){
    return this.gameService.gameLoop(userTwitch);
  }
}
