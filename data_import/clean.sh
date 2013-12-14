#!/bin/bash

cd /root/vb
sqlite3 data/weather_data.db "delete from wind where time < date('now')"
sqlite3 data/weather_data.db "vacuum"
date > cronlog.txt

rm data/grib_files/*.grib
