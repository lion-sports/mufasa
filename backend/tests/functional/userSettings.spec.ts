import User from '#app/Models/User';
import UserSettingsManager from '#app/managers/userSettings.manager';
import { test } from '@japa/runner';
import { UserFactory } from '#database/factories/index';

test.group('User Settings', (group) => {
  let loggedInUser: User;
  let manager: UserSettingsManager;

  group.setup(async () => {
    loggedInUser = await UserFactory.create();
    manager = new UserSettingsManager();
  });

  test('set a user setting', async ({ client, assert }) => {
    const response = await client.post('/userSettings/set').json({
      key: 'clubsSectionVisible',
      value: true,
    }).loginAs(loggedInUser);

    response.assertAgainstApiSpec();
    assert.equal(response.status(), 200, 'should return a success status');
    assert.equal(response.body().settings.clubsSectionVisible, true, 'setting should be updated');
  });

  test('get a user setting', async ({ client, assert }) => {
    await manager.set({
      data: {
        key: 'clubsSectionVisible',
        value: true,
      },
      context: {
        user: loggedInUser,
      },
    });

    const response = await client.get('/userSettings/get').qs({
      key: 'clubsSectionVisible',
    }).loginAs(loggedInUser);

    assert.equal(response.status(), 200, 'should return a success status');
    assert.equal(response.body().value, true, 'should retrieve the correct setting value');
  });
});