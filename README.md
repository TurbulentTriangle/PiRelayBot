# PiRelayBot for MADevice
A Discord bot to run on a Raspberry Pi that reads MADevice notifications and automatically power cycles relays connected to the GPIO pins.  Commands to reset, turn on, and turn off devices manually also available.


## INSTALLATION
> git clone http://github.com/TurbulentTriangle/PiRelayBot && cd PiRelayBot  
> cp -r config_example config  
> npm install  
> cd config && nano config.ini  
> nano devices.json  


## CONFIG SETUP
* **bot_token**: Create Discord bot and paste the token here
* **prefix**: Message prefix for manually toggling single device
* **restart_all**: Command to restart all relays
* **off_all**: Command to turn all relays off
* **on_all**: Command to turn all relays on
* **relay_mode**: NO or NC  
➡ NO: Normally Open  
➡ NC: Normally Closed
* **admin_ids**: List of admin IDs
* **MADevice_channels**: List of channels where MADevice posts
* **timer_ms**: Toggle wait time in milliseconds


## DEVICE SETUP
*Sample json is for a 16-channel relay. Remove/Add devices as needed.*  

* **relay**: Relay number.  Only used to help organize device list
* **device**: Device origin name from MAD
* **gpio**: The GPIO number  


## STARTING BOT
> node RelayToggle.js