# SL Kartan

Can be viewed online at: https://killander.github.io/slkartan/public/

## To run localy

Requirements:

1. Ensure that Node.js is installed
2. Open Terminal in root folder and run `node app.js`
3. Goto: http://localhost:8000/

## Notes

Todo daily: run  `node staticHelper.js`

A script that downloads static routes.json & trips.json

1. Download sl.zip form: https://opendata.samtrafiken.se/gtfs/sl/sl.zip?key=87263c97bec14008a135b844f752f70b \
2. Convert (txt/csv --> json) routes.txt & trips.txt to routes.json & trips.json
3. Add routes.json & trips.json to public folder
4. Git push
