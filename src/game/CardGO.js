// @ts-check

/** @typedef {import("../scenes/GameScene.js").default} GameScene */
/** @typedef {import("../core/Card.js").default} Card */

import {COLOR} from "../core/tools/constants.js";

export default class CardGO extends Phaser.GameObjects.Container {

    /** @type {GameScene} */
    #scene;

    /** @type {Phaser.GameObjects.Sprite} */
    #image;

    /** @type {Number} */
    #width;

    /** @type {Number} */
    #height;

    /** @type {Card} */
    #value;

    /** @type {Phaser.GameObjects.Text} */
    #labelDebug;

    /** 
     * @param {GameScene} scene
     * @param {Card} value
     * @param {Number} x
     * @param {number} y
    */
    constructor(scene, value, x, y) {
        super(scene, x, y);

        this.#value = value;
        this.#scene = scene;

        this.#width = this.#scene.cardGeometry.width;
        this.#height = this.#scene.cardGeometry.height;

        //this.setSize(this.#width, this.#height);

        const posX = this.#width / 2;
        const posY = this.#height / 2;
        
        this.#image = this.#scene.add.sprite(posX, posY, 'cards', this.nameBackCard());
        this.#image.setOrigin(0.5, 0.5);
        this.add(this.#image);

        //const fxShadow = this.#image.preFX.addShadow(5, -5, 0.006, 2, 0x333333, 10);

        if (this.#scene.managerGame.debugMode) {
            this.#labelDebug = this.#scene.make.text({
                x: posX,
                y: 0,
                origin: {x: 0.5 , y: -0.5},
                text: this.fullName,
                style: {
                    font: 'bold 12px Arial',
                    color: '#444444',
                }
            });
            this.add(this.#labelDebug);
        }

        this.#scene.add.existing(this);

        this.setInteractive({
            hitArea : new Phaser.Geom.Rectangle(0, 0, this.#image.width, this.#image.height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false
        });

    }

    nameBackCard () {
        return 'back2';
    }

    /** @returns {Boolean} */
    get isOpen() {
        return this.#value.isOpen;
    }

    /** @returns {Card} */
    get value() {
        return this.#value;
    }

    /** @returns {String}  */
    get fullName() {
        return this.#value.fullName;
    }

    setImageClose() {
        this.#image.setTexture('cards', this.nameBackCard());
    }

    /**
     * @param {number} scaleX 
     * @param {number} scaleY 
     */
    setScaleImage(scaleX, scaleY) {
        this.#image.setScale(scaleX, scaleY)
    }

    setImageOpen() {
        this.#image.setTexture('cards',  this.fullName);
    }

    turnOnTinting() {
        this.#image.setTint(COLOR.YELLOW);
    }

    turnOffTinting() {
        this.#image.clearTint();
    }

    flip(opening=true, callback, duration = 200, delay = 0, hold = 0) {

        new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: this.#image,
                ease: 'Linear',
                scaleX: 0,
                duration: duration / 2,
                delay: delay,
                onComplete: () => {
                    resolve();
                }
            });
        }).then(() => {
            if (opening) {
                this.setImageOpen();
            } else {
                this.setImageClose();
            }
            return opening;
        }).then(() => {
            this.#scene.tweens.add({
                targets: this.#image,
                ease: 'Linear',
                scaleX: 1,
                duration: duration / 2,
                hold: hold,
                onComplete: () => {
                    if (callback) {
                        callback();
                    }
                }
            });
        });


        // this.#scene.tweens.add({
        //     targets: this.#image,
        //     ease: 'Linear',
        //     duration: duration / 2,
        //     scaleX: 0,
        //     onComplete: () => {

        //         if (opening) {
        //             this.setImageOpen();
        //         } else {
        //             this.setImageClose();
        //         }

        //         this.#scene.tweens.add({
        //             targets: this.#image,
        //             ease: 'Linear',
        //             duration: duration / 2,
        //             scaleX: 1,
        //             onComplete: () => {
        //                 if (callback) {
        //                     callback();
        //                 }
        //             }
        //         });

        //     }
        // });

        // this.#image.setTexture('cards',  this.fullName);
        // this.#image.setTexture('cards', 'back');
        // if (opening) {
        //     this.setImageOpen();
        // } else {
        //     this.setImageClose();
        // }
        
        //const frameName = opening ? this.fullName : 'back';
        //const redFrame = this.#scene.textures.getFrame('cards',  opening ? this.fullName : 'back');
        
        //const nameTexture = ;

        // const tween = this.#scene.tweens.add({
        //     targets: this.#image,
        //     scaleX: 0,
        //     duration: duration,
        //     yoyo: true,
        //     ease: 'Linear',
        //     delay: delay,
        //     onYoyo: (tween) => {
        //         if (opening) {
        //             this.setImageOpen();
        //         } else {
        //             this.setImageClose();
        //         }
                
        //     },
        //     onComplete: () => {
                
        //         // if (hold > 0) {

        //         //     tween.pause();

        //         //     this.#scene.time.delayedCall(hold, () => {
                        
        //         //         tween.resume();

        //         //         if (callback) {
        //         //             callback();
        //         //         }

        //         //     }, [], this);

        //         // } else {

        //             if (callback) {
        //                 callback();
        //             }

        //         // }
                
        //     },
        //     onCompleteScope: this
        // });

    }

    flipMoveTo(opening=true, callback, duration = 200, posX, posY) {

        this.flip(opening, callback, duration);

        this.#scene.tweens.add({
            targets: this,
            x: posX,
            y: posY,
            ease: 'Linear',
            duration: duration,
            onComplete: () => {
                this.setPosition(posX, posY);
                if (callback) {
                    callback();
                }
            }
        });

    }

    magicShowHide(isShow, callback, duration = 200) {

        const scale = isShow ? 1 : 0.3;
        const alpha = isShow ? 1 : 0;
        const angle = isShow ? 0 : 360;

        const objTween = {
            targets: this.#image,
            scale: scale,
            alpha: alpha,
            ease: 'back.inout',
            angle: angle,
            //ease: 'Power2',

            duration: duration,
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        };

        this.#scene.tweens.add(objTween);
    }


}