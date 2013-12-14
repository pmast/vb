import cPickle
import urllib
import pygrib as pg
import sys
import numpy
import sqlite3 as lite
import os
from datetime import datetime
from datetime import timedelta


state_file = "current_state"
grib_dir = "../data/grib_files"
db_path = "../data/weather_data.db"

class State:
    time_between_checks = 5 * 60 * 60 # in seconds
    hours = ["00", "06", "12", "18"]
    hour_index = 0
    forecasts = ["00", "03", "06", "09", "12"]
    forecast_index = 0
    date = datetime.now()
    last_check = []
    
    def getHour(self):
        return self.hours[self.hour_index]
    
    def getDay(self):
        return self.date.strftime("%Y%m%d")
    
    def getForecast(self):
        return self.forecasts[self.forecast_index]

    def increase(self):
        self.forecast_index += 1
        if (self.forecast_index >= len(self.forecasts)):
            self.last_check += [datetime.now()]
            self.forecast_index = 0
            self.hour_index += 1
            if (self.hour_index >= len(self.hours)):
                self.hour_index = 0
                self.date += timedelta(days = 1)
    
    def check(self):
        if len(self.last_check) > 0:
            return self.last_check[-1] + timedelta(seconds = self.time_between_checks) < datetime.now()
        return 1

def initState():
    try:    
        f = open(state_file, "rb")
        cs = cPickle.load(f)
        f.close()
    except IOError:
        cs = State()
    return cs
    
def saveState():
    f = open(state_file, "wb")
    cPickle.dump(cs, f)
    f.close()

def getGrib(cs):
    forecast_time=cs.getHour() #What time the forecast is (00, 06, 12, 18)
    forecast_hours=cs.getForecast() #How many hours ahead to forecast (2 or 3 digits
    # up to 192 hours in the future every 3 hours, then every 12 up to 384 hours in the future)

    forecast_date=cs.getDay() #What date the forecast is for yyyymmdd

    top_lat=90 #Top of bounding box (North)
    bottom_lat=-90 #Bottom of bounding box (South)
    left_lon=0 #Left of bounding box (West)
    right_lon=360 #Right of bounding box (East)
    
    ##example URL:
    # URL= http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_hd.pl?file=gfs.t18z.mastergrb2f00&lev_10_m_above_ground=on&var_UGRD=on&var_VGRD=on&subregion=&leftlon=0&rightlon=360&toplat=90&bottomlat=-90&dir=%2Fgfs.2013022418%2Fmaster

    griburl='http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_hd.pl?'
    griburl=griburl+'file=gfs.t'+str(forecast_time)+'z.mastergrb2f'
    griburl=griburl+forecast_hours

    ##Select atmospheric levels
    # griburl=griburl+'&lev_1000_mb=on'  #1000 mb level
    # griburl=griburl+'&lev_975_mb=on'   #975 mb level
    # griburl=griburl+'&lev_950_mb=on'   #950 mb level
    # griburl=griburl+'&lev_925_mb=on'   #925 mb level
    # griburl=griburl+'&lev_900_mb=on'   #900 mb level
    # griburl=griburl+'&lev_850_mb=on'   #850 mb level
    # griburl=griburl+'&lev_800_mb=on'   #800 mb level
    # griburl=griburl+'&lev_750_mb=on'   #750 mb level
    # griburl=griburl+'&lev_700_mb=on'   #700 mb level
    # griburl=griburl+'&lev_650_mb=on'   #650 mb level
    # griburl=griburl+'&lev_600_mb=on'   #600 mb level
    # griburl=griburl+'&lev_550_mb=on'   #550 mb level
    # griburl=griburl+'&lev_500_mb=on'   #500 mb level
    # griburl=griburl+'&lev_450_mb=on'   #450 mb level
    # griburl=griburl+'&lev_400_mb=on'   #400 mb level
    # griburl=griburl+'&lev_350_mb=on'   #350 mb level
    # griburl=griburl+'&lev_300_mb=on'   #300 mb level
    # griburl=griburl+'&lev_250_mb=on'   #250 mb level
    # griburl=griburl+'&lev_200_mb=on'   #200 mb level
    # griburl=griburl+'&lev_150_mb=on'   #150 mb level
    # griburl=griburl+'&lev_100_mb=on'   #100 mb level
    # griburl=griburl+'&lev_70_mb=on'    #70 mb level
    # griburl=griburl+'&lev_30_mb=on'    #30 mb level
    # griburl=griburl+'&lev_20_mb=on'    #20 mb level
    # griburl=griburl+'&lev_10_mb=on'    #10 mb level
    griburl=griburl+'&lev_10_m_above_ground=on'    #10m above sea level
    # griburl=griburl+'&all_lev=on'

    ## Select variables
    # griburl=griburl+'&var_HGT=on'  #Height (geopotential m)
    # griburl=griburl+'&var_RH=on'  #Relative humidity (%)
    # griburl=griburl+'&var_TMP=on' #Temperature (K)
    griburl=griburl+'&var_UGRD=on' #East-West component of wind (m/s)
    griburl=griburl+'&var_VGRD=on' #North-South component of wind (m/s)
    # griburl=griburl+'&var_WDIR=on' #wind direction
    # griburl=griburl+'&var_WIND=on' #wind speed    
    # griburl=griburl+'&var_VVEL=on' #Vertical Windspeed (Pa/s)

    ##Select bounding box
    griburl=griburl+'&leftlon='+str(left_lon)
    griburl=griburl+'&rightlon='+str(right_lon)
    griburl=griburl+'&toplat='+str(top_lat)
    griburl=griburl+'&bottomlat='+str(bottom_lat)

    #Select date and time

    griburl=griburl+'&dir=%2Fgfs.'+forecast_date+forecast_time+'%2Fmaster'
    #print(griburl)

    print('Downloading GRIB file for date '+forecast_date+' time ' +forecast_time + ', forecasting '+forecast_hours+' hours ahead...')
    local_filename = forecast_date+'_'+forecast_time+'_'+forecast_hours+'.grib'
    path = os.path.join(grib_dir,local_filename)
    tmp = urllib.urlretrieve(griburl, path)
    print("Download complete.  Saving...")
    return path

def containsMessages(filename):
    grbs = pg.open(filename)
    count = grbs.messages
    #print "messages: %s" % (count)
    if count:
        return grbs
    return None
    
def storeData(grbs):
    grb = grbs[1]
    coords = grb.latlons()

    u = grbs.select(name='10 metre U wind component')[0]
    v = grbs.select(name='10 metre V wind component')[0]
    speeds = numpy.sqrt(u.values * u.values + v.values * v.values)
    maxSpeed = numpy.max(speeds)
    directions = 270 - numpy.arctan2(v.values, u.values) * 180 / numpy.pi
    directions = directions % 360
    con = lite.connect(db_path)
    cur = con.cursor()
    for i in range(speeds.shape[0]):
        for i2 in range(speeds.shape[1]):
            cur.execute("insert into wind (latitude, longitude, speed, direction, time, forecast) values (?, ?, ?, ?, ?, ?)", (coords[0][i, i2], coords[1][i, i2], speeds[i, i2], directions[i, i2], u.validDate, u.forecastTime))
    cur.close()
    con.commit()
    con.close()


cs = initState()
if not cs.check():
    #print "no check yet!"
    sys.exit()
check = 1
while check:
    filename = getGrib(cs)
    grbs = containsMessages(filename)
    if (grbs):
        print "file (%s) conatins data" % (filename)
        print "storing data..."
        storeData(grbs)
        cs.increase()
    else:
        print "file is empty"
        check = 0
        break

saveState()

print "ready"
