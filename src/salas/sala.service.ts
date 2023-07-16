import { Injectable } from '@nestjs/common';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sala, SalaDocument } from './schemas/sala.schema';
import { Model } from 'mongoose';
import {Request } from "express";

@Injectable()
export class SalaService {
  constructor( 
    @InjectModel(Sala.name) private readonly usuarioModel: Model<SalaDocument>, 
  ) {}

  getModel(){return this.usuarioModel;}

  async create(createBookDto: CreateSalaDto): Promise<Sala> { 
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Sala[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).exec();
  }

  async findOne(id: string): Promise<Sala> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).exec(); 
  }

  async update(id: string, updateBookDto: UpdateSalaDto): Promise<Sala> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string): Promise<Sala> { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).exec(); 
  }

  async findOneByName(id: string): Promise<Sala> { 
    return this.usuarioModel.findOne({ Nombre: id }).setOptions({sanitizeFilter : true}).exec(); 
  }

}