import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import UsersManager from 'App/managers/user.manager';

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    let user = await User.query().where('email', 'ILIKE', request.input('email'))
      .preload('role', b => b.preload('permissions'))
      .firstOrFail()

    const token = await auth.use('api').attempt(user.email, request.input('password'), {
      expiresIn: '7days'
    })

    return token.toJSON()
  }

  public async loginWeb({ auth, request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      let user = await User.query().where('email', 'ILIKE', email)
      .andWhere('system', true)
      .firstOrFail()

      await auth.use('web').attempt(user.email, password)
      response.redirect('/web/users')
    } catch {
      return response.redirect('/web/login/error')
    }
  }

  public async sendResetPassword({ request }: HttpContextContract) {
    const email = request.input('email')

    let user = await User.query().where('email', 'ILIKE', email)
      .first()

    if (!user) throw new Error('user does not exists')

    let manager = new UsersManager()
    await manager.sendResetPasswordEmail({
      data: {
        user
      }
    })
  }

  public async resetPassword({ request }: HttpContextContract) {
    const userId = request.input('userId')
    const token = request.input('token')
    const newPassword = request.input('newPassword')

    let manager = new UsersManager()
    return await manager.resetPassword({
      data: {
        user: {
          id: userId
        },
        newPassword: newPassword,
        token: token
      }
    })
  }

  public async logoutWeb({ auth, request, response }: HttpContextContract) {
    try {
      await auth.use('web').logout()
      response.redirect('/web/login')
    } catch {
      return response.badRequest('Error logging out')
    }
  }


  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()
    return {
      revoked: true
    }
  }

  public async me({ auth }: HttpContextContract) {
    await auth.use('api')
    let user = auth.user
    if (!!user?.roleId) await user?.load('role')
    if (!!user?.role) await user.role.load('permissions')
    return user
  }
}
