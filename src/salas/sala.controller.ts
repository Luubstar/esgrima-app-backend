import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { SalaService } from './sala.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UsuarioService } from 'src/usuarios/usuario.service';

@Controller('salas')
@ApiTags('salas')
export class SalaController {
  constructor(private readonly usuarioService: SalaService) {}

  @Inject(UsuarioService)
  private readonly usuario;

  @ApiOperation({summary : "Crea una nueva sala"})
  @Post(":correo/:clave")
  async create(@Param("correo") correo:string,@Param("clave") clave:string,@Body() createUsuarioDto: CreateSalaDto) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.create(createUsuarioDto),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);}
  }

  @ApiOperation({summary : "Devuelve todas las salas"})
  @Get()
  findAll(@Req() request: Request) {
    throw new HttpException(this.usuarioService.findAll(request),HttpStatus.OK);
  }

  @ApiOperation({summary : "Obtiene una sala por ID"})
  @Get(':id')
  findOne(@Param('id') id: string) {
    throw new HttpException(this.usuarioService.findOne(id),HttpStatus.OK);
  }

  @ApiOperation({summary : "Actualiza la sala (si tienes los permisos)"})
  @Patch(':correo/:clave/:id')
  async update(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string, @Body() updateUsuarioDto: UpdateSalaDto) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.update(id, updateUsuarioDto),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary : "Elimina una sala (Si tienes los permisos)"})
  @Delete(':correo/:clave/:id')
  async remove(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.remove(id),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary : "Encuentra una sala por nombre"})
  @Get('nombre/:nombre')
  findOneByName(@Param('nombre') id: string) {
    throw new HttpException(this.usuarioService.findOneByName(id),HttpStatus.OK);
  }

  @ApiOperation({summary : "Actualiza una sala por nombre"})
  @Patch('nombre/:correo/:clave/:nombre')
  async updatebyName(@Param("correo") correo:string,@Param("clave") clave:string, @Param('nombre') id: string, @Body() updateUsuarioDto: UpdateSalaDto) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.updatebyName(id, updateUsuarioDto),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }
  
}
