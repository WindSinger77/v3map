/**
 * The animation manager to manage all the animation behavior
 */
export default class AnimationManager {
    constructor() {
        this._animations = [];
    }

    hasAnimation() {
        return this._animations && this._animations.length;
    }

    addAnimation(animation) {
        this._animations.unshift(animation);
    }

    animate() {
        const length = this._animations.length;
        for (let i = length - 1; i >= 0; i--) {
            const animation = this._animations[i];
            if (animation.isCompleted()) {
                animation.stop();

                this._animations.splice(i, 1);
            } else {
                animation.animate();
            }
        }
    }
}