// @ts-check

import SpotGO from "./SpotGO.js";

export default class PileSpotGO extends SpotGO {

    //** @type {Phaser.GameObjects.Text} */
    //#label;
    
    constructor(scene, x, y, value) {
        
        super(scene, x, y, value);

        // this.#label = scene.make.text({
        //     x: scene.cardGeometry.width / 2,
        //     y: scene.cardGeometry.width / 2,
        //     origin: {x: 0.5 , y: 0.5},
        //     text: 'K',
        //     style: {
        //         font: 'bold 150px Arial',
        //         color: 'white',
        //     }
        // });
        
        // this.add(this.#label);

        this.image = this.scene.add.sprite(scene.cardGeometry.width / 2, scene.cardGeometry.height / 2, 'cards', 'spot');
        this.image.setOrigin(0.5, 0.5);
        this.image.alpha = 0.9;
        this.add(this.image);

    }

    geometryIntersection() {
        const pos = super.geometryIntersection();

        const cardGO = this.lastCardGO();
        if (cardGO) {
            pos.y = cardGO.y;
            pos.height = this.scene.scale.height - pos.y;
        }

        return pos;
    }

    getSizeShadow(length) {
        const size = super.getSizeShadow(length);
        for (let i = 0; i < size.length - 1; i++) {
            const card = this.value.cards[i];
            size.height +=card.isOpen ? size.cardGeometry.offsetOpenCardY : size.cardGeometry.offsetCloseCardY;
        }
        return size;
    }


}