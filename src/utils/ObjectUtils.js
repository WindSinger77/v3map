function isEmpty(value){
    return value === null || value === undefined || value === "";
}

export function copyProp(prop, source, target){
    let value = source[prop];
    if(!isEmpty(value)){
        target[prop] = value;
    }
};

export function isFunction(target){
    return !isEmpty(target) && (typeof target === "function");
};