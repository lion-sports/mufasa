import { test } from '@japa/runner'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'

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

  test('signup the user', async ({ client, assert }) => {
    const response = await client.post('/auth/signup').json({
      email: 'test2@example.com',
      password: 'passwordtest',
      firstname: 'some new name',
      lastname: 'some other new name'
    })

    assert.equal(response.status(), 200)
    let users = await User.query().where('email', 'test2@example.com')
    assert.lengthOf(users, 1)
    await User.query().delete()
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

  test('login with refresh token', async ({ client, assert }) => {
    const user = await UserFactory
      .merge({
        email: 'test2@example.com',
        password: 'passwordtest'
      })
      .create()

    let response = await client.post('/auth/login').json({
      email: 'test2@example.com',
      password: 'passwordtest',
      generateRefresh: true
    })

    let data = response.body()
    let refreshToken = data.refreshToken

    response = await client.post('/auth/refreshToken').headers({
      'Authorization': 'Bearer ' + refreshToken
    })

    response.assertAgainstApiSpec()
    data = response.body()

    assert.isNotEmpty(data.token, "should generate the api token")
    await user.delete()
  })
})
