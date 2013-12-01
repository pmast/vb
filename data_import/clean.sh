#!/bin/bash

cd /root/virtual_balloon
sqlite3 ../data/weather_data.db "delete from wind where time < date('now')"
sqlite3 ../data/weather_data.db "vacuum"
date > cronlog.txt

rm grib_files/*.grib
