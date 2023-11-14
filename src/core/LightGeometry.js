import { Color, AmbientLight } from "three";
import Configuration from "./Configuration";
import { IGeometry } from "./IGeometry";
import { copyProp, isFunction } from "../utils/ObjectUtils";

const props = ["color", "intensity"];

export default class LightGeometry extends IGeometry {
    constructor(context, options) {
        super(context, options);

        this._options = {};

        const { background } = Configuration || {};
        const { light } = background || {};
        props.forEach(prop => {
            copyProp(prop, light || {}, this._options);
            copyProp(prop, options, this._options);
        }, this);

    }

    _getColor(color) {
        let result = color;
        if (isFunction(color)) {
            result = color(this);
        }

        return result.isColor ? color : new Color(result);
    }

    _generateLight() {
        const { color, intensity } = this._options;
        return new AmbientLight(this._getColor(color), intensity);
    }

    render() {
        this._light = this._generateLight();
        return this._light;
    }
}