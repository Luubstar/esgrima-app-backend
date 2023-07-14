import { Controller, Get, Body, Param, Req, HttpStatus, HttpException } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto';
import { UpdateEstadisticaDto } from './dto/update-estadistica.dto';
import { ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Request } from "express";
import { Estadisticas } from './schemas/estadistica.schema';

@Controller('estadisticas')
@ApiTags('estadisticas')


export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  //Server Only!
  async create(@Body() createEstadisticaDto: CreateEstadisticaDto, Usuario:string) {
      var date = new Date();
      if (Usuario.length > 0)
      {
        if (!(await this.estadisticasService.checkIfMultiple(Usuario.toString(), date.getMonth(), date.getFullYear()))){
          createEstadisticaDto["Usuario"] = Usuario.toString();
          createEstadisticaDto["Mes"] = date.getMonth();
          createEstadisticaDto["Año"] = date.getFullYear();
          throw new HttpException(this.estadisticasService.create(createEstadisticaDto),HttpStatus.ACCEPTED);
        }
        else{throw new HttpException("Ya existen estadísticas con ese mes y año para el usuario",HttpStatus.CONFLICT)}
      }
      else {throw new HttpException("Usuario no indicado",HttpStatus.UNAUTHORIZED)}
  }

  @ApiOkResponse({description:"Las estadisticas", isArray:true,type:Estadisticas})
  @ApiOperation({summary: "Devuelve todas las estadísticas"})
  @Get()
  async findAll(@Req() request: Request) {
    throw new HttpException(this.estadisticasService.findAll(request),HttpStatus.OK);
  }

  @ApiOperation({summary: "Encuentra una estadística por id"})
  @ApiOkResponse({description:"La estadistica (si la encuentra)", type:Estadisticas})
  @Get(':id')
  async findOne(@Param('id') id: string) {
    throw new HttpException(this.estadisticasService.findOne(id),HttpStatus.OK);
  }

  @ApiOkResponse({description:"La estadistica (si la encuentra)", type:Estadisticas})
  @ApiOperation({summary: "Encuentra una estadística dado un usuario, mes y año"})
  @Get(':userID/:month/:year')
  async GetByUser(@Param('userID') id: string,@Param("month") mes:number, @Param("year") año:number) {throw new HttpException(this.estadisticasService.getFromUser(id,mes,año),HttpStatus.OK);}

  //Server Only!
  async update(id: string, @Body() updateEstadisticaDto: UpdateEstadisticaDto) {throw new HttpException(this.estadisticasService.update(id, updateEstadisticaDto),HttpStatus.OK);}

  //Server Only!
  async remove(id: string) {throw new HttpException(this.estadisticasService.remove(id),HttpStatus.OK);}
}