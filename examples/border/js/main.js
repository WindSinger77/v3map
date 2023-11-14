import V3Map from "../../../src/V3Map";

const configuration = {
    depth: 0.2,
    border: {
        show: true,
        depthDelta: 0.001,
        color: 0xffffff,
        weight: 1.0
    }
};

const map = new V3Map(configuration, v3map_data_source);
map.render(document.getElementById("map"));