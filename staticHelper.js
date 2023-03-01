// Script that downloads static routes.json & trips.json
// 1. Download sl.zip form: https://opendata.samtrafiken.se/gtfs/sl/sl.zip?key=87263c97bec14008a135b844f752f70b \
// 2. Convert (txt/csv --> json) routes.txt & trips.txt to routes.json & trips.json
// 3. Add routes.json & trips.json to public folder

const JSZip = require("jszip");
const fs = require("fs");

const trafiklab_api_key = "87263c97bec14008a135b844f752f70b";

fetch("https://opendata.samtrafiken.se/gtfs/sl/sl.zip?key=" + trafiklab_api_key)
    .then(function (response) {
        if (response.status === 200 || response.status === 0) {
            return Promise.resolve(response.arrayBuffer());
        } else {
            return Promise.reject(new Error(response.statusText));
        }
    })
    .then(JSZip.loadAsync)
    .then(function (zip) {
        Promise.all([zip.file("routes.txt").async("text"), zip.file("trips.txt").async("text")]).then(function (result) {
            let routes = result[0];
            let trips = result[1];
            convertToJson(routes, "./public/routes.json");
            convertToJson(trips, "./public/trips.json");
        });
    });

function convertToJson(csvInput, outputFile) {
    var array = csvInput.toString().split("\r\n");
    let result = [];
    let headers = array[0].split(",")
    for (let i = 1; i < array.length - 1; i++) {
        let obj = {}
        let str = array[i]
        let s = ''

        let flag = 0
        for (let ch of str) {
            if (ch === '"' && flag === 0) {
                flag = 1
            } else if (ch === '"' && flag === 1) flag = 0
            if (ch === ',' && flag === 0) ch = '|'
            if (ch !== '"') s += ch
        }

        let properties = s.split("|")

        for (let j in headers) {
            if (properties[j].includes(",")) {
                obj[headers[j]] = properties[j]
                    .split(",").map(item => item.trim())
            } else obj[headers[j]] = properties[j]
        }

        result.push(obj)
    }
    let json = JSON.stringify(result);
    fs.writeFileSync(outputFile, json);
}

