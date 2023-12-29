import { test } from '@japa/runner'
import { assert } from 'chai'
import { RoleFactory, UserFactory } from 'Database/factories'

test.group('Roles', (group) => {
  let loggedInUser

  group.setup(() => {
    loggedInUser = UserFactory.apply('system').create()
  })

  test('get a paginated list of roles', async ({ client }) => {
    await RoleFactory.create()
    const response = await client.get('/roles').loginAs(loggedInUser)
    const roles = response.body().data

    response.assertAgainstApiSpec()
    assert.isTrue(roles.length > 0, "should have some role in the list")
  })

  test('create new role',async ({ client }) => {
    const response = await client.post('/roles').json({
      name: 'Ruolo test',
      considerReferent: true
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const role = response.body()
    assert.hasAllKeys(role, ['id', 'name', 'permissions', 'createdAt', 'updatedAt'], 'should have all keys')
  })

  test('update existing role',async ({ client }) => {
    const newRole = await RoleFactory.create()
    const response = await client.put('/roles/' + newRole.id).json({
      name: 'UpdatedName',
      considerGallop: true
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const role = response.body()
    assert.equal(newRole.id, role.id, 'should update the correct role')
    assert.equal(role.name, 'UpdatedName', 'should update the role')
  })

  test('get a role', async ({ client }) => {
    const newRole = await RoleFactory.with('permissions', 3).create()
    const response = await client.get('/roles/' + newRole.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const role = response.body()
    assert.equal(newRole.id, role.id, "should return the correct role")
  })
})