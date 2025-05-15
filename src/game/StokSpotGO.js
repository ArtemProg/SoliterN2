// @ts-check

import SpotGO from "./SpotGO.js";

export default class StokSpotGO extends SpotGO {

    constructor(scene, x, y, value) {
        
        super(scene, x, y, value);

        this.image = this.scene.add.sprite(scene.cardGeometry.width / 2, scene.cardGeometry.height / 2, 'cards', 'spot');
        this.image.setOrigin(0.5, 0.5);
        this.add(this.image);
        this.image.alpha = 0.9;

        this.image = this.scene.add.sprite(scene.cardGeometry.width / 2, scene.cardGeometry.height / 2, 'cards', 'circleUI');
        this.image.setOrigin(0.5, 0.5);
        this.add(this.image);
        this.image.alpha = 0.9;

    }
    
}