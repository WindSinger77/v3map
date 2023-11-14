import V3Map from "../../../src/V3Map";

const configuration = {
    depth: 0.2,
    flowing: {
        show: true,
        url: "../assets/flow.png",
        minDepthDelta: 0.0001,
        maxDepthDelta: 1,
        series:[
            {
                start:330200,
                end: 330100
            }
        ]
    }
};

const map = new V3Map(configuration, v3map_data_source);
map.render(document.getElementById("map"));