import Form from "./Form.js"
import SimpleButton from "./SimpleButton.js"

export default class SettingsPanel extends Form {

    activeBtn;

    sound = 0;
    autoHints = 0;
    autoComplite = 0;
    hash = 0;

    constructor(scene, isOpen) {
        
        const props = SettingsPanel.getBaseSettings(scene);

        super(scene, props.width, props.height, isOpen, {fillStyle: { color: 0x000000, alpha: 0.99  }});

        this.scaleGame = props.scaleGame;
        
        const dataTitle = props.title;
        this.title = this.scene.add.text(dataTitle.posX, dataTitle.posY, `label_settings`)
            .setColor('#ffffff')
            .setFontSize(dataTitle.fontSize)
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5);
        this.add(this.title);

        const dataRow = props.row;
        this.labelSound = this.scene.add.text(dataRow.posX1, dataRow.posY1, `label_sound`)
            .setColor('#ffffff')
            .setFontSize(dataRow.fontSize)
            .setFontFamily('Arial')
            .setAlpha(0.7)
            .setOrigin(0, 0.5);
        this.add(this.labelSound);

        this.labelHints = this.scene.add.text(dataRow.posX1, dataRow.posY2, `label_hints`)
            .setColor('#ffffff')
            .setFontSize(dataRow.fontSize)
            .setFontFamily('Arial')
            .setAlpha(0.7)
            .setOrigin(0, 0.5);
        this.add(this.labelHints);

        this.labelComplite = this.scene.add.text(dataRow.posX1, dataRow.posY3, `label_complite`)
            .setColor('#ffffff')
            .setFontSize(dataRow.fontSize)
            .setFontFamily('Arial')
            .setAlpha(0.7)
            .setOrigin(0, 0.5);
        this.add(this.labelComplite);

        this.spriteSound = this.scene.add.sprite(dataRow.posX2, dataRow.posY1, 'icons', 'toggleON')
            .setScale(dataRow.scale)
            .setInteractive();
        this.add(this.spriteSound);

        this.spriteHints = this.scene.add.sprite(dataRow.posX2, dataRow.posY2, 'icons', 'toggleON')
            .setScale(dataRow.scale)
            .setInteractive();
        this.add(this.spriteHints);

        this.spriteComplite = this.scene.add.sprite(dataRow.posX2, dataRow.posY3, 'icons', 'toggleON')
            .setScale(dataRow.scale)
            .setInteractive();
        this.add(this.spriteComplite);

        this.labelLang = this.scene.add.text(dataRow.posX1, dataRow.posY4, `label_language`)
            .setColor('#ffffff')
            .setFontSize(dataRow.fontSize)
            .setFontFamily('Arial')
            .setAlpha(0.7)
            .setOrigin(0, 0.5);
        this.add(this.labelLang);

        this.btnLang = new SimpleButton(
            this,
            'Language',
            200,
            { x: dataRow.posX2, y: dataRow.posY4 },
            'language',
            this.onButtondown,
            true
        );

        this.updateLocalization();
        
        this.spriteSound.on('pointerdown', () => {
            this.sound++;
            this.sound = this.sound > 2 ? 0 : this.sound;
            this.showValue();
        });

        this.spriteHints.on('pointerdown', () => {
            this.autoHints = this.autoHints ? 0 : 1;
            this.showValue();
        });
        
        this.spriteComplite.on('pointerdown', () => {
            this.autoComplite = this.autoComplite ? 0 : 1;
            this.showValue();
        });

    }

    onButtondown(btn, event) {
        
        if (this.isCooldown) {
            return false;
        }

        this.activeBtn = undefined;

        if (btn.awaitCompletion) {
            this.isCooldown = true;
            this.activeBtn = btn;
        }

        const dataEvent = {name: 'settingPanel'};
        if (btn.name === 'Language' && event === 'onClick') {
            this.notify('onClickSettingsLanguage', dataEvent);
        } else {
            return false;
        }

        if (!btn.awaitCompletion) {
            this.startCooldown(btn.delay);
        }
        
        return true;
    }

    open() {

        ({sound: this.sound, autoHints: this.autoHints, autoComplite: this.autoComplite} = this.scene.userSettingsManager.settings);

        this.hash = this.getHash();

        this.showValue();

        return super.open();
    }

    getHash() {
        return this.sound + this.autoHints * 10 + this.autoComplite * 100;
    }

    close() {

        if (this.getHash() !== this.hash) {
            this.scene.userSettingsManager.setSound(this.sound);
            this.scene.userSettingsManager.setAutoHints(this.autoHints);
            this.scene.userSettingsManager.setAutoComplite(this.autoComplite);
            this.scene.userSettingsManager.saveSettings();
        }


        return super.close();
    }

    showValue() {

        this.spriteSound.setTexture('icons', this.getNameTexture(this.sound));
        this.spriteHints.setTexture('icons', this.getNameTexture(this.autoHints));
        this.spriteComplite.setTexture('icons', this.getNameTexture(this.autoComplite));
    }

    getNameTexture(value) {
        if (value === 0) return 'toggleOFF';
        if (value === 1) return 'toggleON';
        if (value === 2) return 'toggleMID';
    }

    getPosition(isOpen) {
        return {
            x: (this.scene.scale.width - this.width) / 2,
            y: isOpen ? (this.scene.scale.height - this.height) / 2 : - this.height - 10,
        };
    }

    static getBaseSettings(scene) {

        
        const isLandscape = scene.settingsResize.settingDesk.type === 'LANDSCAPE';
        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';
        
        const scaleGame = isDesktop ? 1.5 : 0.8;//window.devicePixelRatio * scene.scaleGame * (isDesktop ? 2 : 1);

        let width = 600 / scaleGame;
        let height = isLandscape ? scene.scale.height : 190 * 4 / scaleGame;

        

        return {
            title: {
                posX: width / 2,
                posY: 60 / scaleGame,
                fontSize: 60 / scaleGame,
            },
            row: {
                posX1: 30 / scaleGame,
                posX2: 520 / scaleGame,
                posY1: 250 / scaleGame,
                posY2: 350 / scaleGame,
                posY3: 450 / scaleGame,
                posY4: 550 / scaleGame,
                fontSize: 50 / scaleGame,
                scale: 2 / scaleGame
            },
            width: width,
            height: height,
            scaleGame: scaleGame,
        };

    }

    resize() {
        
        const props = SettingsPanel.getBaseSettings(this.scene);

        this.width = props.width;
        this.height = props.height;
        this.scaleGame = props.scaleGame;

        super.resize();

        this.title.setFontSize(props.title.fontSize);
        this.labelSound.setFontSize(props.row.fontSize);
        this.labelHints.setFontSize(props.row.fontSize);
        this.labelComplite.setFontSize(props.row.fontSize);
        this.labelLang.setFontSize(props.row.fontSize);

        this.title.setPosition(props.title.posX, props.title.posY);
        
        this.labelSound.setPosition(props.row.posX1, props.row.posY1);
        this.labelHints.setPosition(props.row.posX1, props.row.posY2);
        this.labelComplite.setPosition(props.row.posX1, props.row.posY3);
        
        this.spriteSound.setPosition(props.row.posX2, props.row.posY1);
        this.spriteHints.setPosition(props.row.posX2, props.row.posY2);
        this.spriteComplite.setPosition(props.row.posX2, props.row.posY3);

        this.btnLang.resize( {x: props.row.posX2, y: props.row.posY4} );
    }

    onEvent(event, data) {

        super.onEvent(event, data);

        let btn;

        if (event === 'onCloseLanguagePanel') {
            btn = this.btnLang;
        }

        if (btn) {
            let callback;
            if (btn === this.activeBtn) {
                callback = () => {
                    this.isCooldown = false;
                    this.activeBtn = undefined;
                }
            }
            btn.commandIsComplite(callback);
        }
    }

    updateLocalization() {
        const localization = this.scene.getLocalization();

        const langs = this.scene.registry.get('availableLanguages') || [];
        const lang = langs.find(lang => lang.key === this.scene.userSettingsManager.language);

        const textLanguage = this.scene.localize('label_language', { lang: lang.name || this.scene.userSettingsManager.language });

        this.title.setText(localization.label_settings);
        this.labelSound.setText(localization.label_sound);
        this.labelHints.setText(localization.label_hints);
        this.labelComplite.setText(localization.label_complite);
        this.labelLang.setText(textLanguage);
    }
    
}