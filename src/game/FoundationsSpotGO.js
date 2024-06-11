// @ts-check

import SpotGO from "./SpotGO.js";

export default class FoundationsSpotGO extends SpotGO {

    //** @type {Phaser.GameObjects.Text} */
    //#label;
    #emitParticle;
    
    constructor(scene, x, y, value) {
        
        super(scene, x, y, value);

        // this.#label = scene.make.text({
        //     x: scene.cardGeometry.width / 2,
        //     y: scene.cardGeometry.width / 2,
        //     origin: {x: 0.5 , y: 0.5},
        //     text: 'A',
        //     style: {
        //         font: 'bold 150px Arial',
        //         color: 'white',
        //     }
        // });
        
        // this.add(this.#label);

        this.image0 = this.scene.add.sprite(scene.cardGeometry.width / 2, scene.cardGeometry.height / 2, 'cards', 'shape');
        this.image0.setOrigin(0.5, 0.5);
        this.image0.setScale(0.98, 0.97)
        this.add(this.image0);
        this.image0.alpha = 0.2;
        this.image0.setTint(0x000000);

        this.image = this.scene.add.sprite(scene.cardGeometry.width / 2, scene.cardGeometry.height / 2, 'cards', 'spotA');
        this.image.setOrigin(0.5, 0.5);
        this.add(this.image);
        this.image.alpha = 0.8;
        //this.image.setTint(0xCBC9CF);

        this.#emitParticle = (frame) => {

            const emitter = this.scene.add.particles(0, 0, 'cards', {
                frame: frame,
                x: this.x + scene.cardGeometry.width / 2,
                y: this.y + scene.cardGeometry.height / 2,
                lifespan: 600,
                speed: { min: 150, max: 200},
                scale: { start: 0.8, end: 0.6 },
                alpha: { start: 0.4, end: 1 },
                quantity: 15,
                deathZone: {
                    type: 'onLeave',
                    source: new Phaser.Geom.Rectangle( this.x - 10, this.y - 10, scene.cardGeometry.width + 20, scene.cardGeometry.height + 20)
                 },
                emitting: false
            }); 

            emitter.setDepth(10);

            emitter.emitParticleAt(this.x + scene.cardGeometry.width / 2, this.y + scene.cardGeometry.height / 2, 20);
        }

    }

    beautifulEffect(suit) {

        let color;
        if (suit === 'hearts' || suit === 'diamonds') {
            color = 0xFF0000;
        } else if (suit === 'spades' || suit === 'clubs') {
            color = 0x000000;
        } else {
            return;
        }

        this.#emitParticle(suit);

        this.shape.scale = 1;
        this.shape.visible = true;
        this.shape.setTint(color).alpha = 0.9;

        this.scene.tweens.add({
            targets: this.shape,
            scale: 1.1,
            alpha: 0.3,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.shape.scale = 1;
                this.shape.visible = false;
                this.shape.alpha = 0.9;
            }
        });
    }
    
}