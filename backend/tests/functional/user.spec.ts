import UserModel from 'App/Models/User';
import { test } from '@japa/runner'
import { assert } from 'chai'
import { UserFactory } from 'Database/factories'

test.group('Users', (group) => {
  let loggedInUser

  group.setup(() => {
    loggedInUser = UserFactory.apply('system').create()
  })

  test('get a paginated list of existing users', async ({ client }) => {
    await UserFactory.create()
    const response = await client.get('/users').loginAs(loggedInUser)
    const users = response.body().data

    response.assertAgainstApiSpec()
    assert.isTrue(users.length > 2, "should have some users in the list")
  })

  test('create a new user', async ({ client }) => {
    const response = await client.post('/users').json({
      email: 'someemail@email.com',
      password: 'some_secret_password',
      firstname: 'Pipo',
      lastname: 'Pluto'
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const user = response.body()
    assert.hasAnyKeys(user, ['id'], 'should have the id key')
  })

  test('cannot create a system user', async ({ client }) => {
    await client.post('/users').json({
      email: 'trying_system@email.com',
      password: 'some_secret_password',
      firstname: 'Pipo',
      lastname: 'Pluto',
      system: true
    }).loginAs(loggedInUser)

    let user = await UserModel.query().where('email', 'trying_system@email.com').first()
    assert.isFalse(user?.system, 'should have the system false')
  })

  test('get a user', async ({client}) => {
    const newUser = await UserFactory.create()
    const response = await client.get('/users/' + newUser.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const user = response.body()
    assert.equal(newUser.id, user.id, "should return the correct user")
  })

  test('delete a user', async ({ client }) => {
    const newUser = await UserFactory.create()
    await client.delete('/users/' + newUser.id).loginAs(loggedInUser)

    let user = await UserModel.query().where('id', newUser.id).first()
    assert.notExists(user?.id, "should delete the correct user")
  })

  test('update an existing user', async ({ client }) => {
    const newUser = await UserFactory.create()
    const response = await client.put('/users/' + newUser.id).json({
      email: 'someotheremail@email.com'
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const user = response.body()
    assert.equal(newUser.id, user.id, "should update the correct user")
    assert.equal(user.email, 'someotheremail@email.com', "should update the user")
  })
})
