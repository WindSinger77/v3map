import { TextureResourceLoader } from "./IResourceLoader";

export default class ResourceManager {
    constructor(context) {
        this._context = context;

        this._resourceLoaders = [];
    }

    getResourceLoader(url) {
        let resourceLoader = this._resourceLoaders.find(item => item.getUrl() === url);
        if (!resourceLoader) {
            resourceLoader = new TextureResourceLoader(url);
            this._resourceLoaders.push(resourceLoader);
        }

        return resourceLoader;
    }

    addResourceLoader(resourceLoader) {
        this._resourceLoaders.push(resourceLoader);
    }

    load() {
        this._resourceLoaders.forEach(resourceLoader => {
            resourceLoader.load();
        });

        if (!this._context.needAnimation()) {
            this._context.trigger();
        }
    }
}