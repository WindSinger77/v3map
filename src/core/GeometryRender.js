import { WebGLRenderer } from "three";
import Configuration from "./Configuration";
import { IGeometry } from "./IGeometry";
import { copyProp, isFunction } from "../utils/ObjectUtils";

const props = ["color"];

export default class GeometryRender extends IGeometry {
    constructor(context, size, options) {
        super(context, options);

        this._options = {};
        this._size = size;

        const { background } = Configuration || {};
        props.forEach(prop => {
            copyProp(prop, background || {}, this._options);
            copyProp(prop, options, this._options);
        }, this);
    }

    _getColor(color) {
        if (isFunction(color)) {
            return color(this, this._feature);
        }

        return color;
    }

    render() {
        const { color } = this._options;
        const { width, height } = this._size;
        const renderer = new WebGLRenderer({ alpha: true });
        renderer.setSize(width, height);

        if (color) {
            renderer.domElement.style.backgroundColor = this._getColor(color);
        }

        return renderer;
    }
}