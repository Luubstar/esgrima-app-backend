import { Injectable, Res, HttpStatus, UseFilters } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { Model, model } from 'mongoose';
import {Request, Response} from "express";
import { Cron } from '@nestjs/schedule';
import { PoulesModule } from '../poules/poules.module';
import { MongoExceptionFilter } from '../mongo-exception.filter';

const adminrole :string = "Admin";
const entrenadorrole: string = "Entrenador";

@Injectable()
export class UsuarioService {
  constructor( 
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>
  ) {
  }  
  
  getModel(){return this.usuarioModel;}
  public async GetIfLoged(correo : string, clave :string,@Res() res:Response){
    if (await this.checkIfExists(correo,clave)){
      if (await this.checkIfAuth(correo,clave))
      {  
        let usuario = await this.findHiddenByMail(correo);
        return usuario["_id"].toString();
      } 
      else{return res.status(HttpStatus.UNAUTHORIZED).send("Cuenta no autorizada. Autorizala en tu correo electrónico");}
    } 
    else{return res.status(HttpStatus.UNAUTHORIZED).send("Cuenta no encontrada");}
  }

  async checkIfAuth(correo : string, clave : string){
    try{
    let usuario = await this.findHiddenByMail(correo);
    return usuario["Clave"] == clave && usuario["Activado"];}
    catch{return false;}
  }

  async checkIfExists(correo : string, clave : string){
    try{
    let usuario = await this.findHiddenByMail(correo);
    return usuario["Clave"] == clave;}
    catch{return false;}
  }

  async checkIfAdmin(correo:string, contraseña:string){
    return (await this.findNivel(correo, contraseña) == adminrole)
  }

  async findActivado(correo:string, clave:string) {
    if (await this.checkIfAuth(correo, clave)){
      let usuario = await this.findHiddenByMail(correo);
      return usuario["Activado"];
    }
    else{return false;}
  }

  async findNivel(correo:string, clave:string) {
    if (await this.checkIfAuth(correo, clave)){
      let usuario = await this.findHiddenByMail(correo);
      return usuario["Nivel"];
    }
    else{return null;}
  }

  async create(createBookDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll() : Promise<Usuario[]>{ 
    return this.usuarioModel.find({Activado: true}).setOptions({sanitizeFilter : true}).populate("Poules").select("-Correo -Clave").exec();
  }
  async findAllbtn(request: Request): Promise<Usuario[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).select("-Correo -Clave").exec();
  }

  async findByName(nombre:string): Promise<Usuario[]> { 
    return this.usuarioModel.find({Nombre: new RegExp(nombre, "i")}).setOptions({sanitizeFilter : true}).populate({path:"Poules", select:"_id Nombre Tipo Estado Creador Tiradores Vencedores"}).select("-Correo -Clave").exec();
  }

  async findById(id: string): Promise<Usuario> { 
    return this.usuarioModel.findById(id).setOptions({sanitizeFilter : true}).populate("Poules").select("-Correo -Clave").exec(); 
  } 

  async findHidden(id: string): Promise<Usuario> { 
    return this.usuarioModel.findById(id).setOptions({sanitizeFilter : true}).populate("Poules").exec(); 
  } 

  async findHiddenByMail(id: string): Promise<Usuario> { 
    let usuario = this.usuarioModel.findOne({ Correo: new RegExp(id, "i")}).setOptions({sanitizeFilter : true}).populate({path:"Poules", select:"_id Nombre Tipo Estado Creador Tiradores Vencedores"}).exec(); 
    return usuario;
  } 

  async findByMail(id: string): Promise<Usuario> { 
    let usuario = this.usuarioModel.findOne({ Correo: new RegExp(id, "i")}).setOptions({sanitizeFilter : true}).populate({path:"Poules", select:"_id Nombre Tipo Estado Creador Tiradores Vencedores"}).select("-Correo -Clave").exec(); 
    return usuario;
  } 

  async findBySala(sala:string): Promise<Usuario[]> { 
    return this.usuarioModel.find({Sala: new RegExp(sala, "i")}).setOptions({sanitizeFilter : true}).populate({path:"Poules", select:"_id Nombre Tipo Estado Creador Tiradores Vencedores"}).select("-Correo -Clave").exec();
  }
  

  async update(id: string, updateBookDto: UpdateUsuarioDto): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) : Promise<Usuario> { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).exec(); 
  }

  async removebyMail(id: string) : Promise<Usuario>{ 
    return this.usuarioModel.findOneAndRemove({ Correo: id }).exec(); 
  }

  async activarUsuario(id: string): Promise<Usuario> { 
    let usuario = this.usuarioModel.findOneAndUpdate({ _id: id },{"Activado" : true});
    return usuario;
  }
  async removePoule(id: string, idp: string): Promise<Usuario> { 
    let usuario = this.usuarioModel.findByIdAndUpdate(id,  {$pull: {"Poules":idp}},{new:true});

    return usuario;
  }
  async addPoule(id: string, idp: string): Promise<Usuario> { 
      return this.usuarioModel.findOneAndUpdate({_id: id},  {$push: {"Poules":  idp}},{new:true});
  }

  async findAllUnactive(): Promise<Usuario[]> { 
    return this.usuarioModel.find({Activado: false}).setOptions({sanitizeFilter : true}).exec();
  }


  @Cron("0 0 0 * * 1")
  async removeNotActive(){
    let usuarios =  await this.findAllUnactive();
    usuarios.forEach(usuario => {
      let date = new Date()
      if((usuario.Creado.getTime()  + 1000*60*60*24*7 )< (date.getTime())){this.remove(usuario["_id"]);}
    });
  }
}