import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation} from '@nestjs/swagger';

const version = "0.7.0";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({summary:"Devuelve la versión actual"})
  getVersion():string{
    return version;
  }
}

  
  