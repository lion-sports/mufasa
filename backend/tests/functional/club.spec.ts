import { test } from '@japa/runner'
import { assert } from 'chai'
import { ClubFactory, UserFactory } from '#database/factories/index'
import User from '#models/User'

test.group('Club', (group) => {
  let loggedInUser: User

  group.setup(async () => {
    loggedInUser = await UserFactory.create()
  })

  test('get a paginated list of clubs', async ({ client }) => {
    let newClub = await ClubFactory.merge({ ownerId: loggedInUser.id }).create()
    await newClub.related('members').create({
      userId: loggedInUser.id
    })
    const response = await client.get('/clubs').loginAs(loggedInUser)
    const clubs = response.body().data

    response.assertAgainstApiSpec()
    assert.isTrue(clubs.length > 0, 'should have some clubs in the list')
  })

  test('create new club', async ({ client }) => {
    const response = await client
      .post('/clubs')
      .json({
        name: 'some name',
        completeName: 'Some Complete Name',
        bio: 'A brief bio about the club',
        sport: 'volleyball',
        public: true
      })
      .loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const club = response.body()
    assert.exists(club.id, 'should have the id')
    assert.equal(club.name, 'some name', 'should return the correct name')
    assert.equal(club.completeName, 'Some Complete Name', 'should return the correct complete name')
    assert.equal(club.bio, 'A brief bio about the club', 'should return the correct bio')
    assert.equal(club.sport, 'volleyball', 'should return the correct sport')
    assert.equal(club.public, true, 'should be public')
  })

  test('update existing club', async ({ client }) => {
    const newClub = await ClubFactory.merge({ ownerId: loggedInUser.id }).create()
    await newClub.related('members').create({
      userId: loggedInUser.id
    })

    const response = await client
      .put('/clubs/' + newClub.id)
      .json({
        name: 'UpdatedName',
        completeName: 'Updated Complete Name',
        bio: 'Updated bio about the club',
        sport: 'volleyball',
        public: true
      })
      .loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const club = response.body()
    assert.equal(newClub.id, club.id, 'should update the correct club')
    assert.equal(club.name, 'UpdatedName', 'should update the club name')
    assert.equal(club.completeName, 'Updated Complete Name', 'should update the complete name')
    assert.equal(club.bio, 'Updated bio about the club', 'should update the bio')
    assert.equal(club.sport, 'volleyball', 'should update the sport')
    assert.equal(club.public, true, 'should be public')
  })

  test('get a club', async ({ client }) => {
    const newClub = await ClubFactory.merge({ ownerId: loggedInUser.id }).create()
    await newClub.related('members').create({
      userId: loggedInUser.id
    })
    const response = await client.get('/clubs/' + newClub.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const club = response.body()
    assert.equal(newClub.id, club.id, 'should return the correct club')
  })

  test('get a public list of clubs', async ({ client }) => {
    const publicClub = await ClubFactory.merge({ ownerId: loggedInUser.id, public: true }).create()
    const privateClub = await ClubFactory.merge({ ownerId: loggedInUser.id, public: false }).create()

    await publicClub.related('members').create({ userId: loggedInUser.id })
    await privateClub.related('members').create({ userId: loggedInUser.id })

    const response = await client.get('/clubs/publicList')

    response.assertAgainstApiSpec()
    const clubs = response.body().data

    assert.isArray(clubs, 'should return an array of clubs')
    assert.isTrue(clubs.some((club: any) => club.id === publicClub.id), 'should include the public club')
    assert.isFalse(clubs.some((club: any) => club.id === privateClub.id), 'should not include the private club')
  })

  test('get a public club by name', async ({ client }) => {
    const clubName = 'UniquePublicClubName'
    const publicClub = await ClubFactory.merge({
      ownerId: loggedInUser.id,
      public: true,
      name: clubName
    }).create()

    await publicClub.related('members').create({ userId: loggedInUser.id })

    const response = await client
      .get('/clubs/getByName')
      .qs({ name: clubName })

    response.assertAgainstApiSpec()
    const club = response.body()
    assert.exists(club, 'should return a club')
    assert.equal(club.name, clubName, 'should return the correct club by name')
    assert.isTrue(club.public, 'should be a public club')
  })
})