import { EventEmitter } from "events";
import { TextureLoader } from "three";

/**
 * The abstraction class for resource loading.
 */
export class IResoureLoader extends EventEmitter {
    constructor(url) {
        super();
        this._url = url;

        this.setMaxListeners(100);
    }

    getUrl() {
        return this._url;
    }

    onCompleted(callback) {
        this.addListener("completed", callback);
    }

    offCompleted(callback) {
        this.removeListener("completed", callback);
    }

    /**
     * get the resource
     * @returns 
     */
    getResource() {
        return null;
    }

    /**
     * load the resource;
     */
    load() {
        this.emit("completed", this, this.getResource());
    }
};

/**
 * The texture resource loader
 */
export class TextureResourceLoader extends IResoureLoader {
    constructor(url) {
        super(url);
    }

    onCompleted(callback) {
        if (this._texture) {
            callback(this, this._texture);
        } else {
            this.addListener("completed", callback);
        }
    }

    getResource() {
        return this._texture;
    }

    load() {
        if (this._texture) {
            this.emit("completed", this, this._texture);
        } else {
            new TextureLoader().load(this._url, texture => {
                this._texture = texture;
                this.emit("completed", this, this._texture);
            });
        }
    }
}