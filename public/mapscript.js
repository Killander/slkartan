// Import necessary modules
import * as pb from './gtfs-realtime.browser.proto.js'; // GTFS Protocol Buffers definition
import * as pbf from './pbf.js'; // Protocol Buffers library
import * as utils from './utils.js'; // Utilities for transport type icons
import * as locationControl from './location.js'; // Custom location controls

// API key for Trafiklab GTFS real-time data
const trafiklab_api_key = "a2242a4330664e1ba8179c3cb677f9ff";

// Map configuration and initial settings
const config = { minZoom: 7, maxZoom: 18 };
const initial_lat = 59.3265, initial_lng = 18.0644, initial_zoom = 13;

// Initialize map and base layer
export const map = L.map("map", config).setView([initial_lat, initial_lng], initial_zoom);
const lightMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Layer groups for different transport types
const layer_train = L.layerGroup().addTo(map);
const layer_metro = L.layerGroup().addTo(map);
const layer_bus = L.layerGroup().addTo(map);
const layer_tram = L.layerGroup().addTo(map);
const layer_vessel = L.layerGroup().addTo(map);
const layer_unknown = L.layerGroup().addTo(map); // Fallback for undefined types

// Maps to track markers by vehicle ID (per transport type)
const marker_id_map_train = new Map();
const marker_id_map_metro = new Map();
const marker_id_map_bus = new Map();
const marker_id_map_tram = new Map();
const marker_id_map_vessel = new Map();
const marker_id_map_unknown = new Map();

// Caches for route and trip data
const routeMap = new Map();
const tripMap = new Map();

// Initializes the map and data loading
export function init() {
    // Load routes and trips, then start real-time updates
    Promise.all([
        fetch('./routes.json').then(res => res.json()).then(data => data.forEach(r => routeMap.set(r.route_id, r))),
        fetch('./trips.json').then(res => res.json()).then(data => data.forEach(t => tripMap.set(t.trip_id, t))),
    ])
    .then(() => {
        getVehicles(); // Initial fetch
        setInterval(getVehicles, 2000); // Fetch every 2 seconds
    })
    .catch(console.error);

    // Locate me functions
    locationControl.addLocateMeControl();
    locationControl.locateMe();

    // Populate search bar from URL parameters, if present
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    if (filter) document.getElementById('searchBar').value = filter;
}

// Fetches vehicle positions from GTFS API, applies enrichments, and adds to map
export function getVehicles() {
    let interval;
    fetch("https://opendata.samtrafiken.se/gtfs-rt/sl/VehiclePositions.pb?key=" + trafiklab_api_key)
        .then(response => {
            if (!response.ok) throw response;
            return response.arrayBuffer();
        })
        .then(data => {
            const pbf = new Pbf(new Uint8Array(data));
            const obj = FeedMessage.read(pbf);
            // Return filtered valid vehicles with trips
            return obj.entity.filter(e => e.vehicle && e.vehicle.trip);
        })
        .then(enrichVehicles)
        .then(addVehicles)
        .catch(err => {
            console.error('Error fetching vehicles:', err);
            clearInterval(interval);
            delay(5 * 60 * 1000).then(() => interval = setInterval(getVehicles, 2000)); // Retry after 5 mins
        });
}

// Enrich vehicle data with route information (adds labels and type)
function enrichVehicles(data) {
    return data.map(entity => {
        const trip = tripMap.get(entity.vehicle.trip.trip_id);
        if (trip) {
            const route = routeMap.get(trip.route_id);
            entity.vehicle.vehicle.label = route.route_short_name;
            entity.vehicle.vehicle.type = route.route_type;
        }
        return entity;
    });
}

// Adds enriched vehicle data to the map by transport type
function addVehicles(data) {
    data.forEach(entity => {
        const type = entity.vehicle.vehicle.type;
        if (type === utils.TRANSPORT.TRAIN) {
            addVehicle(entity, marker_id_map_train, layer_train);
        } else if (type === utils.TRANSPORT.METRO) {
            addVehicle(entity, marker_id_map_metro, layer_metro);
        } else if (type === utils.TRANSPORT.BUS) {
            addVehicle(entity, marker_id_map_bus, layer_bus);
        } else if (type === utils.TRANSPORT.TRAM) {
            addVehicle(entity, marker_id_map_tram, layer_tram);
        } else if (type === utils.TRANSPORT.VESSEL) {
            addVehicle(entity, marker_id_map_vessel, layer_vessel);
        } else {
            addVehicle(entity, marker_id_map_unknown, layer_unknown);
        }
    });
}

// Manages individual vehicle markers: updates position or adds new marker if absent
function addVehicle(entity, marker_id_map, layer) {
    const vehicle = entity.vehicle;
    const id = vehicle.vehicle.id;
    const { latitude, longitude } = vehicle.position;

    let marker;
    if (marker_id_map.has(id)) {
        marker = layer.getLayer(marker_id_map.get(id));
        marker.slideTo([latitude, longitude], { duration: 2500, keepAtCenter: false }); // Smooth transition
    } else {
        marker = L.marker([latitude, longitude], {
            icon: L.divIcon({
                html: utils.getVehicleIconForTransport(vehicle.vehicle.type),
                className: "svg-icon",
                iconAnchor: [12, 12],
            })
        });

        layer.addLayer(marker);
        marker_id_map.set(id, layer.getLayerId(marker));
    }

    // Attach popup with vehicle details
    marker.bindPopup('<pre>' + JSON.stringify(entity, null, '  ') + '</pre>');

    // Filter marker visibility based on search bar input
    const query = document.getElementById('searchBar').value.toLowerCase().trim();
    if (query === '' || vehicle.vehicle.label.toLowerCase().includes(query)) {
        marker.addTo(map);
    } else {
        map.removeLayer(marker);
    }
}

// Utility to add delay in execution (e.g., retrying fetch after an error)
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
