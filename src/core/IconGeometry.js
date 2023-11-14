import { SpriteMaterial, Sprite } from "three";
import Configuration from "./Configuration";
import { TextureGeometry } from "./IGeometry";
import { copyProp } from "../utils/ObjectUtils";

const props = ["scale", "transparent"];
const parentProps = ["depth"];

/**
 * The geometry for icon rendering
 * 
 */
export default class IconGeometry extends TextureGeometry {
    constructor(context, feature, texture, position, options) {
        super(context, texture, options);

        this._feature = feature;
        this._position = position;

        this._options = {};
        parentProps.forEach(prop => {
            copyProp(prop, Configuration, this._options);
            copyProp(prop, options, this._options);
        }, this);

        const { dataMark } = Configuration || {};
        props.forEach(prop => {
            copyProp(prop, dataMark || {}, this._options);
            copyProp(prop, options, this._options);
        }, this);
    }

    _generateMaterial() {
        const { transparent } = this._options;
        return new SpriteMaterial({
            map: this.getTexture(),
            transparent
        });
    }

    _generateSprite(material) {
        const { depth, scale } = this._options;
        const transformation = this._context.getTransformation();
        const { x, y } = transformation.transform(this._position);

        const sprite = new Sprite(material);
        sprite.scale.set(scale, scale, scale);
        sprite.position.set(x, y, depth);
        sprite.renderOrder = 1;
        return sprite;
    }

    render() {
        this._material = this._generateMaterial();
        this._sprite = this._generateSprite(this._material);
        this._sprite.layers.enable(2);

        return this._sprite;
    }
}