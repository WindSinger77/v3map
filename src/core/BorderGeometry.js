import { Vector3, BufferGeometry, LineBasicMaterial, Line , Color} from "three";
import Configuration from "./Configuration";
import { IGeometry } from "./IGeometry";
import { copyProp, isFunction } from "../utils/ObjectUtils";

const props = ["depthDelta", "color", "weight", "events"];
const parentProps = ["depth"];

/**
 * The geometry for border render
 * 
 */
export default class BorderGeometry extends IGeometry {
    constructor(context, feature, polygon, options) {
        super(context, options);

        this._feature = feature;
        this._polygon = polygon;

        this._options = {};
        parentProps.forEach(prop => {
            copyProp(prop, Configuration, this._options);
            copyProp(prop, options, this._options);
        }, this);

        const { border } = Configuration || {};
        props.forEach(prop => {
            copyProp(prop, border || {}, this._options);
            copyProp(prop, options, this._options);
        }, this);
    }

    _handleSelectEvent() {
        if (this._material) {
            const { events } = this._options;
            const { select } = events || {};
            const { border } = select || {};
            if (border) {
                const { color, weight } = border || {};
                const parameters = {};
                if (color) {
                    parameters.color = this._getColor(color);
                }

                if (weight) {
                    parameters.linewidth = weight;
                }

                this._material.setValues(parameters);
            }
        }
    }

    _handleUnselectEvent() {
        if (this._material) {
            const { color, weight } = this._options;
            this._material.setValues({
                color: this._getColor(color),
                linewidth: weight
            });
        }
    }

    dispatch(event) {
        const { type } = event || {};
        switch (type) {
            case "select": {
                this._handleSelectEvent();
                break;
            }
            case "unselect": {
                this._handleUnselectEvent();
                break;
            }
            default: break;
        }
    }

    _getColor(color) {
        let result = color;
        if (isFunction(color)) {
            result = color(this, this._feature, this._polygon);
        }

        return result.isColor ? color : new Color(result);
    }

    _generateGeometry() {
        const { depth, depthDelta } = this._options;
        const transformation = this._context.getTransformation();
        const points = [];
        this._polygon.forEach((item) => {
            const [longtitude, latitude] = item;
            const { x, y } = transformation.transform({
                x: longtitude,
                y: latitude
            });
            points.push(new Vector3(x, y, depth + depthDelta));
        });

        return new BufferGeometry().setFromPoints(points);
    }

    _generateMaterial() {
        const { color, weight } = this._options;
        return new LineBasicMaterial({
            color: this._getColor(color),
            linewidth: weight
        });
    }

    _generateLine(geometry, material) {
        return new Line(geometry, material);
    }

    render() {
        this._geometry = this._generateGeometry();
        this._material = this._generateMaterial();
        this._line = this._generateLine(this._geometry, this._material);
        this._line.layers.enable(2);
        return this._line;
    }
}