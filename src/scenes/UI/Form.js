// @ts-check

import * as observer from './Observer.js';

export default class Form extends observer.SubjectMixin(observer.Observer) {
    
    constructor(scene, width, height, isOpen, style) {
        super();

        this.isCooldown = false;

        this.scene = scene;
        this.width = width;
        this.height = height;
        this.isOpen = isOpen;
        this.canBeInteractive = true;
        this.scale = 1;
        this.graphics = scene.add.graphics(style);        

        const hitArea = new Phaser.Geom.Rectangle(0, 0, scene.scale.width, scene.scale.height);
        this.zone = scene.add.zone()
            .setOrigin(0, 0)
            .setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
            .disableInteractive();

        this.container = scene.add.container();
        this.container.setSize(this.width, this.height);

        const pos = this.getPosition(isOpen);
        this.setPosition(pos.x, pos.y);
        
        scene.add.existing(this.container);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.update();
    }

    update() {
        this.container.setPosition(this.x, this.y);
        this.zone.setPosition(this.x, this.y);

        let radius = Math.min(25 * window.devicePixelRatio * this.scene.scaleGame, this.height * 30 / 100);

        this.drawBackground(this.x, this.y, this.width, this.height, radius);
        this.isOpen && this.canBeInteractive ? this.setInteractive() : this.disableInteractive();
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {number} radius 
     */
    drawBackground(x, y, width, height, radius = 20) {
        
        const graphics = this.graphics;

        graphics.clear()

        graphics.beginPath();
    
        // Start from the top-left corner
        // Move to the start of the top arc
        graphics.moveTo(x + radius, y);
    
        // Top right corner
        graphics.lineTo(x + width - radius, y);
        graphics.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);
    
        // Bottom right corner
        graphics.lineTo(x + width, y + height - radius);
        graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
    
        // Bottom left corner
        graphics.lineTo(x + radius, y + height);
        graphics.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
    
        // Top left corner
        graphics.lineTo(x, y + radius);
        graphics.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    
        graphics.closePath();
        graphics.fillPath();

    }

    // disableInteractive() {
    //     this.graphics.disableInteractive();
    // }

    // setInteractive() {
    //     const rect = new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
    //     this.graphics.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
    // }

    disableInteractive() {
        this.zone.disableInteractive();
    }

    setInteractive() {
        this.zone
            .setSize(this.width, this.height)
            .setInteractive();
        this.zone.input.hitArea.setSize(this.width, this.height);
    }

    open() {
        return this.#animToMove(150, true);
    }

    close() {
        return this.#animToMove(150, false);
    }

    #animToMove(duration, isOpen) {
        const pos = this.getPosition(isOpen);
        const promise = new Promise((resolve, reject) => {
            this.scene.tweens.add({
                targets: this,
                x: pos.x,
                y: pos.y,
                ease: 'Linear',
                duration: duration,
                onUpdate: function (tween, target, key, current, previous, param) {
                    target.update();
                },
                onComplete: () => {
                    this.isOpen = isOpen;
                    this.setPosition(pos.x, pos.y);
                    this.isOpen ? this.onCompleteOpen() : this.onCompleteClose();
                    resolve();
                }
            });

        });
        return promise;
    }

    onCompleteOpen() {

    }

    onCompleteClose() {
        
    }

    getPosition(isOpen) {
        return {
            x: (this.scene.scale.width - this.width) / 2,
            y: isOpen ? (this.scene.scale.height - this.height) / 2 : this.scene.scale.height + 10,
        };
    }

    add(elemet) {
        this.container.add(elemet);
    }

    resize() {

        this.container.setSize(this.width, this.height);
        
        const pos = this.getPosition(this.isOpen);
        this.setPosition(pos.x, pos.y);

    }

    onEvent(event, data) {

        if (event === 'resize') {
            this.resize();
        } else if (event === 'updateLocalization') {
            this.updateLocalization();
        }
    }

    startCooldown(delay = 50) {
        this.isCooldown = true;
        this.scene.time.delayedCall(delay, () => {
            this.isCooldown = false;
        });
    }

    setCanBeInteractive(value) {
        this.canBeInteractive = value;
        this.update();
        this.setInteractiveForChild();
    }

    setInteractiveForChild() {

    }

    updateLocalization() {
        
    }

}