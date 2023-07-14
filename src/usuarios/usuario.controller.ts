import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiAcceptedResponse, ApiHideProperty, ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { MongoExceptionFilter } from 'src/mongo-exception.filter';
import { Cron } from '@nestjs/schedule';
import { Throttle } from '@nestjs/throttler';
import { Usuario } from './schemas/usuario.schema';

var mailer = require("nodemailer");

//throw new HttpException(,HttpStatus.OK);

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
  public async checkIfLogged(@Param("correo") correo:string, @Param("clave") clave:string) {
      var res = await this.usuarioService.GetIfLoged(correo, clave)
      if (res.length > 0){
        throw new HttpException(res, HttpStatus.ACCEPTED);
      }
    }

  @ApiOperation({summary: "Devuelve el nivel de seguridad del usuario"})
  @ApiOkResponse({description:"Devuelve el nivel del usuario buscado"})
  @Get("nivel/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  async findNivel(@Param('correo') correo: string, @Param("clave") contraseña:string ) {
    throw new HttpException(this.usuarioService.findNivel(correo, contraseña), HttpStatus.OK);
  }

  @ApiOperation({summary: "Activa al usuario con la id indicada"})
  @Get("activar/:id")
  @UseFilters(MongoExceptionFilter)
  async activarbyId(@Param('id') id: string) {
    await this.usuarioService.activarUsuario(id);
    return "Inicio de sesión autorizado. Ya puedes usar la aplicación";
  } 

  @ApiOperation({summary:"Te registra en la aplicación y te manda un correo"})
  @Post(":correo")
  @ApiAcceptedResponse({description: "Se ha registrado el usuario correctamente y el correo se ha enviado"})
  @ApiServiceUnavailableResponse({description: "No se ha podido mandar el correo electrónico"})
  @Throttle(1,180)
  @UseFilters(MongoExceptionFilter)
  async create(@Body() createUsuarioDto: CreateUsuarioDto, @Param('correo') correo: string) {
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
      if (info != null){throw new HttpException(usuario["_id"], HttpStatus.ACCEPTED);}

      await this.usuarioService.remove(usuario["_id"]);
      throw new HttpException("Correo no encontrado", HttpStatus.SERVICE_UNAVAILABLE);
    
  }

  @ApiOperation({summary:"Devuelve todos los usuarios"})
  @ApiOkResponse({description:"El array con todos los usuarios", isArray:true, type:Usuario})
  @Get("all")
  @UseFilters(MongoExceptionFilter)
  async findAll() {
    throw new HttpException(this.usuarioService.findAll(), HttpStatus.OK); 
   
  }

  @ApiOperation({summary:"Devuelve todos los usuarios para mostrarlos como un botón"})
  @ApiOkResponse({description:"Los usuarios con información reducida", isArray:true, type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get("all/botones/:correo/:clave")
  async findAllbotones(@Req() request: Request,@Param('correo') correo: string,@Param('clave') clave: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.findAllbtn(request), HttpStatus.OK); 
    }
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary:"Devuelve un usuario por ID"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @Get('id/:id')
  @UseFilters(MongoExceptionFilter)
  findOnebyID(@Param('id') id: string) {
    throw new HttpException(this.usuarioService.findById(id),HttpStatus.OK);
  }

  @ApiOperation({summary: "Devuelve un usuario al buscar por nombre"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get("nombre/:correo/:clave/:nombre")
  @UseFilters(MongoExceptionFilter)
  async findAllWithName(@Param("nombre") name:string,@Param('correo') correo: string,@Param('clave') clave: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      throw new HttpException(this.usuarioService.findByName(name),HttpStatus.OK);
    }
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary: "Devueve un usuario al buscar por mail"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @Get("correo/:correo")
  @UseFilters(MongoExceptionFilter)
  findOneByMail(@Param("correo") id:string) {
    throw new HttpException(this.usuarioService.findByMail(id),HttpStatus.OK);
  }

  @ApiOperation({summary:"Devuelve los usuarios de una sala"})
  @ApiOkResponse({description:"Los usuarios pertenecientes a la sala",isArray:true, type:Usuario})
  @Get("sala/:sala")
  @UseFilters(MongoExceptionFilter)
  findOneBySala(@Param("sala") id:string) {
    throw new HttpException(this.usuarioService.findBySala(id),HttpStatus.OK);
  }

  @ApiOperation({summary:"Devuelve un usuario por un filtro genérico"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @Get('id/:id/:filtro')
  @UseFilters(MongoExceptionFilter)
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  findOnebyIDandFilter(@Param('id') id: string, @Param("filtro") filtro : string) {
    throw new HttpException(this.usuarioService.findById(id)[filtro],HttpStatus.OK);
  }
  @ApiOperation({summary:"Devuelve todos los usuarios por un filtro genérico"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario, isArray:true})
  @Get("nombre/:nombre/:filtro")
  @UseFilters(MongoExceptionFilter)
  findAllWithNameandFilter(@Param("nombre") name:string, @Param("filtro") filtro : string) {
    throw new HttpException(this.usuarioService.findByName(name)[filtro],HttpStatus.OK);
  }

  @ApiOperation({summary: "Devuelve un usuario por filtro de mail y otro filtro genérico"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @Get("correo/:correo/:filtro")
  @UseFilters(MongoExceptionFilter)
  findOneByMailandFilter(@Param("correo") id:string, @Param("filtro") filtro : string) {
    throw new HttpException(this.usuarioService.findByMail(id)[filtro],HttpStatus.OK);
  }

  @ApiOperation({summary: "Devuelve un usuario por filtro de sala y un filtro genérico"})
  @ApiOkResponse({description:"El usuario (si se ha encontrado)", type:Usuario})
  @Get("sala/:sala/:filtro")
  @UseFilters(MongoExceptionFilter)
  findOneBySalaandFilter(@Param("sala") id:string, @Param("filtro") filtro : string) {
    throw new HttpException(this.usuarioService.findBySala(id)[filtro],HttpStatus.OK);
  }


  @ApiOperation({summary: "Modifica a un usuario. Requiere permisos "})
  @ApiOkResponse({description:"El usuario actualizado", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  @Patch('id/:correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async update(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      throw new HttpException(this.usuarioService.update(id, updateUsuarioDto),HttpStatus.OK);
    }
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({summary: "Añade una poule a un usuario por ID de ambos"})
  @ApiOkResponse({description:"El usuario con la poule añadida", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get('poule/add/:correo/:clave/:id/:pouleid')
  @UseFilters(MongoExceptionFilter)
  async addPoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      throw new HttpException(await this.usuarioService.addPoule(id, pid),HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }

  @ApiOperation({summary: "Elimina una poule de un usuario por ID de ambos"})
  @ApiOkResponse({description:"El usuario sin la poule", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @Get('poule/remove/:correo/:clave/:id/:pouleid')
  @UseFilters(MongoExceptionFilter)
  async removePoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
      throw new HttpException(await this.usuarioService.removePoule(id, pid),HttpStatus.OK);
    }
    throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
  }

  @ApiOperation({summary: "Elimina un usuario"})
  @ApiOkResponse({description:"El usuario eliminado", type:Usuario})
  @ApiUnauthorizedResponse({description:"Si tienes el nivel para hacer la operación", type:String})
  @Delete('id/:correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async remove(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      throw new HttpException(await this.usuarioService.remove(id),HttpStatus.OK);
      }
      else{
        throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
      }
  }

  @ApiOperation({summary: "Elimina a un usario. Este Endpoint es el que se llama al intentar eliminar tu propia cuenta"})
  @ApiOkResponse({description:"Confirmación de que se ha eliminado", type:String})
  @ApiUnauthorizedResponse({description:"Si el usuario introducido está activado y existe", type:String})
  @ApiHideProperty()
  @Delete('correo/:correopropio/:clave')
  @UseFilters(MongoExceptionFilter)
  async removebyMail(@Param('correopropio') correop: string,@Param('clave') clave: string) {
    if (await this.usuarioService.checkIfAuth(correop, clave)){
      await this.usuarioService.removebyMail(correop);
      throw new HttpException("Usuario eliminado",HttpStatus.OK);
    }
    else{
      throw new HttpException("No tienes autorización",HttpStatus.UNAUTHORIZED);
    }
  }

  @Cron("0 0 0 * * 1")
  async removeNotActive(){
    let usuarios =  await this.usuarioService.findAllUnactive();
    usuarios.forEach(usuario => {
      let date = new Date()
      if((usuario.Creado.getTime()  + 1000*60*60*24*7 )< (date.getTime())){this.usuarioService.removeAllUnactive(usuario.Correo);}
    });
  }
  
}
