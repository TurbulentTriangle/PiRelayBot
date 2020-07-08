const Discord = require('discord.js');
const client = new Discord.Client();
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

const loop = require('wait-loop');
const fs = require('fs');
const ini = require('ini');
const Gpio = require('onoff').Gpio;

const Devices = JSON.parse(fs.readFileSync("./config/devices.json", 'utf-8'));
const config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));

prefix = config.prefix;
restartAll = config.restart_all;
offAll = config.off_all;
onAll = config.on_all;
timer = config.timer_ms;
admins = config.admin_ids;
channels = config.MADevice_channels;

var toggleStart = 0;
var toggleStop = 1;

if (config.relay_mode == 'NO') {
    toggleStart = 1;
    toggleStop = 0;
}

client.on('ready', () => {
    console.log('MADevice relay bot started');
});

client.on('message', (receivedMessage) => {
    let message = receivedMessage.content.toLowerCase();

    if (message === "ping" && admins.includes(receivedMessage.author.id)) {
        receivedMessage.channel.send("Relay Pong");
    }

    //Auto toggle with MADevice
    if (receivedMessage.webhookID && channels.includes(receivedMessage.channel.id) && receivedMessage.embeds[0]) {
        relayMessage = receivedMessage.embeds[0].description.toLowerCase();

        loop.each(Devices, function (elem) {
            device = elem['device'].toLowerCase();
            relayNumber = elem['relay'];
            piPin = elem['gpio'];

            if (relayMessage.includes(device + " - ")) {
                try {
                    toggleRelay();
                } catch (err) {
                    console.log(err);
                }

                async function toggleRelay() {
                    var RelayGPIO = new Gpio(piPin, 'out');
                    RelayGPIO.writeSync(toggleStart);
                    await new Promise(done => setTimeout(done, timer));
                    RelayGPIO.writeSync(toggleStop);
                    RelayGPIO.unexport();
                    console.log(`${device} automatically toggled at ${receivedMessage.createdAt}`);
                }
            }
            loop.next();
        }) //End of loop.each

        loop.on(err => {
            if (err) {
                console.log(err);
            } else {
                //Successfully executed
            }
        }); //End of loop.on(err)
    } //End of auto toggle


    //Manually toggle single relay
    if (receivedMessage.content.startsWith(prefix) && admins.includes(receivedMessage.author.id) && channels.includes(receivedMessage.channel.id)) {
        for (var i = 0; i < Devices.length; i++) {
            let device = Devices[i]['device'].toLowerCase();
            let piPin = Devices[i]['gpio'];

            if (message.replace(prefix.toLowerCase(), "") == device) {
                try {
                    toggleRelay(piPin);
                    console.log(`${device} manually toggled at ${receivedMessage.createdAt}`);
                } catch (err) {
                    console.log(err);
                }
            }
        } //End of Devices loop
    } //End of manual toggle single relay


    //Restart all relays
    if (message === restartAll.toLowerCase() && admins.includes(receivedMessage.author.id) && channels.includes(receivedMessage.channel.id)) {
        console.log(`Manually restarting all devices at ${receivedMessage.createdAt}`);
        for (var i = 0; i < Devices.length; i++) {
            let device = Devices[i]['device'].toLowerCase();
            let piPin = Devices[i]['gpio'];
            try {
                toggleRelay(piPin);
            }
            catch(err){
                console.log(`Error restarting device ${device}: ${err}`);
            }
        }
    } //End of restart all relays


    //Turn all relays off
    if (message === offAll.toLowerCase() && admins.includes(receivedMessage.author.id) && channels.includes(receivedMessage.channel.id)) {
        console.log(`Manually turning all devices off at ${receivedMessage.createdAt}`);
        for (var i = 0; i < Devices.length; i++) {
            let device = Devices[i]['device'].toLowerCase();
            let piPin = Devices[i]['gpio'];
            try {
                var RelayGPIO = new Gpio(piPin, 'out');
                RelayGPIO.writeSync(toggleStart);
            }
            catch(err){
                console.log(`Error turning off device ${device}: ${err}`);
            }
        }
    } //End of all relays off


    //Turn all relays on
    if (message === onAll.toLowerCase() && admins.includes(receivedMessage.author.id) && channels.includes(receivedMessage.channel.id)) {
        console.log(`Manually turning all devices on at ${receivedMessage.createdAt}`);
        for (var i = 0; i < Devices.length; i++) {
            let device = Devices[i]['device'].toLowerCase();
            let piPin = Devices[i]['gpio'];
            try {
                var RelayGPIO = new Gpio(piPin, 'out');
                RelayGPIO.writeSync(toggleStop);
            }
            catch(err){
                console.log(`Error turning on device ${device}: ${err}`);
            }
        }
    } //End of all relays on


    async function toggleRelay(piPin) {
        var RelayGPIO = new Gpio(piPin, 'out');
        RelayGPIO.writeSync(toggleStart);
        await new Promise(done => setTimeout(done, timer));
        RelayGPIO.writeSync(toggleStop);
        RelayGPIO.unexport();
    }
}); //End of client.on('message')

client.login(config.bot_token);