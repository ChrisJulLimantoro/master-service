import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class RPCExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    console.log('Exception thrown', exception);
    const ctx = host.switchToRpc();
    const data = ctx.getData();
    // Format the error response
    const errorResponse = {
      statusCode: 500,
      message: 'Internal server error',
      error: exception instanceof Error ? exception.message : exception,
      data: data || null, // Optional: include the original data for debugging
    };

    // Return the error response as the result of the RPC handler
    return errorResponse;
  }
}
