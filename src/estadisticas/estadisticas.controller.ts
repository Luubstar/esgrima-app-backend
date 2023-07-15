import { Controller, Get, Param, Req, HttpStatus, HttpException, Res} from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Request, Response } from "express";
import { Estadisticas } from './schemas/estadistica.schema';

@Controller('estadisticas')
@ApiTags('estadisticas')


export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @ApiOkResponse({description:"Las estadisticas", isArray:true,type:Estadisticas})
  @ApiOperation({summary: "Devuelve todas las estadísticas"})
  @Get()
  async findAll(@Req() request: Request, @Res() res : Response) {
    res.status(HttpStatus.OK).send(await this.estadisticasService.findAll(request));
  }

  @ApiOperation({summary: "Encuentra una estadística por id"})
  @ApiOkResponse({description:"La estadistica (si la encuentra)", type:Estadisticas})
  @Get(':id')
  async findOne(@Param('id') id: string,@Res() res : Response) {
    res.status(HttpStatus.OK).send(await this.estadisticasService.findOne(id));
  }

  @ApiOkResponse({description:"La estadistica (si la encuentra)", type:Estadisticas})
  @ApiOperation({summary: "Encuentra una estadística dado un usuario, mes y año"})
  @Get(':userID/:month/:year')
  async GetByUser(@Param('userID') id: string,@Param("month") mes:number, @Param("year") año:number,@Res() res : Response) {res.status(HttpStatus.OK).send(await this.estadisticasService.getFromUser(id,mes,año));}
}