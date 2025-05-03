// @ts-check

/** @typedef {import("./../UIScene.js").default} UIScene */

export default class BaseButton {

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {Object} color 
     * @param {{scene: UIScene, add: any}} owner 
     * @param {{name: string, text: string, fontSize: number, texture: string}} description
     * @param {() => void} callback 
     */
    constructor(x, y, width, height, color, owner, description, callback) {

        this.isCooldown = false;

        this.x = x;
        this.y = y;
        this.name = description.name;

        this.width = width;
        this.height = height;

        this.owner = owner;
        this.scene = owner.scene;
        
        const colors = {
            normal: 0x4ea933,
            activa: 0x30681f,
        };

        const nameTexture = this.scene.getTexture(this.width, this.height, 20, color);
        this.background = this.scene.add.sprite(x, y, nameTexture)
            .setTintFill(colors.normal, colors.normal, colors.activa, colors.activa)
            .setInteractive();
        owner.add(this.background);

        this.label = this.scene.add.text(x, y, description.text)
            .setColor('#ffffff')
            .setFontSize(description.fontSize)
            .setFontFamily('Arial')
            .setOrigin(0.5, 0.5);
        owner.add(this.label);

        if (description.hasOwnProperty('texture')) {
            this.sprite = this.scene.add.sprite(x - this.width / 2, y, 'icons', description.texture)
            //this.sprite = this.scene.add.image(x - this.width / 2, y, description.texture)
                .setOrigin(0.5, 0.5)
                .setAlpha(0.9);
            owner.add(this.sprite);
        }
        
        this.background.on('pointerdown', () => {
            
            if (this.isCooldown) return;

            this.background.setTintFill(colors.activa);

        });

        this.background.on('pointerup', () => {
            this.background.setTintFill(colors.normal, colors.normal, colors.activa, colors.activa);
            
            if (this.isCooldown) return;

            callback.call(owner, this, 'onClick');

            this.startCooldown();

        });

        this.background.on('pointerover', () => {
            this.background.setTintFill(colors.activa);
        });

        this.background.on('pointerout', () => {
            this.background.setTintFill(colors.normal, colors.normal, colors.activa, colors.activa);
        });
    }

    startCooldown(delay = 200) {
        this.isCooldown = true;
        this.scene.time.delayedCall(delay, () => {
            this.isCooldown = false;
        });
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.background.setPosition(x, y);
        this.label.setPosition(x, y);
        this.sprite && this.sprite.setPosition(x - this.width / 2 + this.sprite.width * this.sprite.scale, y);
        return this;
    }

    setSize(width, height) {

        this.width = width;
        this.height = height;

        const nameTexture = this.scene.getTexture(this.width, this.height, 20, 0xffffff);

        this.background.setTexture(nameTexture);  

        return this;
    }

    setFontSize(fontSize) {
        this.label.setFontSize(fontSize);
        return this;
    }

    setText(text) {
        this.label.setText(text);
    }
    
    setOrigin(x = 0.5, y = 0.5) {
        this.label.setOrigin(x, y);
        return this;
    }

    setScaleSprite(scale) {
        this.sprite && this.sprite.setScale(scale);
    }

    resumeTween() {

        if (!this.tween) {
            this.tween = this.scene.tweens.add({
                targets: this.background,
                //angle: '+=30',
                duration: 800,
                ease: 'Linear',
                //scale: '+=0.05',
                alpha: 0.7,
                yoyo: true,
                delay: 1000,
                paused: true,
                repeat: -1
            });
        }
        this.tween.resume();

    }

    pauseTween() {
        this.tween &&  this.tween.pause();
    }

}