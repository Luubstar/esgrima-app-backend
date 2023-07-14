import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { SalaService } from './sala.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { ApiAcceptedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { UsuarioService } from 'src/usuarios/usuario.service';
import { Sala } from './schemas/sala.schema';

@Controller('salas')
@ApiTags('salas')
export class SalaController {
  constructor(private readonly usuarioService: SalaService) {}

  @Inject(UsuarioService)
  private readonly usuario;

  @ApiOperation({summary : "Crea una nueva sala"})
  @Post(":correo/:clave")
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  @ApiAcceptedResponse({description:"La sala creada", type:Sala})
  async create(@Param("correo") correo:string,@Param("clave") clave:string,@Body() createUsuarioDto: CreateSalaDto) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.create(createUsuarioDto),HttpStatus.ACCEPTED);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);}
  }

  @ApiOperation({summary : "Devuelve todas las salas"})
  @ApiOkResponse({description:"La sala creada", type:Sala, isArray:true})
  @Get()
  findAll(@Req() request: Request) {
    throw new HttpException(this.usuarioService.findAll(request),HttpStatus.OK);
  }

  @ApiOperation({summary : "Obtiene una sala por ID"})
  @ApiOkResponse({description:"La sala (si se ha encontrado)", type:Sala})
  @Get(':id')
  findOne(@Param('id') id: string) {
    throw new HttpException(this.usuarioService.findOne(id),HttpStatus.OK);
  }

  @ApiOperation({summary : "Actualiza la sala (si tienes los permisos)"})
  @ApiOkResponse({description:"La sala (si se ha encontrado)", type:Sala})
  @Patch(':correo/:clave/:id')
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  async update(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string, @Body() updateUsuarioDto: UpdateSalaDto) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.update(id, updateUsuarioDto),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOkResponse({description:"La sala eliminada", type:Sala})
  @ApiOperation({summary : "Elimina una sala (Si tienes los permisos)"})
  @ApiUnauthorizedResponse({description:"Si el usuario existe y está activado", type:String})
  @Delete(':correo/:clave/:id')
  async remove(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.remove(id),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización, usuario no activado",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOkResponse({description:"La sala (si se ha encontrado)", type:Sala})
  @ApiOperation({summary : "Encuentra una sala por nombre"})
  @Get('nombre/:nombre')
  findOneByName(@Param('nombre') id: string) {
    throw new HttpException(this.usuarioService.findOneByName(id),HttpStatus.OK);
  }

  @ApiOkResponse({description:"La sala actualizada", type:Sala})
  @ApiOperation({summary : "Actualiza una sala por nombre"})
  @Patch('nombre/:correo/:clave/:nombre')
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  async updatebyName(@Param("correo") correo:string,@Param("clave") clave:string, @Param('nombre') id: string, @Body() updateUsuarioDto: UpdateSalaDto) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.updatebyName(id, updateUsuarioDto),HttpStatus.OK);}
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }
  
}
