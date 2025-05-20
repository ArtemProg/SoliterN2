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
            { key: 'kk', name: 'Қазақша' },
            { key: 'tr', name: 'Türkçe' },
            
            // { key: 'uk', name: 'Українська' },
            // { key: 'cs', name: 'Čeština' },
            // { key: 'ro', name: 'Română' },
            // { key: 'sr', name: 'Српски' },
            // { key: 'be', name: 'Беларуская' },
            // { key: 'hy', name: 'Հայերեն' },
            // { key: 'ka', name: 'ქართული' },
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

        this.setLanguage()

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

    setLanguage() {
        // Проверим, какие языки реально были загружены
        this.availableLanguages = this.availableLanguages.filter(lang => {
            const data = this.cache.json.get(lang.key);
            return data && typeof data === 'object';
        });
        this.registry.set('availableLanguages', this.availableLanguages);
        
        let language = '';
        if (this.userSettingsManager.settings.isLanguageSaved && this.userSettingsManager.language) {
            const langExists = this.availableLanguages.some(lang => {
                return lang.key === this.userSettingsManager.language;
            });
            if (langExists) {
                language = this.userSettingsManager.language;
            }
        }
        if (!language) {
            language = this.sdk.lang();
        }

        let availableLanguage;

        if (this.availableLanguages.some(lang => lang.key === language)) {
            availableLanguage = language;
        } else if (['be', 'kk', 'uk', 'uz'].some(lang => lang === language)) {
            availableLanguage = 'ru';
        } else {
            availableLanguage = 'en';
        }

        this.userSettingsManager.setLanguage(availableLanguage);
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