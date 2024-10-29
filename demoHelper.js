global.self = global;
const pb = require('./public/gtfs-realtime.browser.proto.js');
const Pbf = require('./public/pbf.js');
const JSZip = require("jszip");
const fs = require("fs");

const trafiklab_api_key = "a2242a4330664e1ba8179c3cb677f9ff";


function fetchAndLogVehiclePositions() {
    fetch("https://opendata.samtrafiken.se/gtfs-rt/sl/VehiclePositions.pb?key=" + trafiklab_api_key)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const pbf = new Pbf(new Uint8Array(data));
            const obj = FeedMessage.read(pbf);

            return obj.entity;
        })
        .then(entity => {
            console.log("Entity: " + entity.length);
            console.log(entity[0]);
        })
        .catch(error => console.error(error));
}

fetchAndLogVehiclePositions();