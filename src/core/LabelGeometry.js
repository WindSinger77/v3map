import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import Configuration from "./Configuration";
import { IGeometry } from "./IGeometry";
import { copyProp, isFunction } from "../utils/ObjectUtils";

const props = ["className"];
const styleProps = ["backgroundColor", "color", "fontSize", "fontWeight"];

/**
 * The geometry to display label for data.
 */
export default class LabelGeometry extends IGeometry {
    constructor(context, feature, text, position, options) {
        super(context, options);

        this._feature = feature;
        this._text = text;
        this._position = position;

        this._options = {};

        const { dataLabel } = Configuration || {};
        props.forEach(prop => {
            copyProp(prop, dataLabel || {}, this._options);
            copyProp(prop, options, this._options);
        }, this);

        const { style } = options || {};
        if (style && isFunction(style)) {
            copyProp("style", { style }, this._options);
        } else {
            this._options.style = {};
            styleProps.forEach(prop => {
                copyProp(prop, dataLabel && dataLabel.style || {}, this._options.style);
                copyProp(prop, style || {}, this._options.style);
            }, this);
        }
    }

    _getColor(color) {
        if (isFunction(color)) {
            return color(this, this._feature);
        }

        return color;
    }

    _applyStyle(docElement) {
        const { style } = this._options;
        if (style) {
            if (isFunction(style)) {
                style(this, this._feature, docElement);
            } else {
                styleProps.forEach(prop => {
                    if (prop === "color") {
                        docElement.style.color = this._getColor(style[prop]);
                    } else {
                        copyProp(prop, style || {}, docElement.style);
                    }
                }, this);
            }
        }
    }

    _generateDocElement() {
        const { className } = this._options;
        const docElement = document.createElement('div');
        docElement.className = className;
        docElement.textContent = this._text;

        this._applyStyle(docElement);
        docElement.style.position = "absolute";
        docElement.style.display = "block";
        docElement.style.textAlign = "center";

        return docElement;
    }

    _generateLabel(docElement) {
        const transformation = this._context.getTransformation();
        const { x, y } = transformation.transform(this._position);
        const label = new CSS2DObject(docElement);
        label.position.x = x;
        label.position.y = y;

        return label;
    }

    render() {
        this._docElement = this._generateDocElement();
        this._label = this._generateLabel(this._docElement);
        return this._label;
    }
}