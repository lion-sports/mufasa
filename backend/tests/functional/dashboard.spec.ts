import { test } from '@japa/runner'
import { assert } from 'chai'
import { UserFactory, DashboardFactory } from '#database/factories/index'
import Dashboard from '#app/Models/Dashboard'
import User from '#app/Models/User'

test.group('Dashboard', (group) => {
  let loggedInUser: User

  group.setup(async () => {
    loggedInUser = await UserFactory.create()
  })

  test('get a paginated list of existing dashboards', async ({ client }) => {
    await Dashboard.query().del()
    await DashboardFactory.with('widgets', 4)
      .merge(Array.from({ length: 5 }).map((u) => ({ userId: loggedInUser.id })))
      .createMany(5)

    const response = await client.get('/dashboards').loginAs(loggedInUser)
    const dashboards = response.body().data

    assert.isTrue(dashboards.length === 5, 'should have 5 dashboards in the list')
  })

  test('create a new dashboards plan', async ({ client }) => {
    const response = await client
      .post('/dashboards')
      .json({
        name: 'Dashboard di prova',
        active: false,
        widgets: [
          {
            componentName: 'ComponentOne',
            height: 2,
            width: 2,
            left: 0,
            top: 0,
          },
          {
            componentName: 'ComponentTwo',
            height: 4,
            width: 2,
            left: 2,
            top: 0,
          },
        ],
      })
      .loginAs(loggedInUser)

    const dashboard = response.body()
    assert.hasAnyKeys(dashboard, ['id'], 'should have the id key')
    assert.equal(dashboard.name, 'Dashboard di prova', 'should have the correct name')
    assert.equal(dashboard.widgets.length, 2, 'should have created the widgets')
  })

  test('get a dashboard', async ({ client }) => {
    const newDashboard = await DashboardFactory.merge({ userId: loggedInUser.id }).create()
    const response = await client.get('/dashboards/' + newDashboard.id).loginAs(loggedInUser)

    const dashboard = response.body()
    assert.equal(dashboard.id, newDashboard.id, 'should return the correct dashboard')
    assert.exists(dashboard.widgets, 'should return the dashboard widgets')
  })

  test('delete a dashboard', async ({ client }) => {
    const newDashboard = await DashboardFactory.merge({ userId: loggedInUser.id }).create()
    await client.delete('/dashboards/' + newDashboard.id).loginAs(loggedInUser)

    let dashboard = await Dashboard.query().where('id', newDashboard.id).first()
    assert.notExists(dashboard, 'should delete the correct dashboards')
  })

  test('update an existing dashboard', async ({ client }) => {
    const newDashboard = await DashboardFactory.merge({ userId: loggedInUser.id }).create()
    const response = await client
      .put('/dashboards/' + newDashboard.id)
      .json({
        name: 'Nome aggiornato',
      })
      .loginAs(loggedInUser)

    const dashboard = response.body()
    assert.equal(newDashboard.id, dashboard.id, 'should update the correct dashboard')
    assert.equal(dashboard.name, 'Nome aggiornato', 'should update the dashboard name')
  })
})
