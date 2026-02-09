import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { EntityNotFoundError, QueryFailedError, TypeORMError } from "typeorm";



@Catch(TypeORMError)
export class TypeORMFitler implements ExceptionFilter {
    private errorTypes= {
        '23505':  {status: HttpStatus.CONFLICT, message: 'Resource already exists', error : 'DuplicateEntry'},
        '23503': {status: HttpStatus.NOT_FOUND, message: 'Referenced resource not found', error: 'ForeignKeyViolation'},
        '23502': {status: HttpStatus.BAD_REQUEST, message: 'Required field missing', error: 'NotNullViolation'},
        '22P02': {status: HttpStatus.BAD_REQUEST, message: 'Invalid data format', error: 'InvalidDataFormat'}
    }
    catch(exception: any, host: ArgumentsHost) {
        let response = host.switchToHttp().getResponse()
        let message= 'Database query error occured'
        let status= HttpStatus.INTERNAL_SERVER_ERROR
        let error ='DatabaseQueryError'
        if (exception instanceof EntityNotFoundError) {
            status = HttpStatus.NOT_FOUND
            message= this.getEntityNotFoundMessage(exception)
            error= 'NotFound'
        } else if (exception instanceof QueryFailedError) {
            const err= exception as QueryFailedError & {code : string}
            const errorTypes= this.errorTypes[err.code]
            if(errorTypes) {
                message= errorTypes.message
                status= errorTypes.status
                error= errorTypes.error 
            }
        }
        response.status(status).json({
            message,
            status,
            error,
            timestamp: new Date().toISOString()
        })
    }
            private getEntityNotFoundMessage(exception: EntityNotFoundError): string {
                const message = exception.message;
                const entityMatch = message.match(/entity of type "(\w+)"/)
                if (!entityMatch) {
                    return 'Resource not found'
                }
                const entityName = entityMatch[1]
                return  `${entityName} not found`
        }
}