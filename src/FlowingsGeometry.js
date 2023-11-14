import { Object3D, RepeatWrapping } from "three";
import Configuration from "./core/Configuration";
import { GeometryCollection } from "./core/IGeometry";
import IAnimation from "./core/IAnimation";
import { copyProp, isFunction } from "./utils/ObjectUtils";
import FlowingGeometry from "./core/FlowingGeometry";

const props = ["url", "minDepthDelta", "maxDepthDelta", "weight", "series"];
const parentProps = ["id", "center", "depth"];

/**
 * The flowing light animation;
 */
class TextureAnimation extends IAnimation {
    constructor(texture) {
        super();
        this._texture = texture;

        this._step = 0.01
    }

    isCompleted() {
        false;
    }

    animate() {
        this._texture.offset.x -= this._step;
    }
}

/**
 * The geometry group for flowing light
 * 
 */
export default class FlowingsGeometry extends GeometryCollection {
    constructor(context, resoureManager, features, options) {
        super(context, options);
        this._features = features;
        this._resourceManager = resoureManager;

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

        this._generateFlowings = this._generateFlowings.bind(this);
    }

    getName() {
        return "lights";
    }

    _index(id, feature) {
        if (isFunction(id)) {
            return id(feature);
        }

        return feature[id];
    }

    _generateFlowings(resourceLoader, texture) {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.needsUpdate = true;

        const { series } = this._options;
        if (series && series.length) {
            series.forEach(item => {
                if (item.start !== item.end) {
                    const flowing = this._generateFlowing(item, texture);
                    if (flowing) {
                        this._target.add(flowing.render());
                    }
                }
            }, this);
        }

        const animation = new TextureAnimation(texture);
        animation.init();
        this._context.addAnimation(animation);
    }

    _generateFlowing(series, texture) {
        const { id, center } = this._options;
        const start = series.start;
        const end = series.end;

        const startFeature = this._features.find(feature => this._index(id, feature) === start, this);
        const endFeature = this._features.find(feature => this._index(id, feature) === end, this);

        if (startFeature && endFeature) {
            const startCenter = center(startFeature);
            const endCenter = center(endFeature);
            if (startCenter && endCenter) {
                const [startX, startY] = startCenter;
                const [endX, endY] = endCenter;

                return new FlowingGeometry(this._context, texture, {
                    x: startX,
                    y: startY
                }, {
                    x: endX,
                    y: endY
                }, this._options);
            }
        }

        return null;
    }

    _lazyGenerateFlowings() {
        const { url } = this._options;
        const resourceLoader = this._resourceManager.getResourceLoader(url);

        resourceLoader.onCompleted(this._generateFlowings);
    }

    render() {
        this._target = new Object3D();
        this._lazyGenerateFlowings();
        return this._target;
    }
}