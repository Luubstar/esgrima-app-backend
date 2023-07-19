import { Injectable, Inject, Res, HttpStatus, HttpException } from '@nestjs/common';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Poule } from './schemas/poule.schema';
import { Model, Types } from 'mongoose';
import {Request, Response } from "express";
import { UsuarioService} from '../usuarios/usuario.service';
import { changeEstadoDto } from './dto/change-estado.dto';
import { changePouleVencedores } from './dto/change-vencedores.dto';
import { changeValoresDto } from './dto/change-valores.dto';

@Injectable()
export class PoulesService {
  constructor( 
    @InjectModel(Poule.name) private readonly usuarioModel: Model<Poule>
  ) {}
  @Inject(UsuarioService)
  private readonly usuario;

  getModel(){return this.usuarioModel;}

  async create(createBookDto: CreatePouleDto): Promise<Poule> { 
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Poule[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).exec();
  }

  async findOne(id: string): Promise<Poule> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).exec(); 
  }

  async update(id: string, updateBookDto: UpdatePouleDto): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).exec(); 
  }


  async setEstado(idpoule: string, estado: changeEstadoDto,@Res() res:Response) : Promise<Poule>{ 
    if (estado["Estado"] == 1){
      res.status(HttpStatus.OK).send(this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true}));
      this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});}
    else if (estado["Estado"] <= 0){
      let poule = await this.findOne(idpoule);
      let Tiradores = poule["Tiradores"]
      this.remove(idpoule);
      Tiradores.forEach(element => {this.usuario.removePoule(element, idpoule);});
      res.status(HttpStatus.OK).send("Poule Eliminada"); 
      return this.remove(idpoule);
    }
    else if (estado["Estado"] == 2){
      let poule = await this.findOne(idpoule);
      let valores = poule["Valores"];
      let Tiradores = poule["Tiradores"]
      let victorias = [];
      let derrotas = [];
      let tocadosD = [];
      let tocadosR = [];

      for( let i = 0; i < Tiradores.length; i++){
        let suma = 0;
        for (let count = 0; count < Tiradores.length-1; count++){
          suma += valores[(i * (Tiradores.length-1)) + count];}
        tocadosD[i] = suma;
      }

      for( let x = 0; x < Tiradores.length; x++){
        let suma = 0;
        for (let y = 0; y < Tiradores.length; y++){
          if (x !== y){
            suma += valores[y * (Tiradores.length-1) + x];
          }
        }
        tocadosR[x] = suma;
      }
      
      console.log(valores,tocadosD,tocadosR, Tiradores);
      this.setVencedores(idpoule, null);
      
      Tiradores.forEach(tirador => {

      });
      res.status(HttpStatus.OK).send("Poule actualizada");
      return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
    }

  }

  async setVencedores(idpoule: string, estado: changePouleVencedores): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
  }

  async setValores(idpoule: string, correo: string, clave:string, estado: changeValoresDto,@Res() res:Response) { 
    let poule = await this.findOne(idpoule);
    let idUsuario = await this.usuario.GetIfLoged(correo,clave,res);
    let u = await (this.usuario.findById(idUsuario));
    if(res.statusCode == HttpStatus.OK && (await this.usuario.checkIfAdmin(correo, clave) ||u.Poules.includes(new Types.ObjectId(idpoule)))){
      if(await this.usuario.checkIfAdmin(correo, clave) ||  idUsuario == poule["Creador"]){
        await this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
        return res.status(HttpStatus.OK).send("Datos actualizados como administrador");
      }
      else{
        let newVal = estado["Valores"];
        let oldVal = poule["Valores"];
        let dif = await this.dif(oldVal, newVal, res);

        let pos = -1
        let step = poule["Tiradores"].length;
        for(let i = 0; i < dif.length; i++){
          if (i%step == 0){pos += 1}
          if(dif[i] != 0 && pos != poule["Tiradores"].indexOf(idUsuario)){return res.status(HttpStatus.UNAUTHORIZED).send(" No estás autorizado para hacer este cambio...Es el valor de otro usuario 🧐")}
        }
        
        await this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
        return res.status(HttpStatus.OK).send("Datos actualizados correctamente");
       }
    }
    else{return res.status(HttpStatus.UNAUTHORIZED).send(" No estás autorizado para hacer este cambio");}
  }

  async getValores(idpoule: string): Promise<Poule> { 
    let poule = this.usuarioModel.findOne({ _id: idpoule }).setOptions({sanitizeFilter : true}).exec();
    return poule;
  }

  async dif (oldVal:number[], newVal:number[],@Res() res:Response) : Promise<number[]>{
    try{
    let difVal = [];
    if (oldVal.length != newVal.length){ throw new HttpException("Error con los tamaños", HttpStatus.BAD_REQUEST);}
    for(let i = 0; i < oldVal.length; i++){difVal[i] = (oldVal[i] - newVal[i]);}
    res.status(HttpStatus.OK).send();
    return difVal}
    catch{
      res.status(HttpStatus.BAD_REQUEST).send("Error con el tamaño de las listas");
      return null;
    }
  }
}