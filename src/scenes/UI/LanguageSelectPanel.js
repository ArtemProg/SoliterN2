// @ts-check

import Form from "./Form.js";
import Button from "./Button.js";

export default class LanguageSelectPanel extends Form {

    btns;
    #mappedBtns;
    currentLanguage;

    constructor(scene, isOpen) {

        const props = LanguageSelectPanel.getBaseSettings(scene);
        
        super(scene, props.width, props.height, isOpen, { fillStyle: { color: 0x000000, alpha: 0.95 } });
        
        this.availableLanguages = scene.registry.get('availableLanguages') || [];



        const dataRow = props.row;

        this.btns = [];
        this.#mappedBtns = new Map();

        this.availableLanguages.forEach((lang, index) => {

            const labelLang = this.scene.add.text(dataRow.posX1, dataRow.fnPosY(index), `${lang.name}`)
                .setColor('#ffffff')
                .setFontSize(dataRow.fontSize)
                .setFontFamily('Arial')
                .setAlpha(0.7)
                .setOrigin(0, 0.5);
            this.add(labelLang);

            const spriteLang = this.scene.add.sprite(dataRow.posX2, dataRow.fnPosY(index), 'icons', 'toggleON')
                .setScale(dataRow.scale)
                .setInteractive();
            this.add(spriteLang);

            spriteLang.on('pointerdown', () => {
                this.onSwitchLanguage(lang.key);
            });

            this.btns[index] = spriteLang;
            this.#mappedBtns.set(lang.key, spriteLang);
        });
    }

    onSwitchLanguage(language) {
        if (language === this.currentLanguage) return;
        this.currentLanguage = language;
        this.updateButtons();
    }

    updateButtons() {
        for (const [key, btn] of this.#mappedBtns) {
            btn.setTexture('icons', this.getNameTexture(key));
        };
    }

    getNameTexture(value) {
        if (value === this.currentLanguage) return 'toggleON';
        return 'toggleOFF';
    }

    open() {
        this.currentLanguage = this.scene.getLanguage();
        this.updateButtons();
        return super.open();
    }

    close() {

        if (this.currentLanguage !== this.scene.getLanguage()) {
            const dataEvent = {name: 'languagePanel', language: this.currentLanguage};
            this.scene.onChangeLanguage(dataEvent);
        }

        return super.close();
    }

    static getBaseSettings(scene) {

        const length = (scene.registry.get('availableLanguages') || []).length;

        const isLandscape = scene.settingsResize.settingDesk.type === 'LANDSCAPE';
        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';
        
        const scaleGame = isDesktop ? 1.5 : 0.8;//window.devicePixelRatio * scene.scaleGame * (isDesktop ? 2 : 1);

        let width = 600 / scaleGame;
        let height = isLandscape ? scene.scale.height : 100 * length / scaleGame;

        

        return {
            // title: {
            //     posX: width / 2,
            //     posY: 60 / scaleGame,
            //     fontSize: 60 / scaleGame,
            // },
            row: {
                posX1: 60 / scaleGame,
                posX2: 450 / scaleGame,
                fnPosY: (index = 0) => { return (50 + 100 * index) / scaleGame },
                fontSize: 50 / scaleGame,
                scale: 2 / scaleGame
            },
            width: width,
            height: height,
            scaleGame: scaleGame,
        };

    }

    resize() {
        
        const props = LanguageSelectPanel.getBaseSettings(this.scene);

        this.width = props.width;
        this.height = props.height;
        this.scaleGame = props.scaleGame;

        super.resize();

    }

}
