import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose'; 
import { Usuario } from '../../usuarios/schemas/usuario.schema';
export type SalaDocument = Sala & Document; 

@Schema() 
export class Sala {
  @Prop() 
  Nombre: string;

  @Prop({type:[{type:Types.ObjectId, ref:Usuario.name}]}) 
  Usuarios: Usuario[];
}

export const SalaSchema = SchemaFactory.createForClass(Sala).index({Nombre: 1}, {unique:true});
model("Sala", SalaSchema);