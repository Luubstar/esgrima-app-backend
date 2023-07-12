import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseFilters } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiHideProperty, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MongoExceptionFilter } from 'src/mongo-exception.filter';
import { Cron } from '@nestjs/schedule';
import { Throttle } from '@nestjs/throttler';

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
  @Get("login/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  async checkIfLogged(@Param("correo") correo:string, @Param("clave") clave:string) {
      if (await this.usuarioService.checkIfExists(correo,clave)){
        if (await this.usuarioService.checkIfAuth(correo,clave))
        {  let usuario = await this.usuarioService.findByMail(correo);
          return "ACEPTADO/" + usuario["_id"];}
        else{return "NO ACTIVADO";}
      }
      else{return "ERROR"}
    }

  @ApiOperation({summary: "Devuelve el nivel de seguridad del usuario"})
  @Get("nivel/:correo/:clave")
  @UseFilters(MongoExceptionFilter)
  async findNivel(@Param('correo') correo: string, @Param("clave") contraseña:string ) {
    return this.usuarioService.findNivel(correo, contraseña);
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
      if (info != null){
        return "ACEPTADO/" + usuario["_id"];
      }

      await this.usuarioService.remove(usuario["_id"]);
      
      return "ERRORCORREO";
    
  }

  @ApiOperation({summary:"Devuelve todos los usuarios"})
  @Get("all")
  @UseFilters(MongoExceptionFilter)
  async findAll() {
      return this.usuarioService.findAll();
   
  }

  @ApiOperation({summary:"Devuelve todos los usuarios para mostrarlos como un botón"})
  @Get("all/botones/:correo/:clave")
  async findAllbotones(@Req() request: Request,@Param('correo') correo: string,@Param('clave') clave: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
        return this.usuarioService.findAllbtn(request);
    }
    else{
      return "No estás autorizado";
    }
  }

  @ApiOperation({summary:"Devuelve un usuario por ID"})
  @Get('id/:id')
  @UseFilters(MongoExceptionFilter)
  findOnebyID(@Param('id') id: string) {
    return this.usuarioService.findById(id);
  }

  @ApiOperation({summary: "Devuelve un usuario al buscar por nombre"})
  @Get("nombre/:correo/:clave/:nombre")
  @UseFilters(MongoExceptionFilter)
  async findAllWithName(@Param("nombre") name:string,@Param('correo') correo: string,@Param('clave') clave: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
    return this.usuarioService.findByName(name);
  }
  }

  @ApiOperation({summary: "Devueve un usuario al buscar por mail  "})
  @Get("correo/:correo")
  @UseFilters(MongoExceptionFilter)
  findOneByMail(@Param("correo") id:string) {
    return this.usuarioService.findByMail(id);
  }

  @ApiOperation({summary:"Devuelve los usuarios de una sala"})
  @Get("sala/:sala")
  @UseFilters(MongoExceptionFilter)
  findOneBySala(@Param("sala") id:string) {
    return this.usuarioService.findBySala(id);
  }

  @ApiOperation({summary:"Devuelve un usuario por un filtro genérico"})
  @Get('id/:id/:filtro')
  @UseFilters(MongoExceptionFilter)
  findOnebyIDandFilter(@Param('id') id: string, @Param("filtro") filtro : string) {
    return this.usuarioService.findById(id)[filtro];
  }
  @ApiOperation({summary:"Devuelve todos los usuarios por un filtro genérico"})
  @Get("nombre/:nombre/:filtro")
  @UseFilters(MongoExceptionFilter)
  findAllWithNameandFilter(@Param("nombre") name:string, @Param("filtro") filtro : string) {
    return this.usuarioService.findByName(name)[filtro];
  }

  @ApiOperation({summary: "Devuelve un usuario por filtro de mail y otro filtro genérico"})
  @Get("correo/:correo/:filtro")
  @UseFilters(MongoExceptionFilter)
  findOneByMailandFilter(@Param("correo") id:string, @Param("filtro") filtro : string) {
    return this.usuarioService.findByMail(id)[filtro];
  }

  @ApiOperation({summary: "Devuelve un usuario por filtro de sala y un filtro genérico"})
  @Get("sala/:sala/:filtro")
  @UseFilters(MongoExceptionFilter)
  findOneBySalaandFilter(@Param("sala") id:string, @Param("filtro") filtro : string) {
    return this.usuarioService.findBySala(id)[filtro];
  }


  @ApiOperation({summary: "Modifica a un usuario. Requiere permisos "})
  @Patch('id/:correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async update(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      return this.usuarioService.update(id, updateUsuarioDto);
    }
    else{
      return "No hay permisos suficientes";
    }
  }

  @ApiOperation({summary: "Añade una poule a un usuario por ID de ambos"})
  @Get('poule/add/:correo/:clave/:id/:pouleid')
  @UseFilters(MongoExceptionFilter)
  async addPoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
        return this.usuarioService.addPoule(id, pid);
    }
    return "Error de autentificación";
  }

  @ApiOperation({summary: "Elimina una poule de un usuario por ID de ambos"})
  @Get('poule/remove/:correo/:clave/:id/:pouleid')
  @UseFilters(MongoExceptionFilter)
  async removePoule(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string,@Param('pouleid') pid: string) {
    if (await this.usuarioService.checkIfAuth(correo, clave)){
        return this.usuarioService.removePoule(id, pid);
    }
    return "Error de autentificación";
  }

  @ApiOperation({summary: "Elimina un usuario"})
  @Delete('id/:correo/:clave/:id')
  @UseFilters(MongoExceptionFilter)
  async remove(@Param('correo') correo: string,@Param('clave') clave: string,@Param('id') id: string) {
    if (await this.usuarioService.checkIfAdmin(correo, clave)){
      return this.usuarioService.remove(id);
      }
      else{
        return "No hay permisos suficientes"
      }
  }

  @ApiOperation({summary: "Elimina a un usario. Este Endpoint es el que se llama al intentar eliminar tu propia cuenta"})
  @ApiHideProperty()
  @Delete('correo/:correopropio/:clave')
  @UseFilters(MongoExceptionFilter)
  async removebyMail(@Param('correopropio') correop: string,@Param('clave') clave: string) {
    if (await this.usuarioService.checkIfAuth(correop, clave)){
      await this.usuarioService.removebyMail(correop);
      return "Eliminado";
    }
    else{
      return "No hay permisos suficientes";
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
