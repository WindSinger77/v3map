import V3Map from "../../../src/V3Map";

const configuration = {
    depth: 0.2,
    events: {
        select: {
            onSelect: function(sender, event) {
                const { type, target} = event || {};
                console.log(target + ":" + type);
            },
            depthDelta: 0.2,
            border: {
                color: 0xff0000,
                weight: 2.0
            }
        }
    }
};

const map = new V3Map(configuration, v3map_data_source);
map.render(document.getElementById("map"));