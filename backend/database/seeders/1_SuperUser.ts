import Env from '@ioc:Adonis/Core/Env';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    await User.updateOrCreate({
      email: 'info@likablehair.it',
    }, {
      firstname: 'info',
      lastname: 'likablehair',
      password: Env.get('ADMIN_USER_SEED_PASSWORD'),
      system: true
    })
  }
}
