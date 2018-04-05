# Restful Web API for Adafruit BME280

This is a [Node.JS](https://nodejs.org/) [Restful](https://en.wikipedia.org/wiki/Representational_state_transfer) Web API service for the Pressure, Temp and Humidity sensor of [Adafruit BME280]((https://www.adafruit.com/product/2652)).

[<img src="https://cdn-learn.adafruit.com/assets/assets/000/026/680/medium800/sensors_pinout.jpg" height="150">](https://www.adafruit.com/product/2652)
[<img src="https://www.raspberrypi.org/app/uploads/2017/05/Raspberry-Pi-Zero-1-1755x1080.jpg" height="150">](https://www.raspberrypi.org/products/raspberry-pi-zero/)

## Prerequisites and preparations

### Raspberry Pi Zero with Raspbian OS

1. Download [Raspbian Stretch Lite](https://www.raspberrypi.org/downloads/raspbian/) and use [Etcher](https://etcher.io) to install the image to the SD card
2. Follow the [Raspberry Pi Zero Headless Setup](https://davidmaitland.me/2015/12/raspberry-pi-zero-headless-setup/) instruction by [David Maitland](https://github.com/davidmaitland) to prepare the OS without any peripherals

### Connect Adafruit BME280 through GPIO pins by I2C

1. Enable I2C connection with `sudo raspi-config` command
2. Check the [Raspberry Pi Zero pinouts](http://pi4j.com/pins/model-zero-rev1.html)
3. Connect BME280 by I2C

	| Signal    | Raspberry Pi Zero pin | BME280 pin |
	|-----------|-----------------------|------------|
	| Power +5V |         Pin 4         |   VIN pin  |
	|  Data SDA |         Pin 3         |   SDI pin  |
	| Clock SCL |         Pin 5         |   SCK pin  |
	|   Ground  |         Pin 6         |   GND pin  |
4. Install I2C tools: `sudo apt install i2c-tools`  
5. Check the presence of the device by running `i2cdetect -y 1`. It should show address `0×77` if connection is correct.
6. Install [Adafruit Python GPIO](https://github.com/adafruit/Adafruit_Python_GPIO) library
7. Test data reading with [Adafruit Python BME280](https://github.com/adafruit/Adafruit_Python_BME280) examples

## Installation

### Clone this repository

1. `git clone https://github.com/iharosi/sensor-api.git ~/sensor-api`

### Install database service and cron service

1. Install [mongodb](https://www.mongodb.com)  
	`apt install mongodb`
2. Install cron script  
	To read the sensor every 10 minutes we install a cron script.  
	Run `crontab -e` and insert the following line at the end of the file:
`0,10,20,30,40,50 * * * * /usr/local/bin/node ~/sensor-api/sampling.js > /dev/null 2>&1`

### Install systemd sensor-api service

1. Create **sensor-api** service unit file at `/etc/systemd/system/sensor-api.service` with the following content:

	```
	[Unit]
	Description=Sensor API
	Requires=networking.service mongodb.service
	After=networking.service mongodb.service
	
	[Service]
	WorkingDirectory=/home/pi/sensor-api
	ExecStart=/usr/local/bin/node server.js
	Restart=always
	RestartSec=10
	StandardOutput=journal
	StandardError=journal
	SyslogIdentifier=sensor-api
	User=pi
	Group=pi
	
	[Install]
	WantedBy=multi-user.target
	```
2. Reload configuration files  
	`systemctl daemon-reload`
3. Install **sensor-api** service  
	`systemctl enable sensor-api`

## Usage

1. Start **sensor-api** service  
	`systemctl start sensor-api`
2. Check if the service has successfully started  
	`systemctl status sensor-api`
	
The service will listen on port 3000.

## API

| Endpoint               | Description                |
| ---------------------- | -------------------------- |
| /                      | This page                  |
| /sensor/               | List all data              |
| /sensor/last           | Get last measured data     |
| /sensor/id/{Object ID} | Get data with the given ID |

