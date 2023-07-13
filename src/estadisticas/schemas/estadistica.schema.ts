import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; 

export type EstadisticaDocument = Estadisticas & Document; 
@Schema() 
export class Estadisticas {

  @Prop() 
  Usuario: string

  @Prop({default: 0})
  Mes: number;

  @Prop({default: 2023})
  Año : number

  @Prop({default : 0})
  Victorias : number

  @Prop({default : 0})
  Derrotas : number

  @Prop({default : 0})
  TocadosDados : number

  @Prop({default : 0})
  TocadosRecividos : number

  @Prop({default : 0})
  PoulesTotales : number

} 
export const EstadistcaSchema = SchemaFactory.createForClass(Estadisticas).index({Usuario:1});