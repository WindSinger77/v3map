import { Scene, PerspectiveCamera, Object3D } from "three";
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import Context from "./core/Context";
import GeometryRender from "./core/GeometryRender";
import LightGeometry from "./core/LightGeometry";
import AreaGeometry from "./AreaGeometry";
import FlowingsGeometry from "./FlowingsGeometry";
import EventManager from "./core/EventManager";
import ResourceManager from "./core/ResourceManager";

/**
 * Map generator and render
 */
class _Map {
    constructor(configuration, data) {
        this._context = new Context(configuration);
        this._resourceManager = new ResourceManager(this._context);
        this._data = data;

        this._selected = "";
        this._children = [];

        this._flush = this._flush.bind(this);
        this._dispatch = this._dispatch.bind(this);
    }

    _flush() {
        if (this._scene && this._camera && this._render) {
            this._render.render(this._scene, this._camera);

            if (this._labelRender) {
                this._labelRender.render(this._scene, this._camera);
            }
        }
    }

    _dispatch(event) {
        const { type, target } = event || {};
        switch (type) {
            case "click": {
                if (this._selected === target) {
                    const targetGeometry = this._children.find(item => item.getName() === target);
                    targetGeometry.dispatch({
                        ...event,
                        type: "unselect"
                    });

                    this._selected = null;
                } else {
                    const targetGeometry = this._children.find(item => item.getName() === target);
                    targetGeometry.dispatch({
                        ...event,
                        type: "select"
                    });

                    if(this._selected){
                        const selectedGeometry = this._children.find(item => item.getName() === this._selected);
                        selectedGeometry.dispatch({
                            ...event,
                            type: "unselect"
                        });
                    }

                    this._selected = target;
                }
                break;
            }

            default: break;
        }
    }

    destroy() {
        this._context.offRender(this._flush);

        if (this._eventManager) {
            this._eventManager.offDispatch(this._dispatch);
            this._eventManager.stop();
            this._eventManager = null;
        }

        this._selected = false;

        if (this._scene && this._camera && this._render) {
            this._render.clear();
            this._render = null;

            this._scene.clear();
            this._scene = null;

            this._camera.clear();
            this._camera = null;
        }

        if (this._container) {
            const children = this._container.children;
            if (children && children.length) {
                children.forEach(child => {
                    this._container.removeChild(child);
                }, this);
            }
        }

        this._children.splice(0, this._children.length);
    }

    _generateScene() {
        const configuration = this._context.configuration();
        const { background } = configuration || {};
        const { light } = background || {};

        const scene = new Scene();
        const ambientLight = new LightGeometry(this._context, {
            ...(light || {})
        });

        scene.add(ambientLight.render());
        return scene;
    }

    _generateCamera({ width, height, boxWidth, boxHeight }) {
        const camera = new PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        camera.position.y = 0;
        camera.position.x = 0;
        camera.position.z = Math.sqrt(Math.pow(boxWidth, 2) + Math.pow(boxHeight, 2)) / this._context.getPPI() * 2.54 * 0.5;

        return camera;
    }

    _generateRender({ width, height }) {
        const configuration = this._context.configuration();
        const { background } = configuration || {};

        const renderer = new GeometryRender(this._context, { width, height }, {
            ...(background || {})
        });

        return renderer.render();
    }

    _generateLabelRender({ width, height }) {
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px'

        return labelRenderer;
    }

    _generateMap() {
        const map = new Object3D();
        const configuration = this._context.configuration();
        this._data.features.forEach(feature => {
            const area = new AreaGeometry(this._context, this._resourceManager, feature, configuration);
            this._children.push(area);
            map.add(area.render());
        }, this);

        if (this._context.showFlowing()) {
            const { flowing, depth } = configuration;
            const flowings = new FlowingsGeometry(this._context, this._resourceManager, this._data.features, {
                ...(flowing || {}),
                depth
            });
            map.add(flowings.render());
        }

        return map;
    }

    _initSize() {
        this._data.features.forEach(feature => {
            const { coordinates, type } = feature.geometry;
            coordinates.forEach(coordinate => {
                coordinate.forEach(polygon => {
                    if (type === "MultiPolygon") {
                        polygon.forEach(item => {
                            this._context.grope(item);
                        }, this);
                    } else {
                        this._context.grope(item);
                    }
                }, this);
            }, this);
        }, this);
    }

    render(container) {
        this._container = container;

        //确定模型的尺寸
        this._initSize();

        //创建场景
        this._scene = this._generateScene();

        //确定容器尺寸和实际模型的尺寸空间
        const { width, height, boxWidth, boxHeight } = this._context.resize(this._container);

        //创建摄像
        this._camera = this._generateCamera({ width, height, boxWidth, boxHeight });

        //创建地图模型
        const map = this._generateMap();
        this._scene.add(map);


        //生成渲染器
        this._render = this._generateRender({ width, height });
        this._container.appendChild(this._render.domElement);

        //生成文本渲染器
        if (this._context.showLabel()) {
            this._labelRender = this._generateLabelRender({ width, height });
            this._container.appendChild(this._labelRender.domElement);
        }

        //绑定渲染事件
        this._context.onRender(this._flush);

        //渲染
        if (this._context.needAnimation()) {
            this._context.animate();
        } else {
            this._context.trigger();
        }

        //加载资源
        this._resourceManager.load();

        //添加事件
        this._eventManager = new EventManager(this._context, this._scene, this._camera, this._container);
        this._eventManager.onDispatch(this._dispatch);
        this._eventManager.listen();
    }
}

/**
 * The map wrapper to hidden the private way.
 */
export default class V3Map{
    constructor(configuration, data){
        this._map = new _Map(configuration, data);
    }

    destroy(){
        this._map.destroy();
    }

    render(container){
        this._map.render(container);
    }
}