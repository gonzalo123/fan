var noble = require('noble'),
    Wemo = require('wemo-client'),
    TeleBot = require('telebot'),
    fs = require('fs'),
    beeWiData,
    wemo,
    threshold,
    address,
    bot,
    chatId,
    wemoDevice,
    configuration,
    confPath;

process.env.NODE_ENV = 'prod';

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " conf.json");
    process.exit(-1);
}

confPath = process.argv[2];
try {
    configuration = JSON.parse(
        fs.readFileSync(process.argv[2])
    );
} catch (e) {
    console.log("configuration file not valid");
    process.exit(-1);
}

bot = new TeleBot(configuration.telegramBotAPIKey);
address = configuration.beeWiAddress;
threshold = configuration.threshold;
wemoDevice = configuration.wemoDevice;
chatId = configuration.telegramChatId;

function persists() {
    configuration.beeWiData = beeWiData;
    fs.writeFileSync(confPath, JSON.stringify(configuration));
}

function setSwitchState(state, callback) {
    wemo = new Wemo();
    wemo.discover(function(deviceInfo) {
        if (deviceInfo.friendlyName == wemoDevice) {
            console.log("device found:", deviceInfo.friendlyName, "setting the state to", state);
            var client = wemo.client(deviceInfo);
            client.on('binaryState', function(value) {
                callback();
            });

            client.on('statusChange', function(a) {
                console.log("statusChange", a);
            });
            client.setBinaryState(state);
        }
    });
}

beeWiData = {temperature: undefined, humidity: undefined, batery: undefined};

function hexToInt(hex) {
    if (hex.length % 2 !== 0) {
        hex = "0" + hex;
    }
    var num = parseInt(hex, 16);
    var maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal;
    }
    return num;
}

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.stopScanning();
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
});

noble.on('scanStop', function() {
    var message, state;
    if (beeWiData.temperature > threshold) {
        state = 1;
        message = "temperature (" + beeWiData.temperature + ") over threshold (" + threshold + "). Fan ON. Humidity: " + beeWiData.humidity;
    } else {
        message = "temperature (" + beeWiData.temperature + ") under threshold (" + threshold + "). Fan OFF. Humidity: " + beeWiData.humidity;
        state = 0;
    }
    setSwitchState(state, function() {
        if (configuration.beeWiData.hasOwnProperty('temperature') && configuration.beeWiData.temperature < threshold && state === 1 || configuration.beeWiData.temperature > threshold && state === 0) {
            console.log("Notify to telegram bot", message);
            bot.sendMessage(chatId, message).then(function() {
                process.exit(0);
            }, function(e) {
                console.error(e);
                process.exit(0);
            });
            persists();
        } else {
            console.log(message);
            persists();
            process.exit(0);
        }
    });
});

noble.on('discover', function(peripheral) {
    if (peripheral.address == address) {
        var data = peripheral.advertisement.manufacturerData.toString('hex');
        beeWiData.temperature = parseFloat(hexToInt(data.substr(10, 2)+data.substr(8, 2))/10).toFixed(1);
        beeWiData.humidity = Math.min(100,parseInt(data.substr(14, 2),16));
        beeWiData.batery = parseInt(data.substr(24, 2),16);
        beeWiData.date = new Date();
        noble.stopScanning();
    }
});

setTimeout(function() {
    console.error("timeout exceded!");
    process.exit(0);
}, 5000);
