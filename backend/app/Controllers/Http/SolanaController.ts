import UsersManager from "App/managers/user.manager";

export default class SolanaController {
  constructor() {
  }


  public async getReward(){


    const manager =  new UsersManager()
    let createdUser = await manager.create(
      {
        data:{
      firstname: "platform",
      email: "admin@platform.it",
      lastname: "blockchain",
      password: "qQxSHimmk6F9MX"
    }})


    //transfer from Token accaount to wallet from user
    

  }
}