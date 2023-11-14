import V3Map from "../../../src/V3Map";

const configuration = {
    depth: 0.2,
    dataLabel: {
        show: true,
        className: "v3map-data-datalabel",
    }
};

const map = new V3Map(configuration, v3map_data_source);
map.render(document.getElementById("map"));