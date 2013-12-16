#!/bin/bash

cd /root/vb/data_import
python processGrib.py
date >> update_grib_log.txt
