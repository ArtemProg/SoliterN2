// @ts-check

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('Preload');
        this.sdk = null;
        this.userSettingsManager = null;
    }

    init(data) {
        this.sdk = data.sdkProvider;
        this.userSettingsManager = data.userSettingsManager;
    }

    preload() {
        this.createBackground();
        this.preloadAssets();
    }

    create() {

        new Promise((resolve) => {
            
            if (this.userSettingsManager.settings.isSaved) {
                this.userSettingsManager.getGameSession().then((dataSessionJSON) => {
                    resolve(dataSessionJSON ? dataSessionJSON : null);
                }).catch((err) => {
                    console.error('Failed to get game session:', err);
                    resolve(null);
                });
            } else {
                resolve(null);
            }

        }).then((dataSessionJSON) => {

            this.scene.start('Start', { sdkProvider: this.sdk, userSettingsManager: this.userSettingsManager, dataSessionJSON: dataSessionJSON });

        });
        
    }

    preloadAssets() {

        this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
        this.load.atlas('icons', 'assets/atlas/icons.png', 'assets/atlas/icons.json');
        this.load.json('localization', `assets/lang/${this.userSettingsManager.language}.json`);

    }
    
    createBackground() {
        // this.add.sprite(0, 0, "bg").setOrigin(0, 0);
    }
}