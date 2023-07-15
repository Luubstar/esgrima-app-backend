import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseFilters, Res, HttpStatus } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiAcceptedResponse, ApiHideProperty, ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { MongoExceptionFilter } from 'src/mongo-exception.filter';
import { Throttle } from '@nestjs/throttler';
import { Usuario } from './schemas/usuario.schema';

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

  @ApiOperation({summary : "Revisa si la contraseña y el correo son correctos, y si el usuario está activado"})
  @ApiUnauthorizedResponse({description: "No se ha encontrado la cuenta o no está activada"})
  @ApiAcceptedResponse({description:"La id del usuario aceptado"})
  @Get("login/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  public async checkIfLogged(@Param("correo") correo:string, @Param("clave") clave:string,@Res() res:Response) {
      var result = await this.usuarioService.GetIfLoged(correo, clave,res)
      if (result.length > 0){
        res.status(HttpStatus.ACCEPTED).send(res);
      }
    }

  @ApiOperation({summary: "Devuelve el nivel de seguridad del usuario"})
  @ApiOkResponse({description:"Devuelve el nivel del usuario buscado"})
  @Get("nivel/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  async findNivel(@Param('correo') correo: string, @Param("clave") contraseña:string,@Res() res:Response ) {
    res.status(HttpStatus.OK).send(await this.usuarioService.findNivel(correo, contraseña));
  }

  @ApiOperation({summary: "Activa al usuario con la id indicada"})
  @Get("activar/:id")
  @UseFilters(MongoExceptionFilter)
  async activarbyId(@Param('id') id: string) {
    await this.usuarioService.activarUsuario(id);
    return "Inicio de sesión autorizado. Ya puedes usar la aplicación";
  } 

  @ApiOperation({summary:"Te registra en la aplicación y te manda un correo"})
  @Post("")
  @ApiAcceptedResponse({description: "Se ha registrado el usuario correctamente y el correo se ha enviado"})
  @ApiServiceUnavailableResponse({description: "No se ha podido mandar el correo electrónico"})
  @Throttle(1,180)
  @UseFilters(MongoExceptionFilter)
  async create(@Body() createUsuarioDto: CreateUsuarioDto,@Res() res:Response) {
      var correo = createUsuarioDto["Correo"];
      let usuario = await this.usuarioService.create(createUsuarioDto);
      var mensaje = "Muchas gracias por registrarte en nuestra aplicación. Para activar tu cuenta, debes entrar en este enlace\n"+
      "https://esgrimapp-backend.fly.dev/usuarios/activar/"+ usuario["_id"] +"\n Ante cualquier duda o error, por favor, ponte en contacto con nosotros"+
      " mandando un correo a nbaronariera@gmail.com";
      var mailoptions = {
        from: '"Usuario registrado correctamente" <noreply@esgrimapp.com>',
        to: correo,
        subject: 'Activa tu cuenta',
        text: mensaje,
      };  

      let info = await transporter.sendMail(mailoptions);
      if (info != null){res.status(HttpStatus.ACCEPTED).send(usuario["_id"]);}

      await this.usuarioService.remove(usuario["_id"]);
      res.status(HttpStatus.SERVICE_UNAVAILABLE).send("Correo no encontrado");
  }

  @ApiOperation({summary:"Devuelve todos los usuarios"})
  @ApiOkResponse({description:"El array con todos los usuarios", isArray:true, type:Usuario})
  @Get("all")
  @UseFilters(MongoExceptionFilter)
  async findAll(@Res() res:Response) {
    res.status(HttpStatus.OK).send(await this.usuarioService.findAll()); 
   
  }

  @ApiOperation({summary:"Devuelve todos los usuarios para mostrarlos como un botón"})
  @ApiOkResponse({description:"Los usuarios con información reducida", isArray:true, type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get("all/botones/:correo/:clave")
  async findAllbotones(@Req() request: Request,@Param('correo') correo: string,@Param('clave') clave: string,@Res() res:Response) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      res.status(HttpStatus.OK).send(await this.usuarioService.findAllbtn(request)); 
    }
    else{
      res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
    }
  }

  @ApiOperation({summary:"Devuelve un usuario por ID"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @Get('id/:id')
  @UseFilters(MongoExceptionFilter)
  async findOnebyID(@Param('id') id: string,@Res() res:Response) {
    res.status(HttpStatus.OK).send(await this.usuarioService.findById(id));
  }

  @ApiOperation({summary: "Devuelve un usuario al buscar por nombre"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get("nombre/:correo/:clave/:nombre")
  @UseFilters(MongoExceptionFilter)
  async findAllWithName(@Param("nombre") name:string,@Param('correo') correo: string,@Param('clave') clave: string,@Res() res:Response) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      res.status(HttpStatus.OK).send(await this.usuarioService.findByName(name));
    }
    else{
      res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
    }
  }

  @ApiOperation({summary: "Devueve un usuario al buscar por mail"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @Get("correo/:correo")
  @UseFilters(MongoExceptionFilter)
  async findOneByMail(@Param("correo") id:string,@Res() res:Response) {
    res.status(HttpStatus.OK).send(await this.usuarioService.findByMail(id));
  }

  @ApiOperation({summary:"Devuelve los usuarios de una sala"})
  @ApiOkResponse({description:"Los usuarios pertenecientes a la sala",isArray:true, type:Usuario})
  @Get("sala/:sala")
  @UseFilters(MongoExceptionFilter)
  async findOneBySala(@Param("sala") id:string,@Res() res:Response) {
    res.status(HttpStatus.OK).send(await this.usuarioService.findBySala(id));
  }

  @ApiOperation({summary: "Modifica a un usuario. Requiere permisos "})
  @ApiOkResponse({description:"El usuario actualizado", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  @Patch('id/:correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async update(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto,@Res() res:Response) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      res.status(HttpStatus.OK).send(await this.usuarioService.update(id, updateUsuarioDto));
    }
    else{
      res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
    }
  }

  @ApiOperation({summary: "Añade una poule a un usuario por ID de ambos"})
  @ApiOkResponse({description:"El usuario con la poule añadida", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get('poule/add/:correo/:clave/:id/:pouleid')
  @UseFilters(MongoExceptionFilter)
  async addPoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string,@Res() res:Response) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      res.status(HttpStatus.OK).send(await this.usuarioService.addPoule(id, pid));
    }
    res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
  }

  @ApiOperation({summary: "Elimina una poule de un usuario por ID de ambos"})
  @ApiOkResponse({description:"El usuario sin la poule", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get('poule/remove/:correo/:clave/:id/:pouleid')
  @UseFilters(MongoExceptionFilter)
  async removePoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string,@Res() res:Response) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      res.status(HttpStatus.OK).send(await this.usuarioService.removePoule(id, pid));
    }
    res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
  }

  @ApiOperation({summary: "Elimina un usuario"})
  @ApiOkResponse({description:"El usuario eliminado", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  @Delete('id/:correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async remove(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Res() res:Response) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      res.status(HttpStatus.OK).send(await this.usuarioService.remove(id));
      }
      else{
        res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
      }
  }

  @ApiOperation({summary: "Elimina a un usario. Este Endpoint es el que se llama al intentar eliminar tu propia cuenta"})
  @ApiOkResponse({description:"Confirmación de que se ha eliminado", type:String})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @ApiHideProperty()
  @Delete('correo/:correopropio/:clave')
  @UseFilters(MongoExceptionFilter)
  async removebyMail(@Param('correopropio') correop: string,@Param('clave') clave: string,@Res() res:Response) {
    if (await this.usuarioService.checkIfAuth(correop, clave)){
      await this.usuarioService.removebyMail(correop);
      res.status(HttpStatus.OK).send("Usuario eliminado");
    }
    else{
      res.status(HttpStatus.UNAUTHORIZED).send("No tienes autorización");
    }
  }
  
}
