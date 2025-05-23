// @ts-check

import ManagerGame from "../game/ManagerGame.js";
import DataDrag from "../game/DataDrag.js";
import * as SettingDesk from "./tools/SetingDesk.js"
import * as constants from "../core/tools/constants.js"

/** @typedef {import("../game/CardGO.js").default} CardGO */
/** @typedef {import("../game/SpotGO.js").default} SpotGO */

export default class GameScene extends Phaser.Scene {
    
    //#playerData ;

    cardGeometry;
    dragDistanceThreshold;
    percentageEntryThreshold;
    minEntryThreshold;


    /** @type {ManagerGame} */
    managerGame;

    positionsSpots;
    dataSessionJSON;

    constructor() {
        super( { key: 'Game' } );
        this.sdk = null;
        this.userSettingsManager = null;
    }

    init(data) {

        this.sdk = data.sdkProvider;
        this.userSettingsManager = data.userSettingsManager;
        this.cardGeometry = data.cardGeometry;
        this.dataSessionJSON = data.dataSessionJSON;

        this.dragDistanceThreshold = 17;
        this.percentageEntryThreshold = 10;
        this.minEntryThreshold = {
            width: Math.round(this.cardGeometry.width * this.percentageEntryThreshold / 100),
            height: Math.round(this.cardGeometry.height * this.percentageEntryThreshold / 100),
        };

        const settingsResize = this.recalculateScreen();
        this.updateSizeScreen(settingsResize.settingDesk);

        this.scene.launch('UIScene', {
            sdkProvider: this.sdk,
            userSettingsManager: this.userSettingsManager,
            settingsResize: settingsResize
        });

        this.managerGame = new ManagerGame(this, false);
        
        this.managerGame.redrawUIGame(settingsResize);
        
    }

    async create() {

        this.cameras.main.setBackgroundColor(constants.COLOR.BACKGROUND);

        this.managerGame.init(this.positionsSpots);

        this.initDragAndClick();
        this.linkToInterfaceScene();

        await this.managerGame.gameNewOrReset();
        this.managerGame.showAd(false);
        if (this.userSettingsManager.settings.isSaved && this.dataSessionJSON) {
            this.managerGame.loadGameState(this.dataSessionJSON);
        } else {
            await this.managerGame.dealCards();
        }
        this.dataSessionJSON = undefined;
        
        const debounced = (func, ms) => {
            let timeout;
            return function() {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, arguments), ms);
            }
        }

        const fResizeGame = debounced(() => {
            const settingsResize = this.recalculateScreen();
            this.managerGame.resizeGame(settingsResize);
        }, 100);


        window.addEventListener('resize', () => {
            
            if (this.managerGame.isInterstitialAdVisible() || this.managerGame.isRewardedAdActive()) return;

            fResizeGame();
            
        });

        window.addEventListener('beforeunload', (e) => {

            console.log('beforeunload');

            // this.saveGameState();

        });

        window.addEventListener('unload', () => {
            
            console.log('unload');
            
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // Страница скрыта, можно сохранить состояние
                console.log('visibilitychange - hidden');

                this.stopHint();
                this.managerGame.putOnPause();
                this.saveGameState();

            } else if (document.visibilityState === 'visible') {
                // Страница снова видима, можно восстановить состояние
                console.log('visibilitychange - visible');
            }
        });

        window.addEventListener('beforeunload', () => {
            this.stopHint();
            this.managerGame.putOnPause();
            this.saveGameState();
        });

        this.managerGame.gameIsLoaded();

    }

    saveGameState() {
        this.managerGame.saveGameState();
    }

    linkToInterfaceScene() {

        const ourUIScene = this.scene.get('UIScene');

        ourUIScene.events.on('runCommandUndo', (data) => {
            
            this.resetIdleTimer();
            this.managerGame.runCommandUndo(data);

        }, this);

        ourUIScene.events.on('restartGame', async (data) => {
            
            this.resetIdleTimer();
            await this.managerGame.gameNewOrReset(data.isNewGame);
            await await this.managerGame.showAd(false);
            await this.managerGame.dealCards();
            
            //this.managerGame.startGame();
            
 
        }, this);

        ourUIScene.events.on('runCommandMagic', (data) => {
            
            this.resetIdleTimer();
            this.managerGame.runCommandMagic(data);
 
        }, this);

        ourUIScene.events.on('runCommandHint', (data) => {
            
            this.resetIdleTimer();
            this.managerGame.runCommandHint(data);
 
        }, this);

        ourUIScene.events.on('openModalUI', (data) => {
        
            this.resetIdleTimer();
            this.managerGame.handleOpeningModalUI(data);

        }, this);

        ourUIScene.events.on('showRewardedVideo', (data) => {
        
            this.resetIdleTimer();
            this.managerGame.showRewardedVideo(data);

        }, this);

        ourUIScene.events.on('changeLanguage', async (data) => {
            
            await this.managerGame.changeLanguage(data);
 
        }, this);

    }

    initDragAndClick() {

        const dataPointerdown = {
            wasClicked: false,
            wasDragged: false,
            isHandler: false,
            asyncOperationPromise: undefined,
            currentlyOver: [],
        };
        this.isDragging = false;
        this.startPoint = new Phaser.Math.Vector2();

        const range = {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        };

        /** @type {DataDrag}  */
        let dataDrag;

        this.input.dragDistanceThreshold = this.dragDistanceThreshold;

        this.input.on('dragstart',
            /** 
             * @param {Phaser.Input.Pointer} pointer
             * @param {CardGO} gameObject
            */
            async (pointer, gameObject) => { 

                this.resetIdleTimer();

                if (!this.managerGame.isGameRuning()) return;

                dataPointerdown.wasDragged = true;
            
            if (dataDrag?.isActive || dataDrag?.isEnd) {
                return;
            }

            range.maxX = this.scale.width - this.cardGeometry.width;
            range.maxY = this.scale.height - this.cardGeometry.height;

            dataDrag = new DataDrag();

            await this.managerGame.onDragStart(pointer, gameObject, dataDrag);

        });

        this.input.on('drag',
            /** 
             * @param {Phaser.Input.Pointer} pointer
             * @param {CardGO} gameObject
             * @param {number} dragX
             * @param {number} dragY
            */
            async (pointer, gameObject, dragX, dragY) => {

            this.resetIdleTimer();

            if (!this.managerGame.isGameRuning()) return;
                
            // Предпологаемый центр карты с учетом границ экрана
            const x = Math.round(Phaser.Math.Clamp(dragX, range.minX, range.maxX));
            const y = Math.round(Phaser.Math.Clamp(dragY, range.minY, range.maxY));

            await this.managerGame.onDrag(pointer, gameObject, dataDrag, {x, y});

        });

        this.input.on('dragend',
            /** 
             * @param {Phaser.Input.Pointer} pointer
             * @param {CardGO} gameObject
            */
            async (pointer, gameObject) => { 

            this.resetIdleTimer();

            if (!this.managerGame.isGameRuning()) return;

            await this.managerGame.onDragEnd(pointer, gameObject, dataDrag);

        });

        //-------------------------

        const dataClicked = {
            gameObject: undefined
        };

        let isThrottled = false;

        this.input.on("gameobjectdown",
            /** 
             * @param {Phaser.Input.Pointer} pointer
             * @param {CardGO|SpotGO} gameObject
             * @param {Phaser.Types.Input.EventData} event
            */
            async (pointer, gameObject, event) => {

            this.unlockSound();
            this.resetIdleTimer();

            if (!this.managerGame.isGameRuning()) return;

            dataPointerdown.wasDragged = false;

            await this.managerGame.gameobjectdown(pointer, gameObject, dataClicked);

        }, this);

        const handleMove = (pointer) => {

            if (this.startPoint.distance(new Phaser.Math.Vector2(pointer.x, pointer.y)) > this.dragDistanceThreshold) {
                this.isDragging = true;
            }

        };

        this.input.on('pointerdown', (pointer, currentlyOver) => {
            
            this.unlockSound();
            this.resetIdleTimer();

            if (!this.managerGame.isGameRuning()) return;

            dataPointerdown.wasClicked = false;
            dataPointerdown.isHandler = false;
            dataPointerdown.wasDragged = false;
            dataPointerdown.asyncOperationPromise = undefined;
            dataPointerdown.currentlyOver = [...currentlyOver];

            //this.managerGame.pointerdown();

            this.isDragging = false;
            this.startPoint.set(pointer.x, pointer.y);

            this.input.on('pointermove', handleMove, this);

        });

        // this.input.on('pointermove', (pointer) => {
        //     if (this.startPoint.distance(new Phaser.Math.Vector2(pointer.x, pointer.y)) > this.dragDistanceThreshold) {
        //         this.isDragging = true;
        //     }
        // });

        this.input.on("gameobjectup", 
            /** 
             * @param {Phaser.Input.Pointer} pointer
             * @param {CardGO|SpotGO} gameObject
             * @param {Phaser.Types.Input.EventData} event
            */
            async (pointer, gameObject, event) => {

            this.resetIdleTimer();

            if (!this.managerGame.isGameRuning()) return;

            dataPointerdown.wasClicked = false;
            if (gameObject == dataClicked.gameObject) {
                
                if (dataPointerdown.wasDragged) {

                    if (pointer.getDistance() > this.dragDistanceThreshold) {
                        if (dataPointerdown.wasDragged && pointer.getDistance() < this.dragDistanceThreshold + 10) {
                            dataPointerdown.wasClicked =  "isOpen" in gameObject ? !gameObject.isOpen : false;
                        }
                    }

                } else {
                    dataPointerdown.wasClicked = true;
                }

            }
            
            if (dataPointerdown.wasClicked) {

                if (isThrottled) {

                    return;
                }

                isThrottled = true;

                dataPointerdown.asyncOperationPromise = new Promise(async (resolve) => {
                    dataPointerdown.isHandler = await this.managerGame.gameobjectup(pointer, gameObject, dataClicked);
                    resolve(dataPointerdown.isHandler);
                });
                

                setTimeout(function() {
                    isThrottled = false;
                    }, 110);
            }
            
            dataClicked.gameObject = undefined;


        }, this);

        this.input.on('pointerup', async (pointer, currentlyOver) => {

            this.resetIdleTimer();

            // Deactivate move listener when the pointer is released
            this.input.off('pointermove', handleMove, this);
            
            if (!this.managerGame.isGameRuning()) return;

            if (dataPointerdown.asyncOperationPromise) {
                await dataPointerdown.asyncOperationPromise;
                dataPointerdown.asyncOperationPromise = undefined;
            }

            if (dataPointerdown.isHandler) {
                this.managerGame.showAd();
                return;
            } if (dataPointerdown.wasDragged && !dataPointerdown.wasClicked) {
                return;
            }
            this.managerGame.onEmptyClicked(pointer, dataPointerdown.currentlyOver, currentlyOver, dataPointerdown.wasClicked && !dataPointerdown.wasDragged);
            
        });
        
    }

    unlockSound() {
        if (this.sound.locked) {
            console.log(this.sound.unlock(), this.sound.locked);
        }
    }

    recalculateScreen() {

        const parentSize = {
            width: window.innerWidth,
            height: window.innerHeight,
            aspectRatio: window.innerHeight / window.innerWidth,
        };

        let settingDesk;
        if (this.game.device.os.desktop) {
            settingDesk = SettingDesk.myScaleApp_DESKTOP(this.cardGeometry, parentSize);
        } else if (parentSize.width > parentSize.height) {
            settingDesk = SettingDesk.myScaleApp_LANDSCAPE(this.cardGeometry, parentSize);
        } else {
            settingDesk = SettingDesk.myScaleApp_PORTRAIT(this.cardGeometry, parentSize);
        }

        return {
            parentSize: parentSize,
            settingDesk: settingDesk,
            isDesktop: this.game.device.os.desktop,
            cardGeometry: this.cardGeometry,
        };
    }

    updateSizeScreen(settingDesk) {
        this.positionsSpots = settingDesk.positionSpot;

        this.scale.resize(settingDesk.width, settingDesk.height);
        this.cameras.resize(settingDesk.width, settingDesk.height);
        this.scale.setGameSize(settingDesk.width, settingDesk.height);
    }

    getScaleGame() {
        return this.scale.width > this.scale.height ? window.innerWidth / this.scale.width : window.innerHeight / this.scale.height;
    }

    stopHint() {
        this.managerGame.stopHint();
    }

    getBestResult() {
        return this.managerGame.getBestResult();
    }

    localize(key, params) {
        return this.managerGame.localize(key, params);
    }

    resetIdleTimer() {
        this.managerGame.resetIdleTimer();
    }

}