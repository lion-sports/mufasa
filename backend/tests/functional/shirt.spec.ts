import User from '#app/Models/User'
import Team from '#app/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory } from '#database/factories/index'
import Teammate from '#app/Models/Teammate';
import TeammateFactory from '#database/factories/TeammateFactory';
import Shirt from '#app/Models/Shirt';

test.group('Shirts', (group) => {
  let loggedInUser: User
  let team: Team
  let teammate: Teammate

  group.setup(async () => {
    team = await TeamFactory.with('owner').create()
    await team.load('owner')
    loggedInUser = team.owner
    await team.related('teammateUsers').save(team.owner)

    teammate = await TeammateFactory.with('user').create()
    teammate.teamId = team.id
    await teammate.save()
  })

  test('create a new shirt', async ({ client, assert }) => {
    const response = await client.post('/shirts').json({
      number: 1,
      name: 'il numero uno',
      primaryColor: '#fff',
      secondaryColor: '#000',
      teammateId: teammate.id
    }).loginAs(loggedInUser)


    const shirt = response.body()
    response.assertAgainstApiSpec()
    assert.equal(shirt.name, 'il numero uno', 'should have the right name')
  })

  test('get a paginated list of mine existing shirts', async ({ client, assert }) => {
    await client.post('/shirts').json({
      number: 2,
      name: 'il numero due',
      primaryColor: '#fff',
      secondaryColor: '#000',
      teammateId: teammate.id
    }).loginAs(loggedInUser)

    const response = await client.get('/shirts').qs({
      page: 1,
      perPage: 200
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    let paginatedShirt = response.body()

    assert.equal(paginatedShirt.meta.perPage, 200, "should use the right pagination")
    assert.equal(paginatedShirt.meta.total, paginatedShirt.data.length, "should return the right rows")
  })

  test('get a shirt', async ({ client, assert }) => {
    let createShirtResponse = await client.post('/shirts').json({
      number: 3,
      name: 'il numero tre',
      primaryColor: '#fff',
      secondaryColor: '#000',
      teammateId: teammate.id
    }).loginAs(loggedInUser)

    let shirt = createShirtResponse.body()
    const response = await client.get('/shirts/' + shirt.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const shirtResponse = response.body()
    assert.equal(shirtResponse.id, shirt.id, "should return the correct shirt")
  })

  test('update an existing shirt', async ({ client, assert }) => {
    let createShirtResponse = await client.post('/shirts').json({
      number: 4,
      name: 'il numero quarto',
      primaryColor: '#fff',
      secondaryColor: '#000',
      teammateId: teammate.id
    }).loginAs(loggedInUser)

    let shirt = createShirtResponse.body()
    const response = await client.put('/shirts/' + shirt.id).json({
      name: 'il nuovo numero quarto'
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const shirtResponse = response.body()
    assert.equal(shirtResponse.id, shirt.id, "should update the correct shirt")
    assert.equal(shirtResponse.name, 'il nuovo numero quarto', "should update the shirt")
  })

  test('destroy an existing shirt', async ({ client, assert }) => {
    let createShirtResponse = await client.post('/shirts').json({
      number: 5,
      name: 'il numero quinto',
      primaryColor: '#fff',
      secondaryColor: '#000',
      teammateId: teammate.id 
    }).loginAs(loggedInUser)

    let shirt = createShirtResponse.body()
    await client.delete('/shirts/' + shirt.id).loginAs(loggedInUser)

    let shirtFromDatabase = await Shirt.query()
      .where('id', shirt.id)
      .first()

    assert.notExists(shirtFromDatabase, 'should have destroyed the shirt')
  })
})
