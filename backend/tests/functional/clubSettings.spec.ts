import Club from '#app/Models/Club';
import ClubSettingsManager from '#app/managers/clubSettings.manager';
import { test } from '@japa/runner';
import { ClubFactory, UserFactory } from '#database/factories/index';
import User from '#models/User';

test.group('Club Settings', (group) => {
  let loggedInUser: User
  let club: Club;
  let manager: ClubSettingsManager;

  group.setup(async () => {
    loggedInUser = await UserFactory.create()
    
    club = await ClubFactory.create();
    await club.related('owner').associate(loggedInUser)

    manager = new ClubSettingsManager();
  });

  test('set a club setting', async ({ client, assert }) => {
    const response = await client.post('/clubSettings/set').json({
      key: 'bookingsActive',
      value: true,
      clubId: club.id,
    }).loginAs(loggedInUser);

    response.assertAgainstApiSpec();
    assert.equal(response.status(), 200, 'should return a success status');
    assert.equal(response.body().settings.bookingsActive, true, 'setting should be updated');
  });

  test('get a club setting', async ({ client, assert }) => {
    await manager.set({
      data: {
        clubId: club.id,
        key: 'bookingsActive',
        value: true,
      },
      context: {
        user: loggedInUser
      }
    });

    const response = await client.get('/clubSettings/get').qs({
      key: 'bookingsActive',
      clubId: club.id,
    }).loginAs(loggedInUser);

    assert.equal(response.status(), 200, 'should return a success status');
    assert.equal(response.body().value, true, 'should retrieve the correct setting value');
  });
});