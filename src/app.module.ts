import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioModule } from './usuarios/usuario.module';
import { PoulesModule } from './poules/poules.module';
import { SalaModule } from './salas/sala.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Usuarios"), 
    UsuarioModule, PoulesModule, SalaModule,ThrottlerModule.forRoot({
      ttl: 10,
      limit: 20,
    }), ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}