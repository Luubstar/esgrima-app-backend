import { ArgumentsHost, Catch, ConflictException, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import {Response} from "express";

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    switch (exception.code) {
      case 11000:
        let ctx = host.switchToHttp()
        let response = ctx.getResponse<Response>();
        response.status(HttpStatus.BAD_REQUEST).send("Documento duplicado")
        return response;
        // duplicate exception
        // do whatever you want here, for instance send error to client
      default:
        ctx = host.switchToHttp()
        response = ctx.getResponse<Response>();
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Error no identificado")
        return response;
    }
  }
}