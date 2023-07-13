import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Inject,UseFilters, HttpException, HttpStatus} from '@nestjs/common';
import { PoulesService } from './poules.service';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UsuarioService } from 'src/usuarios/usuario.service';
import { MongoExceptionFilter } from 'src/mongo-exception.filter';
import { changeEstadoDto } from './dto/change-estado.dto';
import { changePouleVencedores } from './dto/change-vencedores.dto';
import { changeValoresDto } from './dto/change-valores.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('poules')
@ApiTags('poules')
export class PoulesController {
  constructor(private readonly usuarioService: PoulesService) {}

  @Inject(UsuarioService)
  private readonly usuario;

  @ApiOperation({summary : "Crea una poule nueva, devuelve una id"})
  @Post(":correo/:clave")
  @Throttle(1,180)
  @UseFilters(MongoExceptionFilter)
  async create(@Body() createPouleDto: CreatePouleDto,@Param("correo") correo:string,@Param("clave") clave:string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        let poule = await this.usuarioService.create(createPouleDto);
        throw new HttpException(poule["_id"],HttpStatus.OK);
    }
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary : "Devuelve todas las poules"})
  @Get("all/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  async findAll(@Req() request: Request,@Param("correo") correo:string,@Param("clave") clave:string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.findAll(request),HttpStatus.OK);
    }
    else{throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);}
  }

  @ApiOperation({summary : "Devuelve una poule por id"})
  @Get('id/:id')
  @UseFilters(MongoExceptionFilter)
  findOne(@Param('id') id: string) {
    throw new HttpException(this.usuarioService.findOne(id),HttpStatus.OK);
  }


  @ApiOperation({summary : "Devuelve una poule usando un filtro"})
  @Get('id/:id/:valor')
  @UseFilters(MongoExceptionFilter)
  findOneReturnUsuarios(@Param('id') id: string, @Param('valor') valor: string) {
    throw new HttpException(this.usuarioService.findOneReturnFilter(id,valor),HttpStatus.OK);
  }

  @ApiOperation({summary : "Actualiza una poule"})
  @Patch(':correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async update(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string, @Body() updatePouleDto: UpdatePouleDto) {
    if(await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.update(id, updatePouleDto),HttpStatus.OK);
    }
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary : "Elimina una poule"})
  @Delete(':correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async remove(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string) {
    if(await this.usuario.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.remove(id),HttpStatus.OK);
    }
    else{
      throw new HttpException("No tienes los permisos",HttpStatus.FORBIDDEN);
    }
  }

  @ApiOperation({summary : "Añade una lista de poules a un usuario"})
  @Get(':lista/add/:correo/:clave/:pouleid/:idusuario')
  @UseFilters(MongoExceptionFilter)
  async addPoule(@Param('lista') lista: string,@Param('correo') correo: string,@Param('clave') clave: string,@Param('idusuario') iduser: string,@Param('pouleid') idpoule: string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.addfromlista(idpoule, iduser,lista),HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }

  @ApiOperation({summary : "Elimina una lista de poules de un usuario"})
  @Delete(':lista/remove/:correo/:clave/:pouleid/:idusuario')
  @UseFilters(MongoExceptionFilter)
  async removePoule(@Param('lista') lista: string,@Param('correo') correo: string,@Param('clave') clave: string,@Param('idusuario') iduser: string,@Param('pouleid') idpoule: string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.removefromlista(idpoule, iduser,lista),HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }
  
  @ApiOperation({summary : "Cambia el estado de una poule"})
  @Post("estado/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async changePouleEstado(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changeEstadoDTO: changeEstadoDto) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.setEstado(idpoule, changeEstadoDTO),HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }

  @ApiOperation({summary : "Establece los vencedores de la poule"})
  @Post("vencedores/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async changePouleVencedores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changePouleVencedoresDTO: changePouleVencedores) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.setVencedores(idpoule, changePouleVencedoresDTO),HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }

  @ApiOperation({summary : "Cambia los valores de una poule"})
  @Post("valores/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async changePoulevalores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changeValoresDTO: changeValoresDto) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.setValores(idpoule, changeValoresDTO),HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }

  @ApiOperation({summary : "Obtiene los valores de una poule"})
  @Get("valores/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async getPoulevalores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      let poule =  await this.usuarioService.getValores(idpoule);
      throw new HttpException(poule["Valores"],HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }
}
