// @ts-check

export default class PreloadScene extends Phaser.Scene {

    constructor() {
          
        super('Preload');
        this.sdk = null;
        this.userSettingsManager = null;

        this.availableLanguages = [
            { key: 'en', name: 'English' },
            { key: 'es', name: 'Español' },
            { key: 'fr', name: 'Français' },
            { key: 'de', name: 'Deutsch' },
            { key: 'it', name: 'Italiano' },
            { key: 'pt', name: 'Português' },
            { key: 'ru', name: 'Русский' },
            { key: 'pl', name: 'Polski' },
            { key: 'uk', name: 'Українська' },
            { key: 'cs', name: 'Čeština' },
            { key: 'ro', name: 'Română' },
            { key: 'sr', name: 'Српски' },
            { key: 'kk', name: 'Қазақша' },
            { key: 'be', name: 'Беларуская' },
            { key: 'hy', name: 'Հայերեն' },
            { key: 'ka', name: 'ქართული' },
            { key: 'tr', name: 'Türkçe' }
        ];
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

        // Проверим, какие языки реально были загружены
        this.availableLanguages = this.availableLanguages.filter(lang => {
            const data = this.cache.json.get(lang.key);
            return data && typeof data === 'object';
        });
        this.registry.set('availableLanguages', this.availableLanguages);
        
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
        this.load.image('ball', 'assets/images/ball.png');
        this.load.image('wand', 'assets/images/wand.png');
        this.load.image('language', 'assets/images/language.png');  

        for (const lang of this.availableLanguages) {
            this.load.json(lang.key, `assets/lang/${lang.key}.json`);
        }

    }
    
    createBackground() {
        // this.add.sprite(0, 0, "bg").setOrigin(0, 0);
    }
}