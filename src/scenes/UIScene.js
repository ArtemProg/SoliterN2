// @ts-check

import * as constants from "../core/tools/constants.js"
import UIFacade from "./UI/UIFacade.js";
import * as gt from "./tools/generateTexture.js";
import HintPanel from './UI/HintPanel.js';

export default class UIScene extends Phaser.Scene
{
    isThrottled = false;

    scaleGame = 1;

    textFontSize = 0;
    #moves = 0;
    #score = 0;
    #undo = 0;
    #time = 0;
    #statusGame = 0;
    #quantityInStok = 0;

    #ourGame;

    buttonPanel;
    playPanel;

    resultPanel;
    modalWrap;

    settingsResize;

    constructor() {

        super('UIScene');

        this.textFontSize = 30;
        this.#moves = 0;
        this.#score = 0;
        this.#undo = 0;
        this.#time = 0;
        this.#quantityInStok = 0;

        this.sdk = null;
        this.userSettingsManager = null;
        
    }

    init(data) {
        this.sdk = data.sdkProvider;
        this.userSettingsManager = data.userSettingsManager;
        this.settingsResize = data.settingsResize;
    }

    create() {

        this.input.mouse.disableContextMenu();

        const ourGame = this.scene.get('Game');

        this.#ourGame = ourGame;

        this.getScaleGame();
        this.setTextFontSize();

        this.initAdditionalInformation(ourGame);
        
        this.initUIFacade(ourGame);

        this.initResizeGame(ourGame);

        this.initUpdateLocalization(ourGame);
    
    }

    getBestResult() {
        return this.#ourGame.getBestResult();
    }

    getMoves() {
        return this.#moves;
    }

    getTime() {
        return this.#time;
    }

    getScore() {
        return this.#score;
    }

    getQuantityInStok() {
        return this.#quantityInStok;
    }

    getLocalization() {
        return this.#ourGame.managerGame.localization;
    }

    getLanguage() {
        return this.userSettingsManager.language;
    }

    initAdditionalInformation(ourGame) {

        const localization = this.getLocalization();

        const fPosSpotStokXY = () => this.settingsResize.settingDesk.positionSpot.find(item => item.name === 'spotStok').spots[0];

        const labelCount = this.add.text(0, 0, '')
            .setColor('#000000')
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setScale(1 / window.devicePixelRatio)
            .setOrigin(0, 1);

        const fLabelCountResize = () => {
            const posXY = fPosSpotStokXY();
            const isDesktop = this.settingsResize.settingDesk.type === 'DESKTOP';
            
            let textFontSize = 35;
            if (this.settingsResize.settingDesk.type === 'DESKTOP') {
                if (this.settingsResize.parentSize.width < 400) {
                    textFontSize = 18;
                } else if (this.settingsResize.parentSize.width < 450) {
                    textFontSize = 20;
                } else if (this.settingsResize.parentSize.width < 450) {
                    textFontSize = 22;
                } else {
                    textFontSize = 25;
                }
            } else if (this.settingsResize.settingDesk.type === 'PORTRAIN') {
                textFontSize = 40;
            }
            // let textFontSize = Math.round(30 / this.scaleGame);
            // if (this.settingsResize.settingDesk.type === 'DESKTOP') {
            //     textFontSize = Math.round(35 / this.scaleGame);
            // }
            //labelCount.setFontSize(60 / (window.devicePixelRatio * this.scaleGame * _scale));
            //const textFontSize = Math.round((this.textFontSize) / (this.scaleGame));
            
           // const textFontSize = Math.round(this.textFontSize / this.scaleGame);

            //labelCount.setFontSize(textFontSize / this.scaleGame);
            labelCount.setFontSize(textFontSize * window.devicePixelRatio);

            const posX = posXY.x + 5 / this.scaleGame;
            const posY = posXY.y + this.settingsResize.cardGeometry.height - 5 / this.scaleGame;;

            labelCount.setPosition(posX, posY);
        };
        fLabelCountResize();

        const fPosX = (num) => {
                if (num === 1) {
                    return this.settingsResize.settingDesk.activeDesk.start + 10 / this.scaleGame;
                } else if (num === 2) {
                    return this.scale.width / 2;
                } else if (num === 3) {
                    return this.settingsResize.settingDesk.activeDesk.end - 10 / this.scaleGame;
                }
            return 0;
        };
        const fPosY = () => {
            if (this.settingsResize.settingDesk.type === 'PORTRAIT') {
                return this.settingsResize.settingDesk.dashboardHeight * 1.5;
            } else if (this.settingsResize.settingDesk.type === 'LANDSCAPE') {
                return this.settingsResize.settingDesk.dashboardHeight * 0.5;
            }
            return this.settingsResize.settingDesk.dashboardHeight * 0.4;
        };

        const fText = (text) => this.add.text(0, 0, text)
            .setFontStyle('bold')
            .setColor('#ffffff')
            .setFontFamily('Arial')
            .setScale(1 / window.devicePixelRatio);

        const text1 = fText(`${localization.label_score}: 0`).setOrigin(0, 0.5);
        const text2 = fText('00:00').setOrigin(0.5, 0.5);
        const text3 = fText(`${localization.label_moves}: 0`).setOrigin(1, 0.5);

        const panel = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            labels: [text1, text2, text3],
            resize: () => {
                panel.x = this.settingsResize.settingDesk.activeDesk.start;
                panel.width = this.settingsResize.settingDesk.activeDesk.end - this.settingsResize.settingDesk.activeDesk.start;
                panel.height = this.settingsResize.settingDesk.dashboardHeight;
                
                //const textFontSize = Math.round(this.textFontSize / this.scaleGame);
                const textFontSize = Math.round(this.textFontSize * window.devicePixelRatio);
                text1.setFontSize(textFontSize);
                
                let posY = Math.max(fPosY(), text1.height / 2.9);
                // let posY2 = text1.height / 2.2;
                // posY = posY < text1.height / 2 ? text1.height / 2 : posY;
               
                for (let i = 0; i < 3; i++) {
                    panel.labels[i].setFontSize(textFontSize);
                    panel.labels[i].setPosition(fPosX(i + 1), posY);
                }

                fLabelCountResize();
            }
        };
        panel.resize();

        this.resultPanel = panel;

        const scene = this;
        ourGame.events.on('updateValueUI', (data) => {

            const localization = scene.getLocalization();

            const currenStatusGame = this.#statusGame;

            this.#moves = data.moves;
            this.#score = data.score;
            this.#undo = data.undo;
            this.#time = data.time;
            this.#statusGame = data.statusGame;
            this.#quantityInStok = data.quantityInStok;

            text1.setText(`${localization.label_score}: ${this.#score}`);
            text2.setText(this.formatTime(this.#time));
            text3.setText(`${localization.label_moves}: ${this.#moves}`);

            labelCount.setText(`${this.#quantityInStok ? this.#quantityInStok : ''}`);
            
            
            if (currenStatusGame !== data.statusGame) {
                this.uiFacade.gameStatusHasChanged(data.statusGame, currenStatusGame);
            }
            
            this.uiFacade.setUndoButtonPanel(this.#undo);

        }, this);

        this.hintPanel = new HintPanel(this, false)
    }

    isGameRuning() {
        return this.isStatusGameRuning(this.#statusGame);
    }

    isStatusGameRuning(statusGame) {
        return statusGame === constants.STATUS_GAME.READY
            || statusGame === constants.STATUS_GAME.RUNNING
            || statusGame === constants.STATUS_GAME.PAUSE;
    }

    initUIFacade(ourGame) {
        
        this.uiFacade = new UIFacade(this);

        ourGame.events.on('emptyClicked', (data) => {
            
            this.isGameRuning() && this.uiFacade.toggleButtonPanel();

        }, this);

        ourGame.events.on('dragStart', () => {
            this.uiFacade.turnOffInteractiveButtonPanel();
        }, this);
        ourGame.events.on('dragEnd', () => {
            this.uiFacade.turnOnInteractiveButtonPanel();
        }, this);

        ourGame.events.on('hintShowText', (data) => {
            this.hintPanel.showHint(data);
        }, this);
        ourGame.events.on('hintHideText', (data) => {
            this.hintPanel.hideHint(data);
        }, this);

        ourGame.events.on('showAdPanel', (data) => {
            this.uiFacade.openAdPanel();
        }, this);

    }

    onClickMagic(callback) {
        this.events.emit('runCommandMagic', {callback: callback});
    }

    onClickHint(callback) {
        this.events.emit('runCommandHint', {callback: callback, resetIdleTimer: true});
    }

    onClickUndo(callback) {
        this.events.emit('runCommandUndo', {callback: callback});
    }

    onClickNewGame() {
        this.time.delayedCall(200, () => {
            this.events.emit('restartGame', {isNewGame: true});
            this.uiFacade.restartGame();
        });
    }

    onClickReplay() {
        this.time.delayedCall(200, () => {
            this.events.emit('restartGame', {isNewGame: false});
            this.uiFacade.restartGame();
        });
    }

    onClickShowRewardedAd() {
        this.time.delayedCall(100, () => {
            this.events.emit('showRewardedVideo', {});
        });
    }
    
    onChangeLanguage(data) {
        this.events.emit('changeLanguage', data);
    }

    onOpenModalUI(data) {
        this.events.emit('openModalUI', data);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const partInSeconds = seconds % 60;
    
        const minutesStr = this.padNumber(minutes);
        const secondsStr = this.padNumber(partInSeconds);
    
        return `${minutesStr}:${secondsStr}`;
    }

    padNumber(number) {
        return number < 10 ? '0' + number : number.toString();
    }

    getScaleGame() {

        this.scaleGame = this.scale.width > this.scale.height
            ? window.innerWidth / this.scale.width
            : window.innerHeight / this.scale.height;
        
    };

    setTextFontSize() {

        if (this.settingsResize.settingDesk.type === 'DESKTOP') {
            this.textFontSize = 18;
        } else {
            this.textFontSize = 30;
        }

    }

    initResizeGame(ourGame) {

        ourGame.events.on('resizeGame', (settingsResize) => {

            this.settingsResize = settingsResize;

            this.time.delayedCall(1, () => { this.resizeGame(); });
            
        });

        this.resizeGame();
    }

    resizeGame() {

        this.scene.bringToTop();
        this.scene.setActive(true);

        const settingDesk = this.settingsResize.settingDesk;

        this.scale.resize(settingDesk.width, settingDesk.height);
        this.cameras.resize(settingDesk.width, settingDesk.height);

        this.getScaleGame();
        this.setTextFontSize();

        this.resultPanel.resize();
        this.hintPanel.resize();
        this.uiFacade.resize();

    }

    initUpdateLocalization(ourGame) {

        ourGame.events.on('updateLocalization', () => {

            this.time.delayedCall(1, () => { this.updateLocalization(); });
            
        });

        this.resizeGame();
    }

    updateLocalization() {
        const localization = this.getLocalization();
        this.resultPanel.labels[0].setText(`${localization.label_score}: ${this.#score}`);
        this.resultPanel.labels[2].setText(`${localization.label_moves}: ${this.#moves}`);

        this.uiFacade.updateLocalization();
    }

    stopHint() {
        this.#ourGame.stopHint();
    }

    localize(key, params) {
        return this.#ourGame.localize(key, params);
    }

    getTexture(width, height, radius, color) {
        return gt.generateTexture(this, width, height, radius, color);
    }

}