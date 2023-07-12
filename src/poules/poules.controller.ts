import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Inject,UseFilters} from '@nestjs/common';
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
        return poule["_id"];
    }
    return "ERROR";
  }

  @ApiOperation({summary : "Devuelve todas las poules"})
  @Get("all/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  async findAll(@Req() request: Request,@Param("correo") correo:string,@Param("clave") clave:string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
    return this.usuarioService.findAll(request);
    }
  }

  @ApiOperation({summary : "Devuelve una poule por id"})
  @Get('id/:id')
  @UseFilters(MongoExceptionFilter)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }


  @ApiOperation({summary : "Devuelve una poule usando un filtro"})
  @Get('id/:id/:valor')
  @UseFilters(MongoExceptionFilter)
  findOneReturnUsuarios(@Param('id') id: string, @Param('valor') valor: string) {
    return this.usuarioService.findOneReturnFilter(id,valor);
  }

  @ApiOperation({summary : "Actualiza una poule"})
  @Patch(':correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async update(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string, @Body() updatePouleDto: UpdatePouleDto) {
    if(await this.usuario.checkIfAdmin(correo, clave)){
    return this.usuarioService.update(id, updatePouleDto);
    }
    else{
      return "No tienes los permisos suficientes"
    }
  }

  @ApiOperation({summary : "Elimina una poule"})
  @Delete(':correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async remove(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string) {
    if(await this.usuario.checkIfAdmin(correo, clave)){
      return this.usuarioService.remove(id);
    }
    else{
      return "No tienes los permisos suficientes";
    }
  }

  @ApiOperation({summary : "Añade una lista de poules a un usuario"})
  @Get(':lista/add/:correo/:clave/:pouleid/:idusuario')
  @UseFilters(MongoExceptionFilter)
  async addPoule(@Param('lista') lista: string,@Param('correo') correo: string,@Param('clave') clave: string,@Param('idusuario') iduser: string,@Param('pouleid') idpoule: string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        return this.usuarioService.addfromlista(idpoule, iduser,lista);
    }
    return "Error de autentificación";
  }

  @ApiOperation({summary : "Elimina una lista de poules de un usuario"})
  @Delete(':lista/remove/:correo/:clave/:pouleid/:idusuario')
  @UseFilters(MongoExceptionFilter)
  async removePoule(@Param('lista') lista: string,@Param('correo') correo: string,@Param('clave') clave: string,@Param('idusuario') iduser: string,@Param('pouleid') idpoule: string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        return this.usuarioService.removefromlista(idpoule, iduser,lista);
    }
    return "Error de autentificación";
  }
  
  @ApiOperation({summary : "Cambia el estado de una poule"})
  @Post("estado/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async changePouleEstado(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changeEstadoDTO: changeEstadoDto) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        return this.usuarioService.setEstado(idpoule, changeEstadoDTO);
    }
    return "ERROR";
  }

  @ApiOperation({summary : "Establece los vencedores de la poule"})
  @Post("vencedores/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async changePouleVencedores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changePouleVencedoresDTO: changePouleVencedores) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        return this.usuarioService.setVencedores(idpoule, changePouleVencedoresDTO);
    }
    return "ERROR";
  }

  @ApiOperation({summary : "Cambia los valores de una poule"})
  @Post("valores/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async changePoulevalores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changeValoresDTO: changeValoresDto) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        return this.usuarioService.setValores(idpoule, changeValoresDTO);
    }
    return "ERROR";
  }

  @ApiOperation({summary : "Obtiene los valores de una poule"})
  @Get("valores/:correo/:clave/:pouleid")
  @UseFilters(MongoExceptionFilter)
  async getPoulevalores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        let poule =  await this.usuarioService.getValores(idpoule);
        return poule["Valores"];
    }
    return "ERROR";
  }
}
