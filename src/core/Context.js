import { Vector2 } from "three";
import { Mercator, Translation, Amplifier, Transformations } from "../utils/Transformation";
import Configuration from "./Configuration";
import AnimationManager from "./AnimationManager";
import { EventEmitter } from "events";

const radius = 6378137.0;

const inchToCm = 2.54;

/**
 * The mercator projection function implemation to convert the longitude and latitude to plain x and y position
 * @param {*} item 
 * @returns 
 */
const convertToXY = function (item) {
    const [longitude, latitude] = item;
    const x = longitude * Math.PI / 180 * radius;
    const d = latitude * Math.PI / 180;
    const y = (radius / 2) * Math.log((1.0 + Math.sin(d)) / (1.0 - Math.sin(d)));
    return [x, y];
};

/**
 * The render crop windown
 */
class Crop {
    constructor() {
        this._startPoint = null;
        this._endPoint = null;
    }

    /**
     * 根据边界坐标点摸索模型的矩形边界
     * 
     * @param {*} x 
     * @param {*} y 
     */
    grope([longtitude, latitude]) {
        const [x, y] = convertToXY([longtitude, latitude]);
        if (this._startPoint && this._endPoint) {
            this._startPoint.set(Math.min(this._startPoint.x, x), Math.min(this._startPoint.y, y));
            this._endPoint.set(Math.max(this._endPoint.x, x), Math.max(this._endPoint.y, y));
        } else {
            this._startPoint = new Vector2(x, y);
            this._endPoint = new Vector2(x, y);
        }
    }

    getTransformation(multiple) {
        const { x, y } = this.getCenterPoint();
        return new Transformations([
            new Mercator(convertToXY),
            new Translation(-x, -y),
            new Amplifier(multiple)
        ]);
    }


    getStartPoint() {
        return this._startPoint;
    }

    getEndPoint() {
        return this._endPoint;
    }

    getCenterPoint() {
        return {
            x: (this._startPoint.x + this._endPoint.x) / 2,
            y: (this._startPoint.y + this._endPoint.y) / 2
        };
    }


    getWidth() {
        return this._endPoint.x - this._startPoint.x;
    }

    getHeight() {
        return this._endPoint.y - this._startPoint.y;
    }
}

/**
 * The project context for generation and render.
 * 
 */
export default class Context extends EventEmitter {
    constructor(configuration) {
        super();
        this._crop = new Crop();
        this._configuration = configuration;

        this._animating = false;
        this._animationManager = new AnimationManager();

        this.animate = this.animate.bind(this);
    }

    grope([longtitude, latitude]){
        this._crop.grope([longtitude, latitude]);
    }

    /**
     * get the pixel to inch
     * @returns 
     */
    getPPI() {
        let { ppi } = this._configuration;
        return ppi || Configuration.ppi;
    }

    /**
     * recalculate the size for render
     * @param {*} container 
     * @returns 
     */
    resize(container) {
        const ppi = this.getPPI();
        const { width, height } = this._configuration || {};
        const { clientWidth, clientHeight, offsetWidth, offsetHeight } = container;
        let suggestedWidth = width || clientWidth || offsetWidth || window.innerWidth;
        let suggestedHeight = height || clientHeight || offsetHeight;
        if (!suggestedHeight) {
            suggestedHeight = Math.min(suggestedWidth / this._crop.getWidth() * this._crop.getHeight(), window.innerHeight);
        }

        this._multiple = Math.min(suggestedWidth / ppi * inchToCm / this._crop.getWidth(), suggestedHeight / ppi * inchToCm / this._crop.getHeight());
        return {
            width: suggestedWidth,
            height: suggestedHeight,
            boxWidth: Math.min(suggestedWidth, suggestedHeight/this._crop.getHeight() * this._crop.getWidth()),
            boxHeight: Math.min(suggestedHeight, suggestedWidth/this._crop.getWidth() * this._crop.getHeight())
        };
    }

    getTransformation() {
        if (!this._transformation) {
            this._transformation = this._crop.getTransformation(this._multiple);
        }

        return this._transformation;
    }

    addAnimation(animation) {
        this._animationManager.addAnimation(animation);
    }

    showBorder() {
        const { border } = this._configuration || {};
        const { show } = border || {};
        return show;
    }

    showLabel() {
        const { dataLabel } = this._configuration || {};
        const { show } = dataLabel || {};
        return show;
    }

    showIcon() {
        const { dataMark } = this._configuration || {};
        const { show, url } = dataMark || {};
        return show && url;
    }

    showFlowing() {
        const { flowing } = this._configuration || {};
        const { show, url } = flowing || {};
        return show && url;
    }

    needAnimation() {
        return this.showFlowing() || this._animationManager.hasAnimation();
    }

    configuration() {
        return this._configuration;
    }

    isAnimating() {
        return this._animating = true;
    }

    onRender(callback) {
        this.addListener("render", callback);
    }

    offRender(callback) {
        this.removeListener("render", callback);
    }

    trigger() {
        this.emit("render");
    }

    animate() {
        this._animating = true;
        if (this.needAnimation()) {
            requestAnimationFrame(this.animate);
            this._animationManager.animate();
        } else {
            this._animating = false;
        }
        this.trigger();
    }
}