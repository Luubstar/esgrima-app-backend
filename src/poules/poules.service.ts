import { Injectable, Inject, Res, HttpStatus, HttpException, UseFilters } from '@nestjs/common';
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
import { EstadisticasService } from '../estadisticas/estadisticas.service';
import { CreateEstadisticaDto } from '../estadisticas/dto/create-estadistica.dto';
import { MongoExceptionFilter } from '../mongo-exception.filter';

@Injectable()
export class PoulesService {
  constructor( 
    @InjectModel(Poule.name) private readonly usuarioModel: Model<Poule>
  ) {}
  @Inject(UsuarioService)
  private readonly usuario;

  @Inject(EstadisticasService)
  private readonly estadistica;


  getModel(){return this.usuarioModel;}

  @UseFilters(MongoExceptionFilter)
  async create(createBookDto: CreatePouleDto): Promise<Poule> { 
    return this.usuarioModel.create(createBookDto); 
  }

  @UseFilters(MongoExceptionFilter)
  async findAll(request: Request): Promise<Poule[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).exec();
  }

  @UseFilters(MongoExceptionFilter)
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
      res.status(HttpStatus.OK).send(await this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true}));
    }
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
      let valores2D = [];
      let i = 0;

      for (let x = 0; x < Tiradores.length; x++){
        let res = [];
        for(let y = 0; y < Tiradores.length; y++){
          if(x == y){res[y] = -1;}
          else{res[y] = valores[i]; i++;}
        }
        valores2D[x] = res;
      }

      for( let i = 0; i < Tiradores.length; i++){
        let suma = 0;
        for (let count = 0; count < Tiradores.length-1; count++){
          suma += valores[(i * (Tiradores.length-1)) + count];}
        tocadosD[i] = suma;
        victorias[i] = 0;
        derrotas[i] = 0;
      }

      for( let x = 0; x < Tiradores.length; x++){
        let suma = 0;
        for (let y = 0; y < Tiradores.length; y++){
          if (valores2D[y][x] != -1){
            suma += valores2D[y][x];}}
        tocadosR[x] = suma;}

      for( let Usuario = 0; Usuario < Tiradores.length; Usuario++){
        for(let desp = 0; desp < Tiradores.length; desp++){
          if (desp != Usuario && valores2D[Usuario][desp] != -1 && valores2D[desp][Usuario] != -1){
            if(valores2D[Usuario][desp] > valores2D[desp][Usuario]){victorias[Usuario]++;}
            else if(valores2D[Usuario][desp] <= valores2D[desp][Usuario]){derrotas[Usuario]++;}
          }}}
      
      let lowest = 3 < victorias.length ? 3 : victorias.length;
      let ganadores = []
      for(let i = 0; i < lowest; i++ ){
        let high = 0;
        let index = 0;

        for(let valor; valor < victorias.length; valor++){
          if( high < victorias[valor]){high = victorias[valor]; index = valor;}
          else if (high == victorias[valor]){
            if(derrotas[valor] < derrotas[index]){index = valor;}
            else{if(tocadosD[valor]/tocadosR[valor] > tocadosD[index]/tocadosR[index]){index = valor;}}
          }
        }
        victorias[index] = 0;
        derrotas[index] = 0;
        ganadores[i] = Tiradores[index];
      }

      let vencedores = new changePouleVencedores();
      vencedores.Vencedores = ganadores;
      this.setVencedores(idpoule, vencedores);
      
      for(let t = 0; t < Tiradores.length; t++){
        let dto = new CreateEstadisticaDto();
        dto.Victorias = victorias[t];
        dto.Derrotas = derrotas[t];
        dto.TocadosDados = tocadosD[t];
        dto.TocadosRecibidos = tocadosR[t];
        await this.estadistica.create(dto, Tiradores[t], res);
      }
      
      res.status(HttpStatus.OK).send("Poule actualizada");
      return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
    }

  }

  async setVencedores(idpoule: string, estado: changePouleVencedores): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
  }

  async setValores(idpoule: string, correo: string, clave:string, estado: changeValoresDto,@Res() res:Response) { 
    let poule = await this.findOne(idpoule);
    res.status(HttpStatus.OK);
    let idUsuario = await this.usuario.GetIfLoged(correo,clave,res);
    let u = await (this.usuario.findById(idUsuario));
    if(res.statusCode == HttpStatus.OK && (await this.usuario.checkIfAdmin(correo, clave) || await this.CheckIfInPoule(u.Poules, idpoule) )){
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

  async CheckIfInPoule(Poules : Poule[], idC : string){
    let res = false;
    Poules.forEach(element => {
      if(element["_id"] == idC){res = true;}
    });
    return res;
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