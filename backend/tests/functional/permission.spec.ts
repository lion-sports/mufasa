import { test } from '@japa/runner'
import { assert } from 'chai'
import { UserFactory } from 'Database/factories'
import PermissionFactory from 'Database/factories/PermissionFactory'

test.group('Permissions', (group) => {
  let loggedInUser

  group.setup(()=>{
    loggedInUser = UserFactory.create()
  })

  test('get a paginated list of permissions',async ({ client }) => {
    await PermissionFactory.with('roles', 3).createMany(3)
    const response = await client.get('/permissions').loginAs(loggedInUser)
    const permissions = response.body().data

    response.assertAgainstApiSpec()
    assert.isTrue(permissions.length > 0, "should have some permissions in the list")
  })

  test('get a permission',async ({ client }) => {
    const newPermission = await PermissionFactory.with('roles', 2).create()
    const response = await client.get('/permissions/' + newPermission.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const permission = response.body()
    assert.equal(newPermission.id, permission.id, "should return the correct permission")
  })
})