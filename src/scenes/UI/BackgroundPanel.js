// @ts-check
import * as observer from './Observer.js';

export default class BackgroundPanel extends observer.SubjectMixin(observer.Observer) {
    
    constructor(scene, isOpen) {
        super();
        
        this.isCooldown = false;

        this.scene = scene;
        this.graphics = scene.add.graphics({fillStyle: { color: 0x000000, alpha: 0.5 }});
       
        const hitArea = new Phaser.Geom.Rectangle(0, 0, scene.scale.width, scene.scale.height);

        let isClick = false;

        this.zone = scene.add.zone()
            .setOrigin(0, 0)
            .setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
            .disableInteractive()
            .on('pointerdown', (pointer, localX, localY, event) => {
                isClick = true;
                event.stopPropagation();
            })
            .on('pointerup', (pointer, localX, localY, event) => {
                
                if (!isClick) return;
                isClick = false;
                event.stopPropagation();
                
                if (this.isCooldown) return;
                this.notify('pointerdown', {name: 'backgroundPanel'});
                this.startCooldown();
            });

        this.setVisible(isOpen);
        
    }

    open() {
        return new Promise(resolve => {
            this.setVisible(true);
            resolve();
        });
    }

    close() {
        return new Promise(resolve => {
            this.setVisible(false);
            resolve();
        });
    }

    setVisible(value) {
        this.isOpen = value;
        this.update();
    }

    update() {
        this.graphics.clear();
        
        if (this.isOpen) {
        
            const rect = new Phaser.Geom.Rectangle(0, 0, this.scene.scale.width, this.scene.scale.height);
            
            this.graphics.visible = true;
            this.graphics.setPosition(0, 0);
            this.graphics.fillRectShape(rect);

            this.setInteractive();

        } else {

            this.graphics.visible = false;

            this.disableInteractive();

        }
    }

    disableInteractive() {
        this.zone.disableInteractive();
    }

    setInteractive() {
        this.zone
            .setPosition(0, 0)
            .setSize(this.scene.scale.width, this.scene.scale.height)
            .setInteractive();
        this.zone.input.hitArea.setSize(this.scene.scale.width, this.scene.scale.height);
    }

    resize() {
        this.update();
    }

    onEvent(event, data) {

        if (event === 'resize') {
            this.resize();
        }
        
    }

    startCooldown(delay = 200) {
        this.isCooldown = true;
        this.scene.time.delayedCall(delay, () => {
            this.isCooldown = false;
        });
    }

}