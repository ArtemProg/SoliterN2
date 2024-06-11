// @ts-check

/** @typedef {import("../scenes/GameScene.js").default} GameScene */
/** @typedef {import("../core/Spot.js").default} Spot */

import {COLOR} from "../core/tools/constants.js";

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
            this.image.setTint(COLOR.YELLOW);
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

        let color = COLOR.BRIGHT_YELLOW;//0xFFFFFF;

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

}