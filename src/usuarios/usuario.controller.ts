import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PoulesService } from 'src/poules/poules.service';

var mailer = require("nodemailer");

let transporter = mailer.createTransport({
  service: "gmail",
  secure: true, // true for 465, false for other ports
  auth: {
    user: "netmente225@gmail.com", // generated ethereal user
    pass: "xetzacosgzmniyzl", // generated ethereal password
  },
});


@Controller('usuarios')
@ApiTags('usuarios')

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get("nivel/:correo/:clave")
  async findNivel(@Param('correo') correo: string, @Param("clave") contraseña:string ) {
    return this.usuarioService.findNivel(correo, contraseña);
  }

  @Get("activar/:id")
  async activarbyId(@Param('id') id: string) {
    await this.usuarioService.activarUsuario(id);
    return "Inicio de sesión autorizado. Ya puedes usar la aplicación";
  }

  @Post()
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    let usuario = await this.usuarioService.create(createUsuarioDto);
    console.log(usuario);
    var mensaje = "Muchas gracias por registrarte en nuestra aplicación. Para activar tu cuenta, debes entrar en este enlace\n"+
    "http://localhost:3000/usuarios/activar/"+ usuario["_id"] +"\n Ante cualquier duda o error, por favor, ponte en contacto con nosotros"+
    " mandando un correo a nbaronariera@gmail.com";
    var mailoptions = {
      from: '"Usuario registrado correctamente" <noreply@esgrimapp.com>',
      to: "nbaronariera@gmail.com",
      subject: 'Activa tu cuenta',
      text: mensaje,
    };  

    let info = await transporter.sendMail(mailoptions);
    if (info != null){
      return 0;
    }
    
  }

  @Get("all/:correo/:clave")
  async findAll(@Req() request: Request,@Param('correo') correo: string,@Param('clave') clave: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      return this.usuarioService.findAll(request)
    }
    else{
      return "No hay permisos suficientes";
    }
  }

  @Get('id/:id')
  findOnebyID(@Param('id') id: string) {
    return this.usuarioService.findById(id);
  }

  @Get("nombre/:nombre")
  findAllWithName(@Param("nombre") name:string) {
    return this.usuarioService.findByName(name);
  }

  @Get("correo/:correo")
  findOneByMail(@Param("correo") id:string) {
    return this.usuarioService.findByMail(id);
  }

  @Get("sala/:sala")
  findOneBySala(@Param("sala") id:string) {
    return this.usuarioService.findBySala(id);
  }

  //gets pero de 1 dato
  @Get('id/:id/:filtro')
  findOnebyIDandFilter(@Param('id') id: string, @Param("filtro") filtro : string) {
    return this.usuarioService.findById(id)[filtro];
  }
  @Get("nombre/:nombre/:filtro")
  findAllWithNameandFilter(@Param("nombre") name:string, @Param("filtro") filtro : string) {
    return this.usuarioService.findByName(name)[filtro];
  }

  @Get("correo/:correo/:filtro")
  findOneByMailandFilter(@Param("correo") id:string, @Param("filtro") filtro : string) {
    return this.usuarioService.findByMail(id)[filtro];
  }

  @Get("sala/:sala/:filtro")
  findOneBySalaandFilter(@Param("sala") id:string, @Param("filtro") filtro : string) {
    return this.usuarioService.findBySala(id)[filtro];
  }


  @Patch('id/:correo/:clave/:id')
  async update(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      return this.usuarioService.update(id, updateUsuarioDto);
    }
    else{
      return "No hay permisos suficientes";
    }
  }

  @Patch('poule/add/:correo/:clave/:id/:pouleid')
  async addPoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
        return this.usuarioService.addPoule(id, pid);
    }
  }

  @Patch('poule/remove/:correo/:clave/:id/:pouleid')
  async removePoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
        return this.usuarioService.removePoule(id, pid);
    }
  }

  @Delete('id/:correo/:clave/:id')
  async remove(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      return this.usuarioService.remove(id);
      }
      else{
        return "No hay permisos suficientes"
      }
  }


  @Patch('correo/:correopropio/:clave/:correo')
  async updatebyMail(@Param('correopropio') correop: string,@Param('clave') clave: string,@Param('correo') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (await this.usuarioService.checkIfAdmin(correop, clave)){
      return this.usuarioService.updatebyMail(id, updateUsuarioDto);}
    else{
      return "No hay permisos suficientes"
    }
  }

  @Delete('correo/:correopropio/:clave/:correo')
  async removebyMail(@Param('correopropio') correop: string,@Param('clave') clave: string,@Param('correo') id: string) {
    if (await this.usuarioService.checkIfAdmin(correop, clave)){
      return this.usuarioService.removebyMail(id);
    }
    else{
      return "No hay permisos suficientes";
    }
  }

  
}
