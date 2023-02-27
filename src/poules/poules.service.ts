import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Poule } from './schemas/poule.schema';
import { Model } from 'mongoose';
import {Request } from "express";
import { UsuarioService } from 'src/usuarios/usuario.service';
import { changeEstadoDto } from './dto/change-estado.dto';
import { changePouleVencedores } from './dto/change-vencedores.dto';
import { changeValoresDto } from './dto/change-valores.dto';

@Injectable()
export class PoulesService {
  constructor( 
    @InjectModel(Poule.name) private readonly usuarioModel: Model<Poule>, @Inject(forwardRef(() => UsuarioService)) private readonly usuarioService: UsuarioService
  ) {}

  async create(createBookDto: CreatePouleDto): Promise<Poule> { 
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Poule[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).lean().exec();
  }

  async findOne(id: string): Promise<Poule> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).lean().exec(); 
  }

  async findOneReturnFilter(id:string, filtro:string){
    let poule = await this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).lean().exec(); 
    return poule[filtro];
  }

  async update(id: string, updateBookDto: UpdatePouleDto): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).lean().exec(); 
  }

  async removefromlista(idpoule: string, iduser: string, lista:string): Promise<Poule> { 
    return this.usuarioModel.findByIdAndUpdate({_id: idpoule},  {$pull: {lista: {_id: iduser}}},{new:true});
  }
  async addfromlista(idpoule: string, iduser: string, lista:string): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({_id: idpoule},  {$push: {lista: {_id: iduser}}},{new:true});
  }

  async setEstado(idpoule: string, estado: changeEstadoDto): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
  }

  async setVencedores(idpoule: string, estado: changePouleVencedores): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
  }
  async setValores(idpoule: string, estado: changeValoresDto): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
  }
  async getValores(idpoule: string): Promise<Poule> { 
    return this.usuarioModel.findOne({ _id: idpoule }).setOptions({sanitizeFilter : true}).lean().exec();
  }
}