
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'; 
import { Poule } from 'src/poules/schemas/poule.schema';

export type UsuarioDocument = Usuario & Document; 
@Schema() 
export class Usuario {

  @Prop() 
  Nombre: string;

  @Prop()
  Sala: string;

  @Prop()
  Correo: string;

  @Prop()
  Clave: string;

  @Prop({default: "Tirador"})
  Nivel: string;

  @Prop({default: false})
  Activado: boolean;

  @Prop({default:Date.now})
  Creado: Date;

  @Prop({type:[{type:Types.ObjectId, ref:Poule.name}]}) 
  Poules: Poule[];

  @Prop({default: ""})
  Imagen64: string;
} 
export const UsuarioSchema = SchemaFactory.createForClass(Usuario).index({Nombre:1}).index({Correo:1}, {unique:true}).index({Sala:1});