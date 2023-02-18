import { Injectable } from '@nestjs/common';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Poule } from './schemas/poule.schema';
import { Model } from 'mongoose';
import {Request } from "express";

@Injectable()
export class PoulesService {
  constructor( 
    @InjectModel(Poule.name) private readonly usuarioModel: Model<Poule>, 
  ) {}

  async create(createBookDto: CreatePouleDto): Promise<Poule> { 
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Poule[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).exec();
  }

  async findOne(id: string): Promise<Poule> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).exec(); 
  }

  async findOneReturnFilter(id:string, filtro:string){
    let poule = await this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).exec(); 
    return poule[filtro];
  }

  async update(id: string, updateBookDto: UpdatePouleDto): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).exec(); 
  }

}