import UsersManager from "App/managers/user.manager";

export default class SolanaController {
  constructor() {
  }


  public async getReward(){


    //use a factory to random generate user

    const manager =  new UsersManager()
    let createdUser = await manager.create(
        {
          data:{
          firstname: "platform", //
          email: "admin@platform.it", //random generate username
          lastname: "blockchain", 
          password: "qQxSHimmk6F9MX" // same as username
      }})


    //transfer from Token accaount to wallet from user


  }
}