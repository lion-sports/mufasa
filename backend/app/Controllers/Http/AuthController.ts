import Env from '@ioc:Adonis/Core/Env';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import SolanaManager from 'App/managers/solana.manager';
import UsersManager from 'App/managers/user.manager';
import { OAuth2Client } from 'google-auth-library';

export default class AuthController {
  public async login({ auth, request }: HttpContextContract) {

    await User.query().where('email', 'ILIKE', request.input('email'))
    let generateRefresh = request.input('generateRefresh')

    const token = await auth.use('api').attempt(
      request.input('email'), 
      request.input('password'), 
      {
        expiresIn: '7days'
      }
    )

    let finalToken: any = {
      ...token.toJSON()
    }

    if (generateRefresh) {
      const refreshToken = await auth.use('refresh').generate(
        token.user,
        {
          expiresIn: '180days'
        }
      )

      finalToken = {
        ...finalToken,
        userId: refreshToken.user.id,
        refreshToken: refreshToken.token,
        refreshTokenExpiration: refreshToken.expiresAt?.toJSDate()
      }
    }

    return finalToken
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()
    return {
      revoked: true
    }
  }

  public async me({ auth }: HttpContextContract) {
    await auth.use('api')
    return auth.user
  }

  public async signup({ request }: HttpContextContract) {
    if(!request.input('email')) throw new Error('email required')

    let existingUser = await User.query()
      .where('email', request.input('email'))
      .first()

    if(!!existingUser) throw new Error('User already exists')

    const manager = new UsersManager()
    await manager.create({
      data: {
        email: request.input('email'),
        password: request.input('password'),
        firstname: request.input('firstname'),
        lastname: request.input('lastname')
      }
    })

    return true
  }

  public async googleRedirect({ ally }: HttpContextContract) {
    return ally.use('google').redirect()
  }

  public async googleCallback({ auth, ally, response }: HttpContextContract) {
    const google = ally.use('google')


    if (google.accessDenied()) {
      throw new Error("Access denied");
    } else if (google.stateMisMatch()) {
      throw new Error('Request expired. Retry again');
    } else if (google.hasError()) {
      throw google.getError()
    }

    const googleUser = await google.user()

    
    const user = await User.updateOrCreate({
      email: googleUser.email || undefined,
    }, {
      name: googleUser.name || undefined,
      firstname: googleUser.original.given_name,
      lastname: googleUser.original.family_name,
      avatarUrl: googleUser.avatarUrl || undefined,
      googleToken: googleUser.token.token
    })

    
    const manager = new SolanaManager();
    if(!user.solanaPublicKey) {
      await manager.keygen( { data: {userId: user.id}})
      await manager.airdrop( { data: {userId: user.id}})
    }

    const token = await auth.use('api').login(user, {
      expiresIn: '7days'
    })

    const refreshToken = await auth.use('refresh').generate(user, {
      expiresIn: '180days'
    })

    const tokenJson = token.toJSON()
    const finalToken = {
      ...tokenJson,
      userId: token.user.id,
      refreshToken: refreshToken.token,
      refreshTokenExpiration: refreshToken.expiresAt?.toJSDate()
    }

    response.redirect().withQs(finalToken).toPath(Env.get('GOOGLE_FRONTEND_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback')
  }

  public async refreshToken({ auth }: HttpContextContract) {
    let user = await auth.use('refresh').authenticate()
    
    let apiToken = await auth.use('api').generate(user, {
      expiresIn: '7days'
    })

    return apiToken
  }

  public async loginWithIosGoogleToken({ request, auth }: HttpContextContract) {
    let googleToken = request.input('token')
    const client = new OAuth2Client(Env.get('GOOGLE_IOS_CLIENT_ID'))

    try {
      let ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: [Env.get('GOOGLE_IOS_CLIENT_ID'), Env.get('GOOGLE_CLIENT_ID')]
      })

      let googleUser = ticket.getPayload()

      if(!!googleUser) {
        const user = await User.firstOrCreate({
          email: googleUser.email || undefined,
        }, {
          name: googleUser.name || undefined,
          avatarUrl: googleUser.picture || undefined,
          googleToken: googleToken
        })

        const token = await auth.use('api').login(user, {
          expiresIn: '7days'
        })

        const refreshToken = await auth.use('refresh').generate(user, {
          expiresIn: '180days'
        })

        const tokenJson = token.toJSON()
        const finalToken = {
          ...tokenJson,
          userId: token.user.id,
          refreshToken: refreshToken.token,
          refreshTokenExpiration: refreshToken.expiresAt?.toJSDate()
        }

        return finalToken
      } else {
        throw new Error("Bad google user")
      }
      
    } catch(error) {
      throw new Error("Bad token");
    }
  }
}
