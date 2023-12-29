import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'
import Mail from '@ioc:Adonis/Addons/Mail'

test.group('Auth', () => {
  test('return a token for a user', async ({ client }) => {
    const user = await UserFactory
      .merge({
        email: 'test@example.com',
        password: 'passwordtest'
      })
      .create()

    const response = await client.post('/auth/login').json({
      email: 'test@example.com',
      password: 'passwordtest'
    })

    response.assertAgainstApiSpec()

    await user.delete()
  })

  test('revoke a token for a user', async ({ client }) => {
    const user = await UserFactory
      .merge({
        email: 'test@example.com',
        password: 'passwordtest'
      })
      .create()


    const response = await client.post('/auth/logout').loginAs(user)

    response.assertAgainstApiSpec()

    await user.delete()
  })

  test('reset password email', async ({ client, assert }) => {
    const mailer = Mail.fake()

    const user = await UserFactory
      .merge({
        email: 'test3@example.com',
        password: 'passwordtest'
      })
      .create()

    await client.post('/auth/sendResetPassword').json({
      email: 'test3@example.com'
    })

    assert.isTrue(mailer.exists((mail) => {
      return mail.subject === 'Reset password'
    }))

    Mail.restore()
  })
})
