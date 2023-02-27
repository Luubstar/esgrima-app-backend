import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

const version = "0.7.0";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getVersion():string{
    return version;
  }
}

  
  