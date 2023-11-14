import { Color } from "three";

export default {
    background: {
        color: "#111140",
        light: {
            color: 0x3434fa,
            intensity: 5
        }
    },
    id: function (feature) {
        const { properties } = feature || {};
        const { adcode } = properties || {};
        return adcode;
    },
    center: function (feature) {
        const { properties } = feature || {};
        const { centroid, center } = properties || {};
        return centroid || center;
    },
    name: function (feature) {
        const { properties } = feature || {};
        const { name } = properties || {};
        return name;
    },
    depth: 0.2,
    ppi: 254,
    scale: 1.0,
    color: function () {
        return new Color(`hsl(
            ${Math.random() * 30 + 55}%,
            ${Math.random() * 30 + 55}%,
            ${233}
            )`);
    },
    emissive: 0x347356,
    roughness: 0.8,
    metalness: 0.8,
    opacity: 0.8,
    transparent: true,
    border: {
        show: false,
        depthDelta: 0.001,
        color: 0xffffff,
        weight: 1.0
    },
    dataLabel: {
        show: false,
        className: "v3map-data-datalabel",
        style: {
            color: "#ffffff",
            fontSize: "12px"
        }
    },
    dataMark: {
        show: false,
        scale: 1.0,
        transparent: true
    },
    flowing: {
        show: false,
        minDepthDelta: 0.0001,
        maxDepthDelta: 1,
        weight: 0.02
    },
    events: {
        select: {
            border: {
                color: 0xff0000,
                weight: 2.0
            }
        }
    }
};
