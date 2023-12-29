import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VerifyAccountEmailMailer from 'App/Mailers/VerifyAccountEmail'
import User from 'App/Models/User'
import UsersManager from 'App/managers/user.manager'
import { Modifier } from 'App/services/FilterModifierApplier'
import { DateTime } from 'luxon'

export default class UsersController {
  public async index({ request, view }: HttpContextContract) {
    let filters: Modifier[] = request.input('filters') || []

    if (!!request.input('search-text')) {
      filters.push({
        method: 'where',
        kind: 'simple',
        key: 'email',
        operator: 'ILIKE',
        value: `%${request.input('search-text')}%`
      })
    }

    const manager = new UsersManager()
    let results = await manager.list({
      data: {
        page: request.input('page') || 1,
        perPage: request.input('perPage') || 50,
        filtersBuilder: {
          modifiers: filters
        },
        order: [
          {
            column: 'createdAt',
            order: 'desc'
          }
        ]
      }
    })

    return view.render('users/list', {
      users: results.data,
      DateTime: DateTime,
      meta: results.meta,
      searchText: request.input('search-text')
    })
  }

  public async new({ view }: HttpContextContract) {
    return view.render('users/new')
  }

  public async store({ view, request, response }: HttpContextContract) {
    let email = request.input('email')
    let firstname = request.input('firstname')
    let lastname = request.input('lastname')
    let password = request.input('password')

    const manager = new UsersManager()
    await manager.create({
      data: {
        email: email,
        firstname: firstname,
        lastname: lastname,
        password: password
      }
    })

    response.redirect('/web/users')
  }

  public async edit({ view, request }: HttpContextContract) {
    const userId = request.param('id')
    const manager = new UsersManager()
    const user = await manager.get({
      data: {
        id: userId
      }
    })

    
    return view.render('users/edit', {
      user
    })
  }

  public async update({ view, request, response }: HttpContextContract) {
    const userId = request.param('id')
    let email = request.input('email')
    let firstname = request.input('firstname')
    let lastname = request.input('lastname')
    let password = request.input('password')

    const manager = new UsersManager()
    await manager.update({
      data: {
        id: userId,
        email: email,
        firstname: firstname,
        lastname: lastname,
        password: !!password ? password : undefined
      }
    })

    response.redirect('/web/users')
  }

  public async sendVerifyAccountEmail({ response, request, params }: HttpContextContract) {
    let userId = params.id
    let user = await User.findOrFail(userId)

    let mailer = new VerifyAccountEmailMailer({ user })
    await mailer.sendLater()

    response.redirect('/web/users')
  }
}
