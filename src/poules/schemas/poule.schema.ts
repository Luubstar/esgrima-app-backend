
import { Schema, Prop, SchemaFactory, InjectModel } from '@nestjs/mongoose';
import { Document,Model,model,Types,modelNames } from 'mongoose'; 
export type PouleDocument = Poule & Document; 

@Schema() 
export class Poule {  
  @Prop() 
  Nombre: string;

  @Prop()
  Tipo: string;

  @Prop()
  Estado: number;

  @Prop({type: Types.ObjectId})
  Creador: string;

  @Prop({type:[{type: Types.ObjectId}]})
  Tiradores: string[];

  @Prop({type: [{type: Types.ObjectId}]})
  Vencedores: string[];

  @Prop([Number]) 
  Valores: number[];

}

export const PouleSchema = SchemaFactory.createForClass(Poule).index({Creador:1}).index({Nombre:1}); 
