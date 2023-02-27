import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as basicAuth from 'express-basic-auth';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
        challenge: true,
        users: {
            Admin: 'LuubStar',
        },
    }),
);
    app.enableCors();
    app.use(helmet());

  // Configurar títulos de documentación
  const options = new DocumentBuilder() 
    .setTitle('MongoDB REST API')
    .setDescription('API REST de EsgrimaApp')
    .setVersion('0.0')
    .build();
  const document = SwaggerModule.createDocument(app, options); 

  // La ruta en que se sirve la documentación
  SwaggerModule.setup('docs', app, document); 

  await app.listen(8080, "0.0.0.0");
}
bootstrap();  