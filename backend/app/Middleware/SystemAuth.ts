import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SystemAuth {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if(!auth.isAuthenticated || !auth.user?.system) {
      response.unauthorized({ error: 'Must be system user' })
      return
    }
    
    await next()
  }
}