import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose'; 
export type SalaDocument = Sala & Document; 

@Schema() 
export class Sala {
  @Prop() 
  Nombre: string;
}

export const SalaSchema = SchemaFactory.createForClass(Sala).index({Nombre: 1}, {unique:true});