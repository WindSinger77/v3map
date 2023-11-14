import { ExtrudeGeometry, MeshStandardMaterial, Mesh, Shape, DoubleSide, Color } from "three";
import Configuration from "./Configuration";
import { IGeometry } from "./IGeometry";
import { copyProp, isFunction } from "../utils/ObjectUtils";

const props = ["depth", "color", "emissive", "roughness", "metalness", "opacity", "transparent"];

/**
 * The main block geometry for map main area rendering.
 * 
 */
export default class BlockGeometry extends IGeometry {
    constructor(context, feature, polygon, options) {
        super(context, options);

        this._feature = feature;
        this._polygon = polygon;

        this._options = {};

        props.forEach(prop => {
            copyProp(prop, Configuration, this._options);
            copyProp(prop, options, this._options);
        }, this);
    }

    _getColor(color) {
        let result = color;
        if (isFunction(color)) {
            result = color(this, this._feature, this._polygon);
        }

        return result.isColor ? color : new Color(result);
    }

    _generateGeometry() {
        const { depth } = this._options;
        const transformation = this._context.getTransformation();
        const shape = new Shape();
        this._polygon.forEach((item, index) => {
            const [longtitude, latitude] = item;
            const { x, y } = transformation.transform({
                x: longtitude,
                y: latitude
            });
            if (index === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        });

        return new ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false,
        });
    }

    _generateMaterial() {
        const { color, emissive, roughness, metalness, opacity, transparent } = this._options;
        return new MeshStandardMaterial({
            color: this._getColor(color),
            emissive,
            roughness,
            metalness,
            opacity,
            side: DoubleSide,
            transparent
        });
    }

    _generateMesh(geometry, material) {
        return new Mesh(geometry, material);
    }

    render() {
        this._geometry = this._generateGeometry();
        this._material = this._generateMaterial();

        this._mesh = this._generateMesh(this._geometry, this._material);
        this._mesh.layers.enable(1);
        this._mesh.name = this._name;
        return this._mesh;
    }
}