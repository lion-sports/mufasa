import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug: boolean = !app.inProduction;
  protected renderStatusPages: boolean = app.inProduction;

  public async handle(error: any, ctx: HttpContext) {
    if (ctx.request.url().startsWith('/web/')) {
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
          return ctx.response.internalServerError({ code: error.code, message: error.message })
      }
    }

    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
