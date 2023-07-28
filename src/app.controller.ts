import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation} from '@nestjs/swagger';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  public version = "0.9.0"; 

  @Get()
  @ApiOperation({summary:"Devuelve la versión actual"})
  getVersion():string{
    return this.version;
  }
}

  
  