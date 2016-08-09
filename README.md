# fan
Summer pet project for a rainy holiday afternoon.
I've got a fan connected to a Wemo switch (http://www.belkin.com/us/p/P-F7C027/). I also have one BeeWi temperature & humidity sensor http://www.bee-wi.com/bbw200,us,4,BBW200-A1.cfm.
The idea is simple: Switch on my fan when temperature is over a threshold and switch off the fan when temperature is below. I also want to be informed when state changes via Telegram.

# how it works
* I use noble (bluetooth) to speak with the BeeWi sensor.
* I use wemo-client to speak with Wemo device
* I use telebot to send data to my Telegram Bot.
* The script runs on my Rasberry Pi 3

# future things (things that probably never will)
* Create a Telegram bot to see .
 * The status of my fan.
 * The temperature, humidity and battery status of my BeeWi device.
* Detect my Peeble watch and never switch on the fan when I'm not close to the it.

## installation

* Install node dependencies (npm install)
* Rename conf.json.dist to conf.json  with your api key and device's mac address
