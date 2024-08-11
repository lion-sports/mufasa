import { Config } from '@japa/runner'
import TestUtils from '@ioc:Adonis/Core/TestUtils'
import { assert, specReporter, apiClient } from '@japa/preset-adonis'

export const plugins: Config['plugins'] = [
  assert({
    openApi: {
      schemas: ['api-spec.yml'],
    },
  }), 
  apiClient()
]
export const reporters: Config['reporters'] = [specReporter()]

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => TestUtils.ace().loadCommands(),
    () => TestUtils.db().migrate(),
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
    suite.setup(() => TestUtils.httpServer().start())
  }
}
