import { Object3D } from "three";

/**
 * The abstraction class for generic geometry generator and render
 * 
 */
export class IGeometry {
    constructor(context, options) {
        this._context = context;
    }

    /**
     * dispatch and process the event in this component
     * @param {*} event 
     */
    dispatch(event) {

    }

    getContext() {
        return this._context;
    }

    /**
     * generate the three model.
     * @returns 
     */
    render() {
        return new Object3D();
    }
};

/**
 * The geometry generator and render which need a texture resource
 * 
 */
export class TextureGeometry extends IGeometry {
    constructor(context, texture, options) {
        super(context, options);

        this._texture = texture;
    }

    /**
     * get the texture
     * @returns 
     */
    getTexture() {
        return this._texture;
    }
}

/**
 * The geometry collection component.
 */
export class GeometryCollection extends IGeometry {
    constructor(context, options) {
        super(context, options);

        this._children = [];
    }

    getName() {
        return "";
    }

    /**
     * get the children
     * @returns 
     */
    getChildren() {
        return this._children;
    }

    /**
     * add the child
     * @param {*} child 
     */
    addChildren(child) {
        this._children.push(child);
    }
}


