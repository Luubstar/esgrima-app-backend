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
    @InjectModel(Estadisticas.name) private readonly estadisticaModel: Model<EstadisticaDocument>, 
  ) {}

  async create(createEstadisticaDto: CreateEstadisticaDto): Promise<Estadisticas> { 
    return this.estadisticaModel.create(createEstadisticaDto); 
  }

  async findAll(request: Request): Promise<Estadisticas[]> { 
    return this.estadisticaModel.find(request.query).setOptions({sanitizeFilter : true})
  }

  async findOne(id: string): Promise<Estadisticas> { 
    return this.estadisticaModel.findOne({ _id: id }).setOptions({sanitizeFilter : true})
  }

  async update(id: string, updateBookDto: UpdateEstadisticaDto): Promise<Estadisticas> { 
    return this.estadisticaModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.estadisticaModel.findByIdAndRemove({ _id: id }).lean().exec(); 
  }
}
