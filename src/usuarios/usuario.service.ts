import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { Model } from 'mongoose';
import {Request } from "express";
import { PoulesService } from 'src/poules/poules.service';



const adminrole :string = "Admin";
const entrenadorrole: string = "Entrenador";

@Injectable()
export class UsuarioService {
  constructor( 
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>,  @Inject(forwardRef(() => PoulesService)) private readonly pouleService: PoulesService
  ) {
  }

  async checkIfAuth(correo : string, clave : string){
    let usuario = await this.findByMail(correo);
    return usuario["Clave"] == clave && usuario["Activado"];
  }

  async checkIfAdmin(correo:string, contraseña:string){
    return (await this.findNivel(correo, contraseña) == adminrole)
  }

  async checklogin(correo:string, clave:string) {
    if (await this.checkIfAuth(correo, clave)){
      let usuario = await this.findByMail(correo);
      return usuario["Activado"];
    }
  }

  async findNivel(correo:string, clave:string) {
    if (await this.checkIfAuth(correo, clave)){
      let usuario = await this.findByMail(correo);
      return usuario["Nivel"];
    }
  }

  async create(createBookDto: CreateUsuarioDto): Promise<Usuario> { 
    //createBookDto["Nivel"] = "Tirador";
    //createBookDto["Sala"] = "";
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Usuario[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador", "Tiradores"]).lean().exec();
  }
  async findAllbtn(request: Request): Promise<Usuario[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).lean().exec();
  }

  async findByName(nombre:string): Promise<Usuario[]> { 
    return this.usuarioModel.find({Nombre: new RegExp(nombre, "i")}).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador", "Tiradores"]).lean().exec();
  }

  async findById(id: string): Promise<Usuario> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador", "Tiradores"]).lean().exec(); 
  } 

  async findByMail(id: string): Promise<Usuario> { 
    return this.usuarioModel.findOne({ Correo: new RegExp(id, "i")}).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador", "Tiradores"]).lean().exec(); 
  } 

  async findBySala(sala:string): Promise<Usuario[]> { 
    return this.usuarioModel.find({Sala: new RegExp(sala, "i")}).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador", "Tiradores"]).lean().exec();
  }

  async update(id: string, updateBookDto: UpdateUsuarioDto): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).lean().exec(); 
  }

  async updatebyMail(id: string, updateBookDto: UpdateUsuarioDto): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({ Correo: id }, updateBookDto, { 
      new: true, 
    });
  }

  async removebyMail(id: string) { 
    return this.usuarioModel.findOneAndRemove({ Correo: id }).lean().exec(); 
  }

  async activarUsuario(id: string): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id },{"Activado" : true});
  }
  async removePoule(id: string, idp: string): Promise<Usuario> { 
    return this.usuarioModel.findByIdAndUpdate({_id: id},  {$pull: {"Poules": {_id: idp}}},{new:true});
  }
  async addPoule(id: string, idp: string): Promise<Usuario> { 
      return this.usuarioModel.findOneAndUpdate({_id: id},  {$push: {"Poules": {_id: idp}}},{new:true});
  }
}