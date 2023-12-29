import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import Application from '@ioc:Adonis/Core/Application'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if(ctx.request.url().startsWith('/web/')) {
      switch (error.code) {
        case 'E_UNAUTHORIZED_ACCESS':
          return ctx.response.redirect('/web/login')
        case 'E_ROUTE_NOT_FOUND':
          return ctx.response.redirect('/web/users')
      }
    } else {
      switch (error.code) {
        case 'E_UNAUTHORIZED_ACCESS':
          return ctx.response.unauthorized({ message: 'not authorized' })
        case 'E_VALIDATION_FAILURE':
          return ctx.response.badRequest(error.messages)
        default:
          if (Application.inDev || Application.environment == 'test') {
            this.logger.error(error)
          }

          return ctx.response.internalServerError({ code: error.code, message: error.message })
      }
    }

    super.handle(error, ctx)
  }
}
