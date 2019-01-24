const {Base_Command} = require('../classes/abstract/Base_Command');

class cmd extends Base_Command{

    constructor(){
        super('verify', 'Verify if your discord account is properly linked with an eos account and check if you are a registered eosDAC member.');
    }

    async execute(bot, member, message, args){
        //check if discord id is in database
        let discorduser = await bot.mongo.db.collection('disordbot').find({_id: message.author.id}).toArray();
        // console.log(discorduser);
        if(!discorduser.length) {
            message.author.send(`Please run the command \`${bot.config.bot.prefix}pair <accountname>\` first.`);
            return;
        }

        let isverified_flag = false;

        if(discorduser[0].verified){
            console.log('already verified');
            isverified_flag = true;
        }
        else{

            let actions = await bot.eos.getActions(discorduser[0].eos_account);
            let last = actions.find(a => { 
                return a.act.account === bot.config.dac.verification_contract; 
            });
            if(!last) {
                message.author.send(`I couldn't find your on chain verification message. Please run the command again or retry to verify your token ${bot.config.dac.memberclient}/test/${discorduser[0].token}`);
                return;
            }

            isverified_flag = last.act.data.token === discorduser[0].token;
        }
    

        if(isverified_flag ){
            
            let balance = await bot.eos.getBalance(bot.config.dac.token.contract, discorduser[0].eos_account, bot.config.dac.token.symbol);
            let ismember = await bot.eos.isMember(discorduser[0].eos_account);

            await bot.mongo.db.collection('disordbot').updateOne(
                { _id: message.author.id }, 
                {$set:{ verified: true } }, 
                { upsert: true } 
            );

            let embed = new bot.embed();
            embed.setColor('#00AE86');

            embed.addField('Linked eos Account', `${discorduser[0].eos_account}`);

            if(ismember){
                embed.addField('Agreed constitution', `v${ismember.agreedtermsversion}`);
            }
            else{
                embed.addField('Signature required', `You need to agree the DAC constitution to be a member.`);
            }

            if(balance){
                embed.addField('Balance', `${balance}`);
            }
            else{
                embed.addField(`Balance required`, `You need to have at least 0.0001 ${bot.config.dac.token.symbol} to be an active member.`);
            }

            let guild = bot.client.guilds.find(guild => guild.name === bot.config.bot.guildname);
            let role = guild.roles.find(role => role.name === "Registered Member");
            member.addRole(role).catch(e=>console.error(e) );
            embed.setDescription(`The "Registered Member" role is attached to your account ${message.author}`)
            message.author.send(embed);
        }
        else{
            message.author.send(`Tokens don't match, verification failed. You need to verify your token ${bot.config.dac.memberclient}/test/${discorduser[0].token}`);
        }
    }
}

module.exports = cmd;