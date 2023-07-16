import { Controller, Get, Post, Body, Patch, Param, Req, Res, Inject,UseFilters, HttpStatus} from '@nestjs/common';
import { PoulesService } from './poules.service';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { ApiAcceptedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request,Response } from 'express';
import { UsuarioService } from '../usuarios/usuario.service';
import { MongoExceptionFilter } from '../mongo-exception.filter';
import { changeEstadoDto } from './dto/change-estado.dto';
import { changeValoresDto } from './dto/change-valores.dto';
import { Throttle } from '@nestjs/throttler';
import { Poule } from './schemas/poule.schema';

@Controller('poules')
@ApiTags('poules')
export class PoulesController {
  constructor(private readonly pouleService: PoulesService) {}

  @Inject(UsuarioService)
  private readonly usuario;

  @ApiOperation({summary : "Crea una poule nueva, devuelve una id"})
  @Post(":correo/:clave")
  @Throttle(1,180)
  @ApiAcceptedResponse({description:"ID de la poule creada", type:String})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @UseFilters(MongoExceptionFilter)
  async create(@Body() createPouleDto: CreatePouleDto,@Param("correo") correo:string,@Param("clave") clave:string, @Res() res:Response) {
    if (await this.usuario.checkIfAuth(correo, clave)){
        let poule = await this.pouleService.create(createPouleDto);
        return res.status(HttpStatus.ACCEPTED).send(poule["_id"]);
    }
    else{
      return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
    }
  }

  @ApiOperation({summary : "Devuelve todas las poules"})
  @ApiOkResponse({description:"Las poules guardadas", type:Poule, isArray:true})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get("all/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  async findAll(@Req() request: Request,@Param("correo") correo:string,@Param("clave") clave:string, @Res() res:Response) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      return res.status(HttpStatus.OK).send(await this.pouleService.findAll(request));
    }
    else{return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");}
  }

  @ApiOperation({summary : "Devuelve una poule por id"})
  @ApiOkResponse({description:"La poule (si la encuentra)", type:Poule})
  @Get('id/:id')
  @UseFilters(MongoExceptionFilter)
  async findOne(@Param('id') id: string, @Req() res: Response) {
    return res.status(HttpStatus.OK).send(await this.pouleService.findOne(id));
  }

  
  @ApiOkResponse({description:"La poule actualizada ", type:Poule})
  @ApiOperation({summary : "Actualiza una poule"})
  @ApiUnauthorizedResponse({description:"Si tienes permisos para ejecutar", type:String})
  @Patch(':correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async update(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string, @Res() res:Response, @Body() updatePouleDto: UpdatePouleDto) {
    if(await this.usuario.checkIfAdmin(correo, clave)){
      return res.status(HttpStatus.OK).send(await this.pouleService.update(id, updatePouleDto));
    }
    else{
      return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
    }
  }

  @ApiOperation({summary : "Cambia el estado de una poule"})
  @ApiOkResponse({description:"La poule actualizada", type:Poule})
  @Post("estado/:correo/:clave/:pouleid")
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @UseFilters(MongoExceptionFilter)
  async changePouleEstado(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changeEstadoDTO: changeEstadoDto, @Res() res: Response) {
    var poule = await this.findOne(idpoule,res);
    if ((await this.usuario.checkIfAuth(correo, clave) && poule["Tiradores"].includes(idpoule)) || this.usuario.checkIfAdmin(correo,clave)){
      return res.status(HttpStatus.OK).send(await this.pouleService.setEstado(idpoule, changeEstadoDTO, res));
    }
    return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
  }

  @ApiOperation({summary : "Cambia los valores de una poule"})
  @ApiOkResponse({description:"La poule actualizada", type:Poule})
  @Post("valores/:correo/:clave/:pouleid")
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @UseFilters(MongoExceptionFilter)
  async changePoulevalores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Body() changeValoresDTO: changeValoresDto, @Res() res: Response) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      await this.pouleService.setValores(idpoule, correo, clave, changeValoresDTO, res)
    }
    else{return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización")};
  }

  @ApiOperation({summary : "Obtiene los valores de una poule"})
  @ApiOkResponse({description:"La poule (si la encuentra)", type:Poule})
  @Get("valores/:correo/:clave/:pouleid")
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @UseFilters(MongoExceptionFilter) 
  async getPoulevalores(@Param("correo") correo:string,@Param("clave") clave:string,@Param('pouleid') idpoule: string,@Res() res: Response) {
    if (await this.usuario.checkIfAuth(correo, clave)){
      let poule =  await this.pouleService.getValores(idpoule);
      return res.status(HttpStatus.OK).send(poule["Valores"]);
    }
    return res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
  }
}
