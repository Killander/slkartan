export const TRANSPORT = {
    RAILWAY: 100,
    METRO: 401,
    BUS: 700,
    TRAM: 900,
    BOAT: 1000
}

export function getVehicleIconForTransport(transportCode) {
    switch (transportCode) {
        case TRANSPORT.RAILWAY:
            return `<img src="./bus-icon.svg">`
        case TRANSPORT.METRO:
            return `<img src="./bus-icon.svg">`
        case TRANSPORT.BUS:
            return `<img src="./bus-icon.svg">`
        case TRANSPORT.TRAM:
            return `<img src="./bus-icon.svg">`
        case TRANSPORT.BOAT:
            return `<img src="./bus-icon.svg">`
    }
}