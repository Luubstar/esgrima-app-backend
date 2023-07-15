import { Injectable, Inject, Res, HttpStatus } from '@nestjs/common';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Poule } from './schemas/poule.schema';
import { Model } from 'mongoose';
import {Request, Response } from "express";
import { UsuarioService} from 'src/usuarios/usuario.service';
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

  async create(createBookDto: CreatePouleDto): Promise<Poule> { 
    return this.usuarioModel.create(createBookDto); 
  }

  async findAll(request: Request): Promise<Poule[]> { 
    return this.usuarioModel.find(request.query).setOptions({sanitizeFilter : true}).lean().exec();
  }

  async findOne(id: string): Promise<Poule> { 
    return this.usuarioModel.findOne({ _id: id }).setOptions({sanitizeFilter : true}).lean().exec(); 
  }

  async update(id: string, updateBookDto: UpdatePouleDto): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({ _id: id }, updateBookDto, { 
      new: true, 
    });
  }

  async remove(id: string) { 
    return this.usuarioModel.findByIdAndRemove({ _id: id }).lean().exec(); 
  }


  async setEstado(idpoule: string, estado: changeEstadoDto,@Res() res:Response): Promise<Poule> { 
    if (estado["Estado"] == 1){return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});}
    else if (estado["Estado"] <= 0){
      var poule = await this.findOne(idpoule);
      var Tiradores = poule["Tiradores"]
      this.remove(idpoule);
      Tiradores.forEach(element => {this.usuario.removePoule(element, idpoule);});
      }
    else if (estado["Estado"] == 2){
      //Codigo para calcular vencedores
      this.setVencedores(idpoule, null);
      //Codigo para crear/actualizar estadísticas
    }
    else{ res.status(HttpStatus.FORBIDDEN).send("Estado no válido");}
  }

  async setVencedores(idpoule: string, estado: changePouleVencedores): Promise<Poule> { 
    return this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true});
  }
  async setValores(idpoule: string, correo: string, clave:string, estado: changeValoresDto,@Res() res:Response) { 
    var poule = await this.findOne(idpoule);
    var idUsuario = await this.usuario.GetIfLoged(correo,clave)
    if(this.usuario.checkIfAdmin(correo, clave) || await (this.usuario.findById(idUsuario))["Poules"].includes(idpoule)){
      if(!this.usuario.checkIfAdmin(correo, clave) || !( idUsuario == poule["Creador"])){
        var newVal = estado["Valores"];
        var oldVal = poule["Valores"];
        var dif = await this.dif(oldVal, newVal, res);

        var pos = 0
        var step = poule["Tiradores"].length;
        for(var i = 0; i < dif.length; i++){
          if (i%step == 0){pos += 1}
          if(dif[i] != 0 && pos != poule["Tiradores"].indexOf(idUsuario)){console.log("Mallll");}
        }
        res.status(HttpStatus.OK).send(this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true}));
        
      }
      else{
        res.status(HttpStatus.OK).send(this.usuarioModel.findOneAndUpdate({_id: idpoule}, estado,{new:true}));
      }
    }
    else{res.status(HttpStatus.UNAUTHORIZED).send("No estás autorizado para hacer este cambio")}
  }
  async getValores(idpoule: string): Promise<Poule> { 
    return this.usuarioModel.findOne({ _id: idpoule }).setOptions({sanitizeFilter : true}).lean().exec();
  }

  async dif (oldVal:number[], newVal:number[],@Res() res:Response) : Promise<number[]>{
    var difVal = [];
    if (oldVal.length != newVal.length){res.status(HttpStatus.BAD_REQUEST).send("Error con el tamaño de las listas");}
    for(var i = 0; i < oldVal.length; i++){difVal[i] = (oldVal[i] - newVal[i]);}
    return difVal
  }
}