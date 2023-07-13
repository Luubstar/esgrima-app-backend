import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Req, HttpStatus, HttpException } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto';
import { UpdateEstadisticaDto } from './dto/update-estadistica.dto';
import { ApiHideProperty, ApiOperation, ApiTags } from '@nestjs/swagger';
import {Request } from "express";
import { UsuarioController } from 'src/usuarios/usuario.controller';

@Controller('estadisticas')
@ApiTags('estadisticas')

//TODO: Debo mejorar esto...

export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}
  @Inject(UsuarioController)
  private readonly usuario;

  async GetIDByLoggin(correo : string, clave : string):Promise<String> {
    var res = await this.usuario.checkIfLogged(correo, clave);
    return res;
  }

  @ApiOperation({summary: "Crea una estadística para un usuario"})
  @Post(":correo/:clave")
  async create(@Body() createEstadisticaDto: CreateEstadisticaDto, @Param("correo") correo:string, @Param("clave") clave:string) {
      var res = await this.GetIDByLoggin(correo, clave);
      var date = new Date();
      if (res.length > 0)
      {
        if (!(await this.estadisticasService.checkIfMultiple(res.toString(), date.getMonth(), date.getFullYear()))){
        createEstadisticaDto["Usuario"] = res.toString();
        createEstadisticaDto["Mes"] = date.getMonth();
        createEstadisticaDto["Año"] = date.getFullYear();
        throw new HttpException(this.estadisticasService.create(createEstadisticaDto),HttpStatus.OK);
        }
        else{
          throw new HttpException("Ya existen estadísticas con ese mes y año para el usuario",HttpStatus.CONFLICT)
        }
      }
      else {throw new HttpException("Usuario no encontrado",HttpStatus.BAD_REQUEST)}
  }

  @ApiOperation({summary: "Devuelve todas las estadísticas"})
  @Get()
  async findAll(@Req() request: Request) {
    throw new HttpException(this.estadisticasService.findAll(request),HttpStatus.OK);
  }

  @ApiOperation({summary: "Encuentra una estadística por id"})
  @Get(':id')
  async findOne(@Param('id') id: string) {
    throw new HttpException(this.estadisticasService.findOne(id),HttpStatus.OK);
  }

  @ApiOperation({summary: "Encuentra una estadística dado un usuario, mes y año"})
  @Get(':userID/:month/:year')
  async GetByUser(@Param('userID') id: string,@Param("month") mes:number, @Param("year") año:number) {
    throw new HttpException(this.estadisticasService.getFromUser(id,mes,año),HttpStatus.OK);
  }

  @ApiOperation({summary: "Actualiza una estadistica por ID"})
  @ApiHideProperty()
  @Patch(':correo/:clave/:id')
  async update(@Param('id') id: string,@Param("correo") correo:string, @Param("clave") clave:string, @Body() updateEstadisticaDto: UpdateEstadisticaDto) {
    if ((await this.GetIDByLoggin(correo, clave)).length > 0){
      throw new HttpException(this.estadisticasService.update(id, updateEstadisticaDto),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary: "Elimina una estadistica"})
  @ApiHideProperty()
  @Delete(':correo/:clave/:id')
  async remove(@Param('id') id: string,@Param("correo") correo:string, @Param("clave") clave:string) {
    if ((await this.GetIDByLoggin(correo, clave)).length > 0){
    throw new HttpException(this.estadisticasService.remove(id),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }
}
