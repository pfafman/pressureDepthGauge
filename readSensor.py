#!/usr/bin/python
# -*- coding:utf-8 -*-

import time
import ADS1263
import RPi.GPIO as GPIO

REF = 5.18           # Modify according to actual voltage
                     # external AVDD and AVSS(Default), or internal 2.5V

CURRENT_INIT = 4.10  # Current @ 0mm (uint: mA)
RANGE = 5000         # Depth measuring range 5000mm (for water)
DENSITY_WATER = 1    # Pure water density normalized to 1
    

try:
    ADC = ADS1263.ADS1263()
    
    # The faster the rate, the worse the stability
    # and the need to choose a suitable digital filter(REG_MODE1)

    if (ADC.ADS1263_init_ADC1('ADS1263_10SPS') == -1):
        exit()

    ADC.ADS1263_SetMode(0) # 0 is singleChannel, 1 is diffChannel
    
    channelList = [0]  # The channel must be less than 10

    count = 10
    volts = 0
    for x in range(count):
        ADC_Value = ADC.ADS1263_GetChannalValue(0)   
        
        if (ADC_Value>>31 ==1):
            volts += REF*2 - ADC_Value * REF / 0x80000000
        else:
            volts += ADC_Value * REF / 0x7fffffff   # 32bit

    volts /= count
    amps = volts/120
    depth = (amps*1000 - CURRENT_INIT) * (RANGE / DENSITY_WATER / 16.0)
    
    if depth < 0:
        depth = 0
        
    inches = depth * 0.0393701
        
    print("%lf volts %lf amps -> %lf mm, %lf inches" % (volts, amps, depth, inches))
    print("%lf" % (inches))
    
    ADC.ADS1263_Exit()

except IOError as e:
    print(e)
   
except KeyboardInterrupt:
    print("ctrl + c:")
    print("Program end")
    ADC.ADS1263_Exit()
    exit()
   
