// @ts-check

/** @typedef {import("../UIScene.js").default} UIScene */

export default class SimpleButton {

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

    constructor(owner, name, delay, pos, nameImage, callback, awaitCompletion) {

        this.owner = owner;
        this.scene = owner.scene;
        this.name = name;
        this.delay = delay;
        
        this.isCooldown = false;
        this.canBeInteractive = true;
        this.awaitCompletion = awaitCompletion;

        this.sprite = this.scene.add.image(pos.x, pos.y, nameImage)
            .setOrigin(0.5, 0.5)
            .setAlpha(1)
            .setScale(this.getSystemScale() * 0.8)
            .setInteractive();

        owner.add(this.sprite);


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
        return this.owner.getItemPosition(this);
    }

    getSystemScale() {
        let  scale =  1;
        if (this.owner.scene.settingsResize.settingDesk.type !== 'DESKTOP') {
            scale = (30 / 18);
        }
        return scale;
    }

    resize(pos) {
        this.sprite.setPosition(pos.x, pos.y)
            .setScale(this.getSystemScale() * 0.8);
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

                let promise = new Promise((resolve, reject) => {
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
            
                promise.then(() => {
                    if (this.owner.canBeInteractive) {
                        this.sprite.setInteractive();
                    }

                    if (callback) callback();
                    this.isCooldown = false;

                    if (this.owner.canBeInteractive) {
                        this.setInteractive();
                        this.normalDisplay();
                    } else {
                        this.disableInteractive();
                        this.normalDisableDisplay();
                    }
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
            this.sprite.setAlpha(1);
        }
    }

    disableInteractive() {
        this.sprite.disableInteractive();
        this.sprite.setAlpha(0.2);
    }

    setCanBeInteractive(value) {
        
        const isNewValue = (this.canBeInteractive !== value);

        this.canBeInteractive = value;
        this.canBeInteractive ? this.setInteractive() : this.disableInteractive();

        isNewValue && !this.canBeInteractive && this.normalDisableDisplay();
    }

    normalDisplay() {
        this.sprite.setAlpha(1).setScale(this.getSystemScale() * 0.8);
    }

    normalDisableDisplay() {
        this.sprite.setAlpha(0.2).setScale(this.getSystemScale() * 0.8);
    }

    activeDisplay() {
        this.sprite.setAlpha(1).setScale(this.getSystemScale() * 0.85);
    }
}