import { test } from '@japa/runner'
import { assert } from 'chai'
import { UserFactory } from '#database/factories/index'
import User from '#models/User'
import { DateTime } from 'luxon'

test.group('Users', (group) => {
  let loggedInUser: User

  group.setup(async () => {
    loggedInUser = await UserFactory.create()
  })

  test('get a paginated list of existing users', async ({ client }) => {
    await UserFactory.create()
    const response = await client.get('/users').loginAs(loggedInUser)

    response.assertAgainstApiSpec()
  })

  test('get a user', async ({ client }) => {
    const newUser = await UserFactory.create()
    const response = await client.get('/users/' + newUser.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const user = response.body()
    assert.equal(newUser.id, user.id, 'should return the correct user')
  })

  test('update an existing user', async ({ client }) => {
    const response = await client
      .put('/users/' + loggedInUser.id)
      .json({
        email: 'someotheremail@email.com',
      })
      .loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const user = response.body()
    assert.equal(loggedInUser.id, user.id, 'should update the correct user')
    assert.equal(user.email, 'someotheremail@email.com', 'should update the user')
  })
})
