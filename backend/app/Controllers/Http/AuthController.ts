import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#app/Models/User'
import SolanaManager from '#app/managers/solana.manager'
import UsersManager from '#app/managers/user.manager'
import { OAuth2Client } from 'google-auth-library'

export default class AuthController {
  public async login({ auth, request }: HttpContext) {
    let generateRefresh = request.input('generateRefresh')

    let user = await User.query().where('email', 'ILIKE', request.input('email')).firstOrFail()

    user = await User.verifyCredentials(user.email, request.input('password'))

    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '7 days',
    })

    let finalToken: any = {
      ...token.toJSON(),
    }

    if (generateRefresh) {
      const refreshToken = await User.rememberMeTokens.create(user, ['*'], {
        expiresIn: '180days',
      })

      finalToken = {
        ...finalToken,
        userId: user.id,
        refreshToken: refreshToken.toJSON().token,
        refreshTokenExpiration: refreshToken.expiresAt,
      }
    }

    return finalToken
  }

  public async logout({ auth }: HttpContext) {
    let user = auth.use('api').user
    if (!user) return { revoked: false }

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return {
      revoked: true,
    }
  }

  public async me({ auth }: HttpContext) {
    await auth.use('api')
    if (!auth.user) return

    let user = await User.query().where('id', auth.user.id)
      .preload('userSetting')
      .firstOrFail()

    return user
  }

  public async signup({ request }: HttpContext) {
    if (!request.input('email')) throw new Error('email required')

    let existingUser = await User.query().where('email', request.input('email')).first()

    if (!!existingUser) throw new Error('User already exists')

    const manager = new UsersManager()
    await manager.create({
      data: {
        email: request.input('email'),
        password: request.input('password'),
        birthday: request.input('birthday'),
        firstname: request.input('firstname'),
        lastname: request.input('lastname'),
        solanaPublicKey: request.input('solanaPublicKey'),
      },
    })

    return true
  }

  public async googleRedirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  public async googleCallback({ auth, ally, response }: HttpContext) {
    const google = ally.use('google')

    if (google.accessDenied()) {
      throw new Error('Access denied')
    } else if (google.stateMisMatch()) {
      throw new Error('Request expired. Retry again')
    } else if (google.hasError()) {
      throw google.getError()
    }

    const googleUser = await google.user()

    const user = await User.updateOrCreate(
      {
        email: googleUser.email || undefined,
      },
      {
        name: googleUser.name || undefined,
        firstname: googleUser.original.given_name,
        lastname: googleUser.original.family_name,
        avatarUrl: googleUser.avatarUrl || undefined,
        googleToken: googleUser.token.token,
      }
    )

    const manager = new SolanaManager()
    if (!user.solanaPublicKey) {
      await manager.keygen({ data: { userId: user.id } })
    }

    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '7 days',
    })

    const refreshToken = await User.rememberMeTokens.create(user, ['*'])

    const tokenJson = token.toJSON()
    const finalToken = {
      ...tokenJson,
      userId: user.id,
      refreshToken: refreshToken.toJSON().token,
      refreshTokenExpiration: refreshToken.expiresAt,
    }

    response
      .redirect()
      .withQs(finalToken)
      .toPath(
        env.get('GOOGLE_FRONTEND_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback'
      )
  }

  public async refreshToken({ auth, request }: HttpContext) {
    let user = await auth.use('refresh').authenticate()

    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '7 days',
    })

    return token
  }

  public async loginWithIosGoogleToken({ request, auth }: HttpContext) {
    let googleToken = request.input('token')
    const client = new OAuth2Client(env.get('GOOGLE_IOS_CLIENT_ID'))

    try {
      let ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: [
          env.get('GOOGLE_IOS_CLIENT_ID', 'some_ios_client_id'),
          env.get('GOOGLE_CLIENT_ID', 'some_client_id'),
        ],
      })

      let googleUser = ticket.getPayload()

      if (!!googleUser) {
        const user = await User.firstOrCreate(
          {
            email: googleUser.email || undefined,
          },
          {
            name: googleUser.name || undefined,
            avatarUrl: googleUser.picture || undefined,
            googleToken: googleToken,
          }
        )

        const token = await User.accessTokens.create(user, ['*'], {
          expiresIn: '7 days',
        })

        const refreshToken = await User.rememberMeTokens.create(user, ['*'])

        const tokenJson = token.toJSON()
        const finalToken = {
          ...tokenJson,
          userId: user.id,
          refreshToken: refreshToken.toJSON().token,
          refreshTokenExpiration: refreshToken.expiresAt,
        }

        return finalToken
      } else {
        throw new Error('Bad google user')
      }
    } catch (error) {
      throw new Error('Bad token')
    }
  }
}
