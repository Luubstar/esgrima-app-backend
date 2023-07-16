import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Inject, Res, HttpStatus } from '@nestjs/common';
import { SalaService } from './sala.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { ApiAcceptedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UsuarioService } from '../usuarios/usuario.service';
import { Sala } from './schemas/sala.schema';

@Controller('salas')
@ApiTags('salas')
export class SalaController {
  constructor(private readonly usuarioService: SalaService) {}

  @Inject(UsuarioService)
  public readonly usuario;

  @ApiOperation({summary : "Crea una nueva sala"})
  @Post(":correo/:clave")
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  @ApiAcceptedResponse({description:"La sala creada", type:Sala})
  async create(@Param("correo") correo:string,@Param("clave") clave:string,@Body() createUsuarioDto: CreateSalaDto,@Res() res:Response) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      return res.status(HttpStatus.ACCEPTED).send(await this.usuarioService.create(createUsuarioDto));}
    else{
      return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");}
  }

  @ApiOperation({summary : "Actualiza la sala (si tienes los permisos)"})
  @ApiAcceptedResponse({description:"La sala (si se ha encontrado)", type:Sala})
  @Patch(':correo/:clave/:id')
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  async update(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string, @Body() updateUsuarioDto: UpdateSalaDto,@Res() res:Response) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      return res.status(HttpStatus.ACCEPTED).send(await this.usuarioService.update(id, updateUsuarioDto));}
    else{
      return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
    }
  }

  @ApiOkResponse({description:"La sala eliminada", type:Sala})
  @ApiOperation({summary : "Elimina una sala (Si tienes los permisos)"})
  @ApiUnauthorizedResponse({description:"Si el usuario existe y está activado", type:String})
  @Delete(':correo/:clave/:id')
  async remove(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string,@Res() res:Response) {
    if (await this.usuario.checkIfAdmin(correo, clave)){
      return res.status(HttpStatus.OK).send(await this.usuarioService.remove(id));}
    else{
      return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización, usuario no activado");
    }
  }

  @ApiOperation({summary : "Devuelve todas las salas"})
  @ApiOkResponse({description:"La sala creada", type:Sala, isArray:true})
  @Get()
  async findAll(@Req() request: Request,@Res() res:Response) {
    return res.status(HttpStatus.OK).send(await this.usuarioService.findAll(request));
  }

  @ApiOperation({summary : "Obtiene una sala por ID"})
  @ApiOkResponse({description:"La sala (si se ha encontrado)", type:Sala})
  @Get(':id')
  async findOne(@Param('id') id: string,@Res() res:Response) {
    return res.status(HttpStatus.OK).send(await this.usuarioService.findOne(id));
  }

  @ApiOkResponse({description:"La sala (si se ha encontrado)", type:Sala})
  @ApiOperation({summary : "Encuentra una sala por nombre"})
  @Get('nombre/:nombre')
  async findOneByName(@Param('nombre') id: string,@Res() res:Response) {
    return res.status(HttpStatus.OK).send(await this.usuarioService.findOneByName(id));
  }
  
}
