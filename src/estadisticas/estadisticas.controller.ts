import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Req } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto';
import { UpdateEstadisticaDto } from './dto/update-estadistica.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {Request } from "express";
import { UsuarioController } from 'src/usuarios/usuario.controller';

@Controller('estadisticas')
@ApiTags('estadisticas')

export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}
  @Inject(UsuarioController)
  private readonly usuario;

  async GetIDByLoggin(correo : string, clave : string):Promise<String> {
    var res = await this.usuario.checkIfLogged(correo, clave);
    if (res.startsWith("ACEPTADO")) {return res.split("/")[1];}
    return "";
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
        return this.estadisticasService.create(createEstadisticaDto);
        }
        else{
          return "REPETIDO";
        }
      }
      else {return "ERROR"}
  }

  @ApiOperation({summary: "Devuelve todas las estadísticas"})
  @Get()
  async findAll(@Req() request: Request) {
    return this.estadisticasService.findAll(request);
  }

  @ApiOperation({summary: "Encuentra una estadística por id"})
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.estadisticasService.findOne(id);
  }

  @ApiOperation({summary: "Actualiza una estadistica por ID"})
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEstadisticaDto: UpdateEstadisticaDto) {
    return this.estadisticasService.update(id, updateEstadisticaDto);
  }

  @ApiOperation({summary: "Elimina una estadistica"})
  @Delete(':correo/:clave/:id')
  async remove(@Param('id') id: string,@Param("correo") correo:string, @Param("clave") clave:string) {
    if ((await this.GetIDByLoggin(correo, clave)).length > 0){
    return this.estadisticasService.remove(id);}
  }
}
