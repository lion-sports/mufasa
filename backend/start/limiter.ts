/*
|--------------------------------------------------------------------------
| Define HTTP rate limiters
|--------------------------------------------------------------------------
|
| The "Limiter.define" method callback receives an instance of the HTTP
| context you can use to customize the allowed requests and duration
| based upon the user of the request.
|
*/

import { Limiter } from '@adonisjs/limiter/build/services'
import Application from '@ioc:Adonis/Core/Application'

export const { httpLimiters } = Limiter.define('global', () => {
    return Limiter.allowRequests(100).every('1 min')
  }).define('resetPassword', ({ auth }) => {
    if (Application.nodeEnvironment === 'development' || Application.nodeEnvironment == 'test' || auth.user?.system) {
      return Limiter.allowRequests(100).every('1 min')
    } else {
      return Limiter.allowRequests(1).every('1 min')
    }
  })
