/**
 * The generic transformation abstraction class to define the common behavior of a transformation;
 */
export class ITransformation {
    constructor() {

    }

    transform({ x, y }) {

    }
}

/**
 * The position translation transformation class
 */
export class Translation extends ITransformation {
    constructor(offsetX, offsetY) {
        super();
        this._offsetX = offsetX;
        this._offsetY = offsetY;
    }

    transform({ x, y }) {
        return {
            x: x + this._offsetX,
            y: y + this._offsetY
        };
    }
}

/**
 * The amplifier transformation to scale up and down the size of position.
 * 
 */
export class Amplifier extends ITransformation {
    constructor(scale) {
        super();
        this._scale = scale;
    }

    transform({ x, y }) {
        return {
            x: x * this._scale,
            y: y * this._scale
        };
    }
}

/**
 * The mercator projection transformation to transform longitude and latitude to plain x and y
 */
export class Mercator extends ITransformation {
    constructor(convertor) {
        super();

        this._convertor = convertor;
    }

    transform({ x, y }) {
        const [rx, ry] = this._convertor([x, -y]);
        return {
            x: rx,
            y: -ry
        };
    }
}

/**
 * The transformation group
 */
export class Transformations extends ITransformation{
    constructor(children){
        super();

        this._children = children && children.length? children: [];
    }

    transform({ x, y }){
        let result = {x, y};
        this._children.forEach(transformation => {
            result = transformation.transform(result);
        });
        return result;
    }
}
