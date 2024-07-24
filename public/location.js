import { map } from './mapscript.js';

export function addLocateMeControl() {
    const locateMeControl = L.control({ position: 'topleft' });

    locateMeControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'leaflet-bar locate-me-button');
        div.innerHTML = '<i class="fas fa-location-arrow"></i>';
        div.onclick = locateMe;
        return div;
    };

    locateMeControl.addTo(map);
}

export function locateMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.flyTo([lat, lng]);
            L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'blue-dot',
                    iconSize: [10, 10],
                })
            }).addTo(map);
        }, error => {
            handleLocationError(error);
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

function handleLocationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}
