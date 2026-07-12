import { ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
export declare class BusinessExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost): void;
    private mapError;
}
