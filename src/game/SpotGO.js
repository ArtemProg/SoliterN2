// @ts-check

/** @typedef {import("../scenes/GameScene.js").default} GameScene */
/** @typedef {import("../core/Spot.js").default} Spot */

import * as constants from "../core/tools/constants.js";

export default class SpotGO extends Phaser.GameObjects.Container {

    /** @type {GameScene} */
    #scene;

    /** @type {Phaser.GameObjects.Graphics} */
    #graphics;

    /** @type {Number} */
    #width;

    /** @type {Number} */
    #height;

    /** @type {Spot} */
    #value;

    /** @type {Phaser.GameObjects.Text} */
    #labelDebug;

    shape;
    image;

    /** 
     * @param {GameScene} scene
     * @param {Number} x
     * @param {number} y
     * @param {Spot} value
    */
    constructor(scene, x, y, value) {
        super(scene, x, y);

        this.#scene = scene;
        this.#value = value;

        this.#width = this.#scene.cardGeometry.width;
        this.#height = this.#scene.cardGeometry.height;

        this.shape = this.scene.add.sprite(scene.cardGeometry.width / 2, scene.cardGeometry.height / 2, 'cards', 'shape');
        this.shape.setOrigin(0.5, 0.5);
        this.shape.visible = false;
        this.add(this.shape);

        this.shadow = this.scene.add.sprite(0, 0, this.getNameTexture());
        this.shadow.setOrigin(0, 0);
        this.shadow.setAlpha(0.5);
        //this.shadow.visible = false;
        this.add(this.shadow);
        
        if (this.#scene.managerGame.debugMode) {
            this.#labelDebug = this.#scene.make.text({
                x: 0,
                y: -20,
                text: this.fullName.split(' ').join(' : '),
                style: {
                    font: 'bold 15px Arial',
                    color: 'white',
                }
            });
            this.add(this.#labelDebug);
        }

        this.scene.add.existing(this);

        this.setInteractive({
            hitArea : new Phaser.Geom.Rectangle(0, 0, this.#width, this.#height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false
        });

        this.updatePositionShadow();
    }

    updateText() {
        if (this.#labelDebug) {
            this.#labelDebug.setText(this.fullName.split(' ').join(' : '));
        }
    }

    /** @returns {Spot} */
    get value() {
        return this.#value;
    }

    get fullName() {
        return (this.#value).toString();
    }

    cardover() {
        if (this.image) {
            this.image.setTint(constants.COLOR.YELLOW);
        }
    }

    cardout() {
        if (this.image) {
            this.image.clearTint();
        }
    }

    lastCardGO() {
        const card = this.value.lastCard();
        if (!card) {
            return undefined;
        }
        return this.#scene.managerGame.getCardGO(card);
    }

    /**
     * @returns { {x: number, y: number, width: number, height: number} }
     */
    geometryIntersection() {
        return {
            x: this.x,
            y: this.y,
            width: this.#width,
            height: this.#height,
        }
    }

    resize() {

    }
    
    isEmpty() {
        return this.value.isEmpty();
    }


    flashingShape(callback) {

        let color = constants.COLOR.BRIGHT_YELLOW;//0xFFFFFF;

        this.shape.scale = 1;
        this.shape.visible = true;
        this.shape.setTint(color).alpha = 0.5;

        return this.scene.tweens.add({
            targets: this.shape,
            scaleX: 1.2,
            scaleY: 1.1,
            alpha: 0.3,
            duration: 300,
            repeat: 1,
            yoyo: true,
            ease: 'Linear',
            onComplete: () => {
                this.resetFlashingShape();
                if (callback) {
                    callback();
                }
            }
        });
    }

    resetFlashingShape() {
        this.shape.scale = 1;
        this.shape.visible = false;
        this.shape.alpha = 0.9;
    }

    getNameTexture(length = null) {
        const currentLength = length === null ? this.value.quantity : length;
        const size = this.getSizeShadow(length);
        return this.#scene.managerGame.getTexture(
            size.width,
            size.height,
            10,
            constants.COLOR.BLACK
        );
    }

    getSizeShadow(length = null) {
        const currentLength = length === null ? this.value.quantity : length;
        return {
            width: this.#scene.cardGeometry.width,
            height: this.#scene.cardGeometry.height,
            cardGeometry: this.#scene.cardGeometry,
            length: currentLength,
        }
    }

    updatePositionShadow(length = null, options = null) {
        const currentLength = length === null ? this.value.quantity : length;

        const delta = this.getGroupFromValue(currentLength);
        
        const posXY = this.getPositionShadow(options);
        this.shadow
            .setPosition(posXY.x + delta, posXY.y + delta)
            .setTexture(this.getNameTexture(length))
            .setVisible(!!currentLength);
    }

    getPositionShadow(options) {
        return { x: 0, y: 0 };
    }

    getGroupFromValue(value) {
        if (value === 0) return 0;
        const clamped = Math.max(1, Math.min(value, 13)); // ограничиваем от 1 до 13
        return Math.ceil((clamped / 13) * 4) + 3;
    }

}