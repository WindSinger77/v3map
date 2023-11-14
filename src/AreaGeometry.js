import Configuration from "./core/Configuration";
import { GeometryCollection } from "./core/IGeometry";
import IAnimation from "./core/IAnimation";
import { copyProp, isFunction } from "./utils/ObjectUtils";
import BlockGeometry from "./core/BlockGeometry";
import BorderGeometry from "./core/BorderGeometry";
import LabelGeometry from "./core/LabelGeometry";
import IconGeometry from "./core/IconGeometry";
import { Object3D } from "three";

const props = ["id", "name", "center", "depth", "color", "emissive", "roughness", "metalness", "opacity", "transparent", "border", "dataLabel", "dataMark", "events"];

/**
 * The translation animation
 * 
 */
class TranslationAnimation extends IAnimation {
    constructor(target, fromZ, toZ, callback) {
        super();
        this._target = target;
        this._fromZ = fromZ;
        this._toZ = toZ;
        this._callback = callback;

        this._step = (toZ - fromZ) / 25;
    }

    init() {
        this._target.position.z = this._fromZ;
    }

    stop() {
        if (this._callback) {
            this._callback();
        }
    }

    isCompleted() {
        return this._step > 0 ? this._fromZ >= this._toZ : this._fromZ <= this._toZ;
    }

    animate() {
        this._fromZ += this._step;
        this._target.position.z = this._fromZ;
    }
}

/**
 * The geometry for map area
 * 
 */
export default class AreaGeometry extends GeometryCollection {
    constructor(context, resourceManager, feature, options) {
        super(context, options);

        this._resourceManager = resourceManager;
        this._feature = feature;

        this._options = {};

        props.forEach(prop => {
            copyProp(prop, Configuration, this._options);
            copyProp(prop, options, this._options);
        }, this);

        this._animating = false;

        this._generateIcon = this._generateIcon.bind(this);
        this._onEventCompleted = this._onEventCompleted.bind(this);

        const { id } = this._options;
        this._name = this._index(id);
    }

    getName() {
        return this._name;
    }

    _index(id) {
        if (isFunction(id)) {
            return id(this._feature);
        }

        return this._feature[id];
    }

    _onEventCompleted() {
        this._animating = false;
    }

    _handleSelectEvent(event) {
        if (!this._animating) {
            this._animating = true;

            const { depth, events } = this._options;
            const { select } = events || {};
            if (select) {
                const children = this.getChildren();
                children.forEach(child => {
                    child.dispatch(event);
                });

                const { depthDelta, onSelect } = select || {};

                const animation = new TranslationAnimation(this._target, 0, depthDelta || depth, this._onEventCompleted);
                animation.init();
                this._context.addAnimation(animation);
                if (!this._context.isAnimating) {
                    this._context.animate();
                }

                if (onSelect) {
                    new Promise(resolve => {
                        resolve(onSelect);
                    }).then(callback => {
                        callback(this, event, this._feature);
                    }).catch(error => {

                    });
                }
            }
        }
    }

    _handleUnselectEvent(event) {
        if (!this._animating) {
            this._animating = true;

            const { depth, events } = this._options;
            const { select } = events || {};
            if (select) {
                const children = this.getChildren();
                children.forEach(child => {
                    child.dispatch(event);
                });

                const { depthDelta, onSelect } = select || {};

                const animation = new TranslationAnimation(this._target, depthDelta || depth, 0, this._onEventCompleted);
                animation.init();
                this._context.addAnimation(animation);
                if (!this._context.isAnimating) {
                    this._context.animate();
                }

                if (onSelect) {
                    new Promise(resolve => {
                        resolve(onSelect);
                    }).then(callback => {
                        callback(this, event, this._feature);
                    }).catch(error => {

                    });
                }
            }
        }
    }

    dispatch(event) {
        const { type } = event || {};
        switch (type) {
            case "select": {
                this._handleSelectEvent(event);
                break;
            }
            case "unselect": {
                this._handleUnselectEvent(event);
                break;
            }
            default: break;
        }
    }

    _generateBlock(polygon) {
        return new BlockGeometry(this._context, this._feature, polygon, this._options);
    }

    _generateBorder(polygon) {
        const { depth, border, events } = this._options;
        return new BorderGeometry(this._context, this._feature, polygon, {
            ...(border || {}),
            depth,
            events,
        });
    }

    _generateLabel(text, { x, y }) {
        const { depth, dataLabel, events } = this._options;
        return new LabelGeometry(this._context, this._feature, text, { x, y }, {
            ...(dataLabel || {}),
            depth,
            events
        });
    }

    _generateIcon(resourceLoader, texture) {
        resourceLoader.offCompleted(this._generateIcon);

        const { depth, dataMark, events } = this._options;
        const { center } = this._options;
        const [centerX, centerY] = center(this._feature);
        const icon = new IconGeometry(this._context, this._feature, texture, {
            x: centerX,
            y: centerY
        }, {
            ...(dataMark || {}),
            depth,
            events
        });

        this._target.add(icon.render());
        this.addChildren(icon);

        if(!this._context.needAnimation()){
            this._context.trigger();
        }
    }

    _lazyGenerateIcon() {
        const { dataMark } = this._options;
        const { url } = dataMark || {};
        if (url) {
            const resourceLoader = this._resourceManager.getResourceLoader(url);
            resourceLoader.onCompleted(this._generateIcon);
        }
    }

    render() {
        this._target = new Object3D();
        const { geometry } = this._feature;
        const { coordinates, type } = geometry;
        coordinates.forEach(coordinate => {
            const result = new Object3D();
            if (type === "MultiPolygon") {
                coordinate.forEach(item => {
                    const block = this._generateBlock(item);
                    this.addChildren(block);
                    result.add(block.render());
                    if (this._context.showBorder()) {
                        const border = this._generateBorder(item);
                        this.addChildren(border);
                        result.add(border.render());
                    }
                });
            } else {
                const block = this._generateBlock(coordinate);
                this.addChildren(block);
                result.add(block.render());
                if (this._context.showBorder()) {
                    const border = this._generateBorder(coordinate);
                    this.addChildren(border);
                    result.add(border.render());
                }
            }
            this._target.add(result);
        }, this);

        if (this._context.showLabel()) {
            const { center, name } = this._options;
            const [centerX, centerY] = center(this._feature);
            const text = name(this._feature);
            if (text) {
                const label = this._generateLabel(text, {
                    x: centerX,
                    y: centerY
                });
                this._target.add(label.render());
                this.addChildren(label);
            }
        }

        if (this._context.showIcon()) {
            this._lazyGenerateIcon();
        }

        this._target.name = this._name;
        return this._target;
    }
}