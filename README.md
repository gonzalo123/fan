# fun
Summer pet project for a rainy holiday afternoon.
I've got a fan connected to a Wemo switch (http://www.belkin.com/us/p/P-F7C027/). I also have one BeeWi temperature & humidity sensor http://www.bee-wi.com/bbw200,us,4,BBW200-A1.cfm.
The idea is simple: Switch on my fan when temperature is over a threshold and switch off the fan when temperature is below. I also want to be informed when state changes via Telegram.

This is the script running in my Raspberry Pi 3.

## installation

* Install node dependencies (npm install)
* Rename conf.json.dist to conf.json  with your api key and device's mac address
