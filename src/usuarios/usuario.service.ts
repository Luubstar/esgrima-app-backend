import { Injectable } from '@nestjs/common';
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
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>, private readonly pouleService: PoulesService
  ) {
  }

  async checkIfAuth(correo : string, clave : string){
    let usuario = await this.findByMail(correo);
    return usuario["Clave"] == clave && usuario["Activado"];
  }

  async checkIfAdmin(correo:string, contraseña:string){
    return (await this.findNivel(correo, contraseña) == adminrole)
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
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador"]).exec();
  }

  async findByName(nombre:string): Promise<Usuario[]> { 
    return this.usuarioModel.find({Nombre: new RegExp(nombre, "i")}).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador"]).exec();
  }

  async findById(id: string): Promise<Usuario> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador"]).exec(); 
  } 

  async findByMail(id: string): Promise<Usuario> { 
    return this.usuarioModel.findOne({ Correo: new RegExp(id, "i")}).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador"]).exec(); 
  } 

  async findBySala(sala:string): Promise<Usuario[]> { 
    return this.usuarioModel.find({Sala: new RegExp(sala, "i")}).setOptions({sanitizeFilter : true}).populate("Poules",["_id", "Nombre", "Tipo", "Estado","Creador"]).exec();
  }

  async update(id: string, updateBookDto: UpdateUsuarioDto): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).exec(); 
  }

  async updatebyMail(id: string, updateBookDto: UpdateUsuarioDto): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({ Correo: id }, updateBookDto, { 
      new: true, 
    });
  }

  async removebyMail(id: string) { 
    return this.usuarioModel.findOneAndRemove({ Correo: id }).exec(); 
  }

  async activarUsuario(id: string): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id },{"Activado" : true});
  }
  async removePoule(id: string, idp: string): Promise<Usuario> { 
    return this.usuarioModel.findOneAndUpdate({_id: id},  {$pull: {"Poules": {_id: idp}}});
  }
  async addPoule(id: string, idp: string): Promise<Usuario> { 
      let usuario = await this.findById(id);
      let poule = await this.pouleService.findOne(idp);
      usuario.Poules.push(poule);
      return usuario;
  }
}