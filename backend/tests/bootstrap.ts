import { Config } from '@japa/runner/types'
import app from '@adonisjs/core/services/app'
import { assert } from '@japa/assert'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { apiClient } from '@japa/api-client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import testUtils from '@adonisjs/core/services/test_utils'
import env from '#start/env'
import { openapi } from '@japa/openapi-assertions'

export const plugins: Config['plugins'] = [
  assert({
    openApi: {
      schemas: [app.makePath('api-spec.yml')]
    },
  }),
  openapi({
    schemas: [app.makePath('api-spec.yml')]
  }),
  apiClient({
    baseURL: `http://${env.get('HOST')}:${env.get('PORT')}`
  }),
  authApiClient(app),
  pluginAdonisJS(app),
]
export const reporters: Config['reporters'] = {
  activated: ['spec'],
}

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => testUtils.db().migrate()
  ],
  teardown: [],
}

/*
|--------------------------------------------------------------------------
| Configure individual suites
|--------------------------------------------------------------------------
|
| The configureSuite method gets called for every test suite registered
| within ".adonisrc.json" file.
|
| You can use this method to configure suites. For example: Only start
| the HTTP server when it is a functional suite.
*/
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (suite.name === 'functional' || suite.name == 'managers') {
    suite.setup(() => testUtils.httpServer().start())
  }
}
