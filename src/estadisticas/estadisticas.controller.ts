import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Req } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto';
import { UpdateEstadisticaDto } from './dto/update-estadistica.dto';
import { UsuarioService } from 'src/usuarios/usuario.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {Request } from "express";

@Controller('estadisticas')
@ApiTags('estadisticas')

export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}
  @Inject(UsuarioService)
  private readonly usuario;

  async GetIDByLoggin(correo : string, clave : string):Promise<String> {
    var res = this.usuario.checkIfLogged(correo, clave);
    if (res.startsWith("ACTIVADO")) {return res.split("/")[1];}
    return "";
  }

  @ApiOperation({summary: "Crea una estadística para un usuario"})
  @Post(":correo/:clave")
  async create(@Body() createEstadisticaDto: CreateEstadisticaDto, @Param("correo") correo:string, @Param("clave") clave:string) {
      var res = await this.GetIDByLoggin(correo, clave);
      if (res.length > 0){
        createEstadisticaDto["Usuario"] = res.toString();
        return this.estadisticasService.create(createEstadisticaDto);
      }
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
