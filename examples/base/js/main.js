import V3Map from "../../../src/V3Map";

const configuration = {
    depth: 0.2,
};

const map = new V3Map(configuration, v3map_data_source);
map.render(document.getElementById("map"));