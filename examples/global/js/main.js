const configuration = {
    background: {
        color: "#111140"
    },
    depth: 0.2,
    border: {
        show: true,
        depthDelta: 0.001,
        color: 0xffffff,
        weight: 1.0
    },
    dataLabel: {
        show: true,
        className: "v3map-data-datalabel",
    },
    dataMark: {
        show: true,
        url: "../assets/icon.png",
        scale: 0.3
    },
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
    },
    events: {
        select: {
            onSelect: function() {},
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