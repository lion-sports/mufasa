import { FetchBasedService } from "../common/fetchBased.service";
import type { Cookies } from "@sveltejs/kit";
import { browser } from "$app/environment";
import JsCookies from 'js-cookie'
import user from '$lib/stores/auth/user'

export type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  system: boolean
  createdAt: Date
  updatedAt: Date
}

export type LoginParams = {
  data: {
    email: string,
    password: string
  },
  context?: {}
}

export type AuthenticateApiParams = {
  data: {
    email: string,
    password: string
  },
  context?: {}
}

export default class AuthService extends FetchBasedService {

  constructor(params: {
    fetch: any,
    cookies?: Cookies,
    token?: string
  }) {
    super({
      fetch: params.fetch,
      cookies: params.cookies,
      token: params.token
    })
  }


  async login(params: LoginParams) {
    const response = await this.client.post({
      url: '/auth/login',
      body: {
        email: params.data.email,
        password: params.data.password
      },
      baseUrl: 'self'
    })

    if(!!response.errors) throw response

    let newUser = await this.me()
    user.set(newUser)

    return response
  }

  async authenticateApi(params: AuthenticateApiParams) {
    const response = await this.client.post({
      url: '/auth/login',
      body: {
        email: params.data.email,
        password: params.data.password
      }
    })

    this.cookies?.set('session', response.token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30
    })

    return response
  }

  get authToken(): string | undefined {
    if (browser) return JsCookies.get(this.coockieName)
    else return this.cookies?.get(this.coockieName)
  }

  async me(): Promise<User> {
    let response
    try {
      response = await this.client.get({
        url: '/auth/me',
      })

    } catch(error) {
      throw new Error('unable to get user')
    }

    return {
      id: response.id,
      email: response.email,
      firstname: response.firstname,
      lastname: response.lastname,
      system: response.system,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt)
    }
  }

  async deleteTokenCoockie(): Promise<void> {
    this.cookies?.delete(this.coockieName)
  }

  async logout(): Promise<void> {
    const response = await this.client.get({
      url: '/auth/logout',
      baseUrl: 'self'
    })

    if(browser) {
      JsCookies.remove(this.coockieName)
    }
    
    user.set(undefined)
  }
}