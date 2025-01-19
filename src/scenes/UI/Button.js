// @ts-check

/** @typedef {import("../UIScene.js").default} UIScene */

export default class Button {

    owner;
    /** @type {UIScene} */
    scene;
    name;
    text;
    delay;
    isCooldown = false;
    isHandlerRunning = false;
    timerCooldown;
    awaitCompletion;

    sprite;
    label;

    constructor(owner, name, text, delay, img, index, callback, awaitCompletion) {

        this.owner = owner;
        this.scene = owner.scene;
        this.name = name;
        this.text = text;
        this.delay = delay;
        this.index = index;
        this.isCooldown = false;
        this.canBeInteractive = true;
        this.awaitCompletion = awaitCompletion;

        const pos1 = this.getPosition();
        const pos2 = this.getLabelPosition();

        this.sprite = this.scene.add.sprite(pos1.x, pos1.y, img.texture, img.frame)
            .setOrigin(0.5, 0.5)
            .setAlpha(0.1)
            .setScale(this.getSystemScale())
            .setInteractive();

        //this.sprite2 = this.scene.add.image(pos1.x, pos1.y, name.toLowerCase())
        this.sprite2 = this.scene.add.sprite(pos1.x, pos1.y, 'icons', name.toLowerCase())
            .setOrigin(0.5, 0.5)
            //.setAlpha(0.85)
            .setScale(this.getSystemScale() * 0.8);
        
        this.label = this.scene.add.text(pos2.x, pos2.y, text)
            //.setFontStyle('bold')
            .setColor('#ffffff')
            .setFontSize(this.scene.textFontSize *  window.devicePixelRatio)
            .setFontFamily('Arial')
            .setScale(1 / window.devicePixelRatio)
            .setOrigin(0.5, 0.3);

        owner.add(this.sprite);
        owner.add(this.sprite2);
        owner.add(this.label);


        this.sprite.on('pointerdown', () => {
            
            if (this.isCooldown) return;

            this.activeDisplay();

            this.isCooldown = true;
            this.isHandlerRunning = true;
            
            if (this.awaitCompletion) {
                this.disableInteractive();
            }

            const result = callback.call(owner, this, 'onClick');
            
            if (result) {
                if (this.awaitCompletion) {
                    this.timerCooldown = this.scene.time.delayedCall(200, () => {
                        if (this.isCooldown && this.isHandlerRunning) {
                            this.normalDisableDisplay();
                        }
                    });
                } else {
                    this.scene.time.delayedCall(this.delay, () => {
                        this.isCooldown = false;
                        this.isHandlerRunning = false;
                    });
                }
            } else {
                if (this.awaitCompletion) {
                    if (this.canBeInteractive && this.owner.canBeInteractive) {
                        this.setInteractive();
                        this.normalDisplay();
                    } else {
                        this.disableInteractive();
                        this.normalDisableDisplay();
                    }
                }
                this.isCooldown = false;
                this.isHandlerRunning = false;
            }

        }, this);

        this.sprite.on('pointerup', () => {
            this.normalDisplay();
        }, this);

        this.sprite.on('pointerover', () => {
            this.activeDisplay();
        }, this);

        this.sprite.on('pointerout', () => {
            this.normalDisplay();
        }, this);
    }

    getPosition() {
        return {
            x: this.owner.cellSize * this.index + this.owner.cellSize / 2,
            y: this.owner.cellSize / 2
        };
    }

    getLabelPosition() {
        const pos = this.getPosition();
        return {
            x: pos.x,
            y: pos.y + this.owner.height / 2 * 0.6
        }
    }

    getSystemScale() {
        let  scale =  1;
        if (this.owner.scene.settingsResize.settingDesk.type !== 'DESKTOP') {
            scale = (30 / 18);
        }
        return scale;
    }

    resize() {
        
        const pos1 = this.getPosition();
        this.sprite.setPosition(pos1.x, pos1.y)
            .setScale(this.getSystemScale());

        this.sprite2.setPosition(pos1.x, pos1.y)
            .setScale(this.getSystemScale() * 0.8);

        const pos2 = this.getLabelPosition();
        this.label.setPosition(pos2.x, pos2.y)
            //.setFontSize(this.owner.scene.textFontSize / this.owner.scene.scaleGame);
            .setFontSize(this.scene.textFontSize *  window.devicePixelRatio);

    }

    startCooldown() {
        
        this.isCooldown = true;
        if (this.awaitCompletion) {
            this.disableInteractive();
            this.timerCooldown = this.scene.time.delayedCall(300, () => {
                this.isCooldown && this.normalDisableDisplay();
            });
        } else {
            this.scene.time.delayedCall(this.delay, () => {
                this.isCooldown = false;
            });
        }

    }

    commandIsComplite(callback = undefined) {

        this.isHandlerRunning = false;

        if (this.awaitCompletion) {

            if (this.timerCooldown) {
                this.timerCooldown.remove();
                this.timerCooldown.destroy();
            }

            if (this.owner.canBeInteractive) {

                let promise1 = new Promise((resolve, reject) => {
                    this.scene.tweens.add({
                        targets: this.sprite,
                        scale: this.getSystemScale() + 0.05,
                        alpha: 0.15,
                        ease: 'expo.out',
                        duration: 200,
                        hold: 50,
                        yoyo: true,
                        onComplete: () => {
                            resolve();
                        }
                    });
                });
                let promise2 = new Promise((resolve, reject) => {
                    this.scene.tweens.add({
                        targets: this.label,
                        alpha: 1,
                        ease: 'Linear',
                        duration: 400,
                        onComplete: () => {
                            resolve();
                        }
                    });
                });
                let promise3 = new Promise((resolve, reject) => {
                    this.scene.tweens.add({
                        targets: this.sprite2,
                        alpha: 0.7,
                        ease: 'Linear',
                        duration: 400,
                        onComplete: () => {
                            resolve();
                        }
                    });
                });
                // Promise.all([promise1, promise2, promise3]).then(() => {
                //     if (this.owner.canBeInteractive) {
                //         this.setInteractive();
                //         this.normalDisplay();
                //     } else {
                //         this.disableInteractive();
                //         this.normalDisableDisplay();
                //     }
                //     this.isCooldown = false;
                // });

                Promise.race([promise1, promise2, promise3]).then(() => {
                    if (this.owner.canBeInteractive) {
                        this.sprite.setInteractive();
                    }
                    if (callback) callback();
                    this.isCooldown = false;
                }).then(() => {
                    Promise.all([promise1, promise2, promise3]).then(() => {
                        if (this.owner.canBeInteractive) {
                            this.setInteractive();
                            this.normalDisplay();
                        } else {
                            this.disableInteractive();
                            this.normalDisableDisplay();
                        }
                    });
                });

            } else {

                this.normalDisplay();
                this.disableInteractive();

                if (callback) callback();
                
            }
            
        }
    }

    setInteractive() {
        if (this.canBeInteractive) {
            this.sprite.setInteractive();
            this.label.setAlpha(1);
            this.sprite2.setAlpha(1);
        }
    }

    disableInteractive() {
        this.sprite.disableInteractive();
        this.label.setAlpha(0.4);
        this.sprite2.setAlpha(0.2);
    }

    setCanBeInteractive(value) {
        
        const isNewValue = (this.canBeInteractive !== value);

        this.canBeInteractive = value;
        this.canBeInteractive ? this.setInteractive() : this.disableInteractive();

        isNewValue && !this.canBeInteractive && this.normalDisableDisplay();
    }

    normalDisplay() {
        this.sprite.setAlpha(0.1).setScale(this.getSystemScale());
        this.label.setFontSize(this.scene.textFontSize * window.devicePixelRatio);
        this.sprite2.setAlpha(1).setScale(this.getSystemScale() * 0.8);
    }

    normalDisableDisplay() {
        this.sprite.setAlpha(0.1).setScale(this.getSystemScale());
        this.label.setAlpha(0.4).setFontSize(this.scene.textFontSize * window.devicePixelRatio);
        this.sprite2.setAlpha(0.2).setScale(this.getSystemScale() * 0.8);
    }

    activeDisplay() {
        this.sprite.setAlpha(0.4).setScale(this.getSystemScale() + 0.1);
        this.label.setFontSize(this.scene.textFontSize * window.devicePixelRatio * 1.15);
        this.sprite2.setAlpha(1).setScale(this.getSystemScale() * 0.85);
    }
}