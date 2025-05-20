// @ts-check

import Form from "./Form.js";
import Button from "./Button.js";

export default class LanguageSelectPanel extends Form {

    btns;
    #mappedBtns;
    currentLanguage;

    _scrollData;

    constructor(scene, isOpen) {

        const props = LanguageSelectPanel.getBaseSettings(scene);
        
        super(scene, props.width, props.height, isOpen, { fillStyle: { color: 0x000000, alpha: 0.95 } });
        
        this.availableLanguages = scene.registry.get('availableLanguages') || [];

        const dataRow = props.row;

        this.content = scene.add.container(0, 0);
        this.add(this.content); // добавляем внутрь формы

        this.btns = [];
        this.#mappedBtns = new Map();

        this.availableLanguages.forEach((lang, index) => {

            const labelLang = this.scene.add.text(dataRow.posX1, dataRow.fnPosY(index), `${lang.name}`)
                .setColor('#ffffff')
                .setFontSize(dataRow.fontSize)
                .setFontFamily('Arial')
                .setAlpha(0.7)
                .setOrigin(0, 0.5);
            //this.add(labelLang);

            const spriteLang = this.scene.add.sprite(dataRow.posX2, dataRow.fnPosY(index), 'icons', 'toggleON')
                .setScale(dataRow.scale)
                .setInteractive();
            //this.add(spriteLang);

            spriteLang.on('pointerdown', () => {
                this.onSwitchLanguage(lang.key);
            });

            this.content.add([labelLang, spriteLang]);
            this.btns[index] = spriteLang;
            this.#mappedBtns.set(lang.key, spriteLang);
        });

        this._scrollData = {
            maskRect: null,
            mask: null,
            scrollEnabled: false,
        };

        this.setupMask();
        this.enableScroll();
    }

    destroy() {

        this._scrollData.maskRect?.destroy();
        this._scrollData.maskRect = null;
        this._scrollData.mask = null;

        this.scene.input.off('wheel'); // Удаляем обработчик
        super.destroy?.(); // если в родителе есть destroy
    }

    setupMask() {
        
        if (!this.isOpen) return;

        // Удаляем старую маску, если есть
        if (this._scrollData.maskRect) {
            this._scrollData.maskRect.destroy();
            this._scrollData.maskRect = null;
            this._scrollData.mask = null;
        }

        // Создаём прямоугольник-маску без отрисовки
        const maskRect = this.scene.add.rectangle(this.x, this.y, this.width, this.height, 0x16FF2E)
            .setOrigin(0)
            .setVisible(false); // не отображается, только геометрия

        const mask = maskRect.createGeometryMask();

        this.content.setMask(mask);
        this.content.setPosition(0, 0);

        this._scrollData.maskRect = maskRect;
        this._scrollData.mask = mask;

        // const posXY = this.getPosition(true);
        // this._scrollData.maskRect = this.scene.add.rectangle(posXY.x, posXY.y, this.width, this.height, 0x000000).setOrigin(0.5, 0.5)//.setVisible(false);
        // this._scrollData.mask = this._scrollData.maskRect.createGeometryMask();
        // this.content.setMask(this._scrollData.mask);
        // //maskRect.setPosition(this.x, this.y);
    }

    enableScroll() {
        if (this._scrollData.scrollEnabled) return;
        this._scrollData.scrollEnabled = true;

        const onWheel = (_pointer, _gameObjects, _dx, dy) => {
            this.content.y -= dy;
            this.limitScroll();
        };

        const onPointerDown = (pointer) => {
            const localY = pointer.y - this.container.y;
            if (localY < 0 || localY > this.height) return;
            this._scrollData.dragging = true;
            this._scrollData.startY = pointer.y;
        };

        const onPointerUp = () => {
            this._scrollData.dragging = false;
        };

        const onPointerMove = (pointer) => {
            if (!pointer.isDown || !this._scrollData.dragging) return;

            const delta = pointer.y - this._scrollData.startY;
            this.content.y += delta;
            this._scrollData.startY = pointer.y;
            this.limitScroll();
        };

        // Сохраняем ссылки на обработчики
        this._scrollData.listeners = {
            onWheel, onPointerDown, onPointerUp, onPointerMove
        };

        // Подключаем обработчики событий
        this.scene.input.on('wheel', onWheel);
        this.scene.input.on('pointerdown', onPointerDown);
        this.scene.input.on('pointerup', onPointerUp);
        this.scene.input.on('pointermove', onPointerMove);
    }

    disableScroll() {
        const { onWheel, onPointerDown, onPointerUp, onPointerMove } = this._scrollData.listeners || {};

        // Отключаем обработчики событий
        if (onWheel) this.scene.input.off('wheel', onWheel);
        if (onPointerDown) this.scene.input.off('pointerdown', onPointerDown);
        if (onPointerUp) this.scene.input.off('pointerup', onPointerUp);
        if (onPointerMove) this.scene.input.off('pointermove', onPointerMove);

        // Сбрасываем флаг и очищаем ссылки
        this._scrollData.scrollEnabled = false;
        this._scrollData.listeners = {};
    }


    getContentHeight() {
        let minY = Infinity;
        let maxY = -Infinity;

        this.content.iterate(child => {
            if (!child.getBounds) return;

            const bounds = child.getBounds();
            minY = Math.min(minY, bounds.y);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        return maxY - minY;
    }

    limitScroll() {
        const visibleHeight = this.height;
        const contentHeight = this.getContentHeight(); // вручную посчитали

        const minY = Math.min(visibleHeight - contentHeight, 0);
        const maxY = 0;

        this.content.y = Phaser.Math.Clamp(this.content.y, minY, maxY);
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

        this.disableScroll();
        this.content.setPosition(0, 0);

        if (this.currentLanguage !== this.scene.getLanguage()) {
            const dataEvent = {name: 'languagePanel', language: this.currentLanguage};
            this.scene.onChangeLanguage(dataEvent);
        }

        return super.close();
    }

    onCompleteOpen() {
        this.setupMask();
        this.limitScroll();
        this.enableScroll();
    }

    onCompleteClose() {
        if (this._scrollData.maskRect) {
            this._scrollData.maskRect.destroy();
            this._scrollData.maskRect = null;
            this._scrollData.mask = null;
        }
    }

    static getBaseSettings(scene) {

        const length = (scene.registry.get('availableLanguages') || []).length;

        const isLandscape = scene.settingsResize.settingDesk.type === 'LANDSCAPE';
        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';
        const isPortrait = scene.settingsResize.settingDesk.type === 'PORTRAIT';
        
        const scaleGame = isDesktop ? 1.5 : 0.8;//window.devicePixelRatio * scene.scaleGame * (isDesktop ? 2 : 1);

        let width = 600 / scaleGame;
        var height = isLandscape ? scene.scale.height : 100 * length / scaleGame;
        if (isPortrait && height > scene.scale.height * 3 / 5) {
            height = 190 * 4 / scaleGame; // SettingsPanel
        }
        

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

        this.setupMask();
        this.limitScroll();

    }

}
