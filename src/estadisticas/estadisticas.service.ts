import { Injectable } from '@nestjs/common';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto';
import { UpdateEstadisticaDto } from './dto/update-estadistica.dto';
import { Estadisticas, EstadisticaDocument } from './schemas/estadistica.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Request } from "express";

@Injectable()
export class EstadisticasService {
  constructor( 
    @InjectModel(Estadisticas.name) private readonly usuarioModel: Model<EstadisticaDocument>, 
  ) {}

  async create(createBookDto: CreateEstadisticaDto): Promise<Estadisticas> { 
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Estadisticas[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true})
  }

  async findOne(id: string): Promise<Estadisticas> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true})
  }

  async update(id: string, updateBookDto: UpdateEstadisticaDto): Promise<Estadisticas> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).lean().exec(); 
  }
}
