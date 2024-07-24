import * as pb from './gtfs-realtime.browser.proto.js';
import * as pbf from './pbf.js';
import * as utils from './utils.js';
import * as locationControl from './location.js';

// init
const trafiklab_api_key = "a2242a4330664e1ba8179c3cb677f9ff";

let config = {
    minZoom: 7, maxZoom: 18,
};
const initial_lat = 59.3265;
const initial_lng = 18.0644;
const initial_zoom = 13;
export const map = L.map("map", config).setView([initial_lat, initial_lng], initial_zoom);
const lightMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const layer_train = L.layerGroup().addTo(map);
const layer_metro = L.layerGroup().addTo(map);
const layer_bus = L.layerGroup().addTo(map);
const layer_tram = L.layerGroup().addTo(map);
const layer_vessel = L.layerGroup().addTo(map);
const layer_unknown = L.layerGroup().addTo(map);

const marker_id_map_train = new Map();
const marker_id_map_metro = new Map();
const marker_id_map_bus = new Map();
const marker_id_map_tram = new Map();
const marker_id_map_vessel = new Map();
const marker_id_map_unknown = new Map();

const routeMap = new Map();
const tripMap = new Map();

export function init() {
    Promise.all([
        fetch('./routes.json').then(response => response.json())
            .then(response => response.forEach(r => routeMap.set(r.route_id, r))),
        fetch('./trips.json').then(response => response.json())
            .then(response => response.forEach(t => tripMap.set(t.trip_id, t))),
    ]).then(([data1, data2]) => {
        getVehicles();
        const interval = setInterval(getVehicles, 2000);
    }).catch((err) => {
        console.log(err);
    });

    locationControl.addLocateMeControl();
    locationControl.locateMe();
}

function addVehicle(vehicle, marker_id_map, layer) {
    let id = vehicle.vehicle.id;
    let latitude = vehicle.position.latitude;
    let longitude = vehicle.position.longitude;

    let newVehicle;
    if (marker_id_map.has(id)) {
        newVehicle = layer.getLayer(marker_id_map.get(id))
        newVehicle.slideTo([latitude, longitude], {
            duration: 2500, keepAtCenter: false
        });

    } else {
        newVehicle = L.marker([latitude, longitude], {
            icon: L.divIcon({
                html: utils.getVehicleIconForTransport(vehicle.vehicle.type),
                className: "svg-icon",
                iconAnchor: [12, 12],
            })
        });

        layer.addLayer(newVehicle);
        let marker_id = layer.getLayerId(newVehicle);
        marker_id_map.set(id, marker_id);
    }

    newVehicle.bindPopup('<pre>' + JSON.stringify(vehicle, null, '  ') + '</pre>');
}

export function getVehicles() {
    let interval;
    fetch("https://opendata.samtrafiken.se/gtfs-rt/sl/VehiclePositions.pb?key=" + trafiklab_api_key)
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const pbf = new Pbf(new Uint8Array(data));
            const obj = FeedMessage.read(pbf);
            return obj.entity;
        })
        .then(data => data.map(x => x.vehicle))
        .then(data => data.filter(x => !!x.trip))
        .then(data => enrichVehicles(data))
        .then(data => addVehicles(data))
        .catch(error => {
            console.error('There was a problem fetching vehicles:', error);
            clearInterval(interval);
            const five_minutes = 5 * 60 * 1000;
            console.log('Retrying fetch in 5 minutes');
            delay(five_minutes).then(() => interval = setInterval(getVehicles, 2000));
        });
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function enrichVehicles(data) {
    return data.map(v => {
        let trip = tripMap.get(v.trip.trip_id);
        if (trip != null) {
            let route = routeMap.get(trip.route_id);
            v.vehicle.label = route.route_short_name;
            v.vehicle.type = route.route_type;
        }
        return v;
    });
}

function addVehicles(data) {
    data.forEach(v => {
        if (v.vehicle.type === utils.TRANSPORT.TRAIN) {
            addVehicle(v, marker_id_map_train, layer_train);
        } else if (v.vehicle.type === utils.TRANSPORT.METRO) {
            addVehicle(v, marker_id_map_metro, layer_metro);
        } else if (v.vehicle.type === utils.TRANSPORT.BUS) {
            addVehicle(v, marker_id_map_bus, layer_bus);
        } else if (v.vehicle.type === utils.TRANSPORT.TRAM) {
            addVehicle(v, marker_id_map_tram, layer_tram);
        } else if (v.vehicle.type === utils.TRANSPORT.VESSEL) {
            addVehicle(v, marker_id_map_vessel, layer_vessel);
        } else {
            addVehicle(v, marker_id_map_unknown, layer_unknown);
        }
    });
}