const eoswrapper = require('../eoswrapper.js');

class Base_Command {

    constructor( name, description) {
      if (this.constructor == Base_Command) {
        throw new Error("Can't initiate an abstract class! Please extend this base class.");
      }
      if(!name || !description){
        throw new Error('You need to pass a command name and description in the constructor.')
      }
      this.eos = new eoswrapper();
      this.name = name;
      this.description = description;
      this.embed = require("discord.js").RichEmbed;
      this.parameters = '';

      console.log(`Command ${this.name} loaded.`);
    }
  
    execute() {
      throw new Error('You need to implement an execute() function');
    }

  
}

module.exports = {
    Base_Command
};