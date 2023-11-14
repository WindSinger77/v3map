import { EventEmitter } from "events";
import { Raycaster } from "three";

export default class EventManager extends EventEmitter {
    constructor(context, scene, camera, container) {
        super();
        this._context = context;
        this._scene = scene;
        this._camera = camera;
        this._container = container;

        this._raycaster = new Raycaster();
        this._raycaster.layers.set(1);

        this._onListen = this._onListen.bind(this);
    }

    onDispatch(callback) {
        this.addListener("dispatch", callback);
    }

    offDispatch(callback) {
        this.removeListener("dispatch", callback);
    }

    _getTargetName(intersect) {
        const { object } = intersect;
        let name = object.name;
        let parent = object.parent;
        while (!name && parent) {
            name = parent.name;
            parent = parent.parent;
        }

        return name;
    }

    _onListen(event) {
        if (!this._on) {
            this._on = true;
            const { clientX, clientY } = event;
            const { clientWidth, clientHeight, offsetWidth, offsetHeight } = this._container;
            const width = clientWidth || offsetWidth || window.innerWidth;
            const height = clientHeight || offsetHeight || window.innerHeight;
            const position = {
                x: (clientX / width) * 2 - 1,
                y: - (clientY / height) * 2 + 1
            };

            this._raycaster.setFromCamera(position, this._camera);
            const intersects = this._raycaster.intersectObjects(this._scene.children, true);
            let target = "";
            if (intersects && intersects.length) {
                const length = intersects.length;

                for (let i = 0; i < length; i++) {
                    const intersect = intersects[i];
                    target = this._getTargetName(intersect);
                    if (target) {
                        break;
                    }
                }
            }

            if (target) {
                this.emit("dispatch", {
                    type: "click",
                    target,
                    position: {
                        x: clientX,
                        y: clientY
                    }
                });
            }

            this._on = false;
        }

    }

    listen() {
        this._container.addEventListener("pointerdown", this._onListen);
    }

    stop() {
        this._container.removeEventListener("pointerdown", this._onListen);
    }
}