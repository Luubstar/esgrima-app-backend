import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto';
import { UpdateEstadisticaDto } from './dto/update-estadistica.dto';
import { Estadisticas, EstadisticaDocument } from './schemas/estadistica.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Request, Response } from "express";

@Injectable()
export class EstadisticasService {
  constructor( 
    @InjectModel(Estadisticas.name) private readonly estadisticaModel: Model<EstadisticaDocument>, 
  ) {}

  async create(createEstadisticaDto: CreateEstadisticaDto, Usuario:string, @Res() res: Response) {
    var date = new Date();
    if (Usuario.length > 0)
    {
      if (!(await this.checkIfMultiple(Usuario.toString(), date.getMonth(), date.getFullYear()))){
        createEstadisticaDto["Usuario"] = Usuario.toString();
        createEstadisticaDto["Mes"] = date.getMonth();
        createEstadisticaDto["Año"] = date.getFullYear();
        return res.status(HttpStatus.ACCEPTED).send(this.estadisticaModel.create(createEstadisticaDto));
      }
      else{return res.status(HttpStatus.CONFLICT).send("Ya existen estadísticas con ese mes y año para el usuario");}
    }
    else {return res.status(HttpStatus.CONFLICT).send("Usuario no indicado");}
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

  async checkIfMultiple(Usuario:string, Mes:number, Año:number) : Promise<boolean>{ 
    return !(await this.estadisticaModel.findOne({ Usuario: Usuario, Mes: Mes, Año:Año}).setOptions({sanitizeFilter : true}).exec() == null);
  }

  async getFromUser(Usuario:string, Mes:number, Año:number) : Promise<Estadisticas>{ 
    return  this.estadisticaModel.findOne({ Usuario: Usuario, Mes: Mes, Año:Año}).setOptions({sanitizeFilter : true});
  }
}
