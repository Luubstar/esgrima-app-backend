import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Inject} from '@nestjs/common';
import { PoulesService } from './poules.service';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UsuarioService } from 'src/usuarios/usuario.service';

@Controller('poules')
@ApiTags('poules')
export class PoulesController {
  constructor(private readonly usuarioService: PoulesService) {}

  @Inject(UsuarioService)
  private readonly usuario;

  @Post()
  create(@Body() createPouleDto: CreatePouleDto) {
    return this.usuarioService.create(createPouleDto);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.usuarioService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Get(':id/:valor')
  findOneReturnUsuarios(@Param('id') id: string, @Param('valor') valor: string) {
    return this.usuarioService.findOneReturnFilter(id,valor);
  }

  @Patch(':correo/:clave/:id')
  async update(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string, @Body() updatePouleDto: UpdatePouleDto) {
    if(await this.usuario.checkIfAdmin(correo, clave)){
    return this.usuarioService.update(id, updatePouleDto);
    }
    else{
      return "No tienes los permisos suficientes"
    }
  }

  @Delete(':correo/:clave/:id')
  async remove(@Param("correo") correo:string,@Param("clave") clave:string,@Param('id') id: string) {
    if(await this.usuario.checkIfAdmin(correo, clave)){
      return this.usuarioService.remove(id);
    }
    else{
      return "No tienes los permisos suficientes";
    }
  }

  
}
