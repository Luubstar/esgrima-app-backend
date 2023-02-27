
import { Schema, Prop, SchemaFactory, InjectModel } from '@nestjs/mongoose';
import { Document,Model,model,Types,modelNames } from 'mongoose'; 
export type PouleDocument = Poule & Document; 

@Schema() 
export class Poule {  
  
  @Prop() 
  Nombre: string;

  @Prop({default:"Poule"})
  Tipo: string;

  @Prop({default: 1})
  Estado: number;

  @Prop()
  Creador: string;

  @Prop([String])
  Tiradores: string[];

  @Prop([String])
  Vencedores: string[];

  @Prop([Number]) 
  Valores: number[];

}

export const PouleSchema = SchemaFactory.createForClass(Poule).index({Creador:1}).index({Nombre:1}); 
