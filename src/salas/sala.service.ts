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

  async create(createBookDto: CreateSalaDto): Promise<Sala> { 
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Sala[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).populate("Usuarios","_id", "Nombre", "Nivel").exec();
  }

  async findOne(id: string): Promise<Sala> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).populate("Usuarios","_id", "Nombre", "Nivel").exec(); 
  }

  async update(id: string, updateBookDto: UpdateSalaDto): Promise<Sala> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).exec(); 
  }

  async findOneByName(id: string): Promise<Sala> { 
    return this.usuarioModel.findOne({ Nombre: id }).setOptions({sanitizeFilter : true}).populate("Usuarios","_id", "Nombre", "Nivel").exec(); 
  }

  async updatebyName(id: string, updateBookDto: UpdateSalaDto): Promise<Sala> { 
    return this.usuarioModel.findOneAndUpdate({ Nombre: id }, updateBookDto, { 
      new: true, 
    });
  }

  async removebyName(id: string) { 
    return this.usuarioModel.findOneAndRemove({ Nombre: id }).exec(); 
  }
}