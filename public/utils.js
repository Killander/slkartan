export const TRANSPORT = {
    TRAIN: 100,
    METRO: 401,
    BUS: 700,
    TRAM: 900,
    VESSEL: 1000
}

export function getVehicleIconForTransport(transportCode) {
    switch (transportCode) {
        case TRANSPORT.TRAIN:
            return `<img src="./icons/train.svg">`
        case TRANSPORT.METRO:
            return `<img src="./icons/metro.svg">`
        case TRANSPORT.BUS:
            return `<img src="./icons/bus.svg">`
        case TRANSPORT.TRAM:
            return `<img src="./icons/tram.svg">`
        case TRANSPORT.VESSEL:
            return `<img src="./icons/vessel.svg">`
        default:
            return `<img src="./icons/none.svg">`
    }
}