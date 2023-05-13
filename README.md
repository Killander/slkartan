# SL Kartan

Can be viewed online at: https://killander.github.io/slkartan/public/

## Install
Requirements:
* Node version 18.16.0
* Npm version 9.5.1

## To run localy

1. Ensure that Node.js is installed
2. Open Terminal in root folder and run `node app.js`
3. Goto: http://localhost:8000/

## Notes

Run this daily: `node staticHelper.js`

A script that downloads static route & trips

1. Download sl.zip form: https://opendata.samtrafiken.se/gtfs/sl/sl.zip?key=87263c97bec14008a135b844f752f70b \
2. Convert (txt/csv --> json) routes.txt & trips.txt to routes.json & trips.json
3. Add routes.json & trips.json to public folder
4. Git push
