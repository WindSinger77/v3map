import { Vector3, CatmullRomCurve3, TubeGeometry, MeshBasicMaterial, DoubleSide, Mesh } from "three";
import Configuration from "./Configuration";
import { TextureGeometry } from "./IGeometry";
import { copyProp } from "../utils/ObjectUtils";

const props = ["minDepthDelta", "maxDepthDelta", "weight"];
const parentProps = ["depth"];

/**
 * The geometry for flowing light.
 */
export default class FlowingGeometry extends TextureGeometry {
    constructor(context, texture, startPoint, endPoint, options) {
        super(context, texture, options);

        this._startPoint = startPoint;
        this._endPoint = endPoint;

        this._options = {};
        parentProps.forEach(prop => {
            copyProp(prop, Configuration, this._options);
            copyProp(prop, options, this._options);
        }, this);

        const { flowing } = Configuration || {};
        props.forEach(prop => {
            copyProp(prop, flowing || {}, this._options);
            copyProp(prop, options, this._options);
        }, this);
    }


    _generateGeometry() {
        const { depth, minDepthDelta, maxDepthDelta, weight } = this._options;
        const transformation = this._context.getTransformation();
        const startPoint = transformation.transform(this._startPoint);
        const endPoint = transformation.transform(this._endPoint);

        const deltaX = (endPoint.x - startPoint.x) / 3;
        const deltaY = (endPoint.y - startPoint.y) / 3;
        const points = [
            new Vector3(startPoint.x, startPoint.y, depth + minDepthDelta),
            new Vector3(startPoint.x + deltaX, startPoint.y + deltaY, depth + maxDepthDelta),
            new Vector3(startPoint.x + deltaX * 2, startPoint.y + deltaY * 2, depth + maxDepthDelta),
            new Vector3(endPoint.x, endPoint.y, depth + minDepthDelta)
        ];

        const curve = new CatmullRomCurve3(points);
        const segment = Math.ceil(Math.abs((deltaX * 3) / 0.01));
        return new TubeGeometry(curve, segment, weight, segment * 5);
    }

    _generateMaterial() {
        return new MeshBasicMaterial({
            map: this.getTexture(),
            side: DoubleSide,
            transparent: true
        });
    }

    _generateMesh(geometry, material) {
        return new Mesh(geometry, material);
    }

    render() {
        this._geometry = this._generateGeometry();
        this._material = this._generateMaterial();
        this._mesh = this._generateMesh(this._geometry, this._material);
        this._mesh.name = "lights";
        this._mesh.layers.enable(2);
        return this._mesh;
    }
}
