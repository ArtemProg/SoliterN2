// @ts-check

import Croupier from "../core/Croupier.js";
import {STATUS_GAME, COLOR} from "../core/tools/constants.js";
import SpotGO from "./SpotGO.js";
import CardGO from "./CardGO.js";
import FoundationsSpotGO from "./FoundationsSpotGO.js";
import PileSpotGO from "./PileSpotGO.js";
import StokSpotGO from "./StokSpotGO.js";
import WasteSpotGO from "./WasteSpotGO.js";
import CommandCard from "../core/CommandCard.js";
import CommandHistory from "../core/CommandHistory.js"
import SoundGame from "./SoundGame.js";
import { generateTexture } from "../scenes/tools/generateTexture.js";

/** @typedef {import("../scenes/GameScene.js").default} GameScene */
/** @typedef {import("../core/Card.js").default} Card */
/** @typedef {import("../core/Spot.js").default} Spot */
/** @typedef {import("./DataDrag.js").default} DataDrag */

/** 
 * @typedef {object} availableSpot
 * @property {Spot} spot
 * @property {object} square
 * @property {number} square.width
 * @property {number} square.height
 * @property {number} square.value
 * @property {object} data
 * @property {Card} data.lastCard
 * @property {Card[]} data.cards
 * @property {boolean} data.isAvailable
*/

/** 
 * @typedef {object} availableSpotGO
 * @property {SpotGO} spotGO
 * @property {object} geometryIntersection
 * @property {number} geometryIntersection.x
 * @property {number} geometryIntersection.y
 * @property {number} geometryIntersection.width
 * @property {number} geometryIntersection.height
 * @property {object} data
 * @property {Card} data.lastCard
 * @property {Card[]} data.cards
 * @property {boolean} data.isAvailable
*/

export default class ManagerGame {

    /** @type {Boolean} */
    #notifyUI = false;

    /** @type {Boolean} */
    #debugMode = false;

    /** @type {Boolean} */
    #initialized = false;

    #settingsResize;
    
    /** @type {GameScene} */
    #scene;

    /** @type {Croupier} */
    #croupier;

    /** @type {CommandHistory} */
    #commandHistory;

    /** @type {SoundGame} */
    #sound;

    /** @type {number} */
    #numberOfMoves = 0;
    /** @type {number} */
    #numberOfScore = 0;

    /** @type {CardGO[]} */
    #cardsGO = [];
    /** @type {SpotGO} */
    spotStok;
    /** @type {SpotGO} */
    spotWaste;
    /** @type {SpotGO[]} */
    spotsPile = [];
    /** @type {SpotGO[]} */
    spotsFoundations = [];

   /** @type {Phaser.GameObjects.Sprite[]} */
   spriteCardsHint = [];
   /** @type {Phaser.GameObjects.Container} */
   containerHint;

    /** @type {Map<Card, CardGO>} */
    #mappedCards = new Map();

    /** @type {Map<Spot, SpotGO>} */
    #mappedSpots = new Map();

    //** @type {Phaser.GameObjects.Container} */
    //#containerDrag;

    #commandIsRunning = false;

    #statusGame = 0;
    #currentDurationOfAnimation = 0;

    startTime;
    reusableTimerEvent;
    /** @type {number} */
    #numberOfTime = 0;

    /** @type {number} */
    #numberOfMagic = 0;

    idleTime;

    localization;

    get numberOfMoves() {
        return this.#numberOfMoves;
    }

    set numberOfMoves(value) {
        this.#numberOfMoves = value;
        this.#notifyUI = true;
    }

    get numberOfScore() {
        return this.#numberOfScore;
    }

    set numberOfScore(value) {
        this.#numberOfScore = value;
        this.#notifyUI = true;
    }

    get numberOfTime() {
        return this.#numberOfTime;
    }

    set numberOfTime(value) {
        this.#numberOfTime = value;
        this.#notifyUI = true;
    }

    get numberOfMagic() {
        return this.#numberOfMagic;
    }

    set numberOfMagic(value) {
        this.#numberOfMagic = value;
        this.#notifyUI = true;
    }
    
    get statusGame() {
        return this.#statusGame;
    }

    set statusGame(value) {
        this.#statusGame = value;
        this.#notifyUI = true;
        this.updateValueUI();
    }

    get currentDurationOfAnimation() {
        return this.#currentDurationOfAnimation;
    }

    set currentDurationOfAnimation(value) {
        this.#currentDurationOfAnimation = value;
    }

    constructor(scene, debugMode) {

        this.#scene = scene;
        this.#debugMode = debugMode;
        this.#initialized = false;

        this.sdk = scene.sdk;
        this.userSettingsManager = scene.userSettingsManager;

        this.localization = scene.cache.json.get('localization');

    }

    init(positions) {
        
        if (this.#initialized) {
            return;
        }

        this.#croupier = new Croupier();
        this.#sound = new SoundGame(this.#scene, this);
        this.#commandHistory = new CommandHistory();

        this.userSettingsManager.addObserver(this);

        this.createSpots(positions);
        this.createCards();
        this.initHints();
        this.initIdleTime();
        this.initTimer();
        this.#initialized = true;

    }

    get debugMode() {
        return this.#debugMode;
    }

    createSpots(positions) {

        const spots = this.#croupier.spots;

        for(let s of positions) {
            
            for (let i = 0; i < s.spots.length; i++) {

                const isArray = Array.isArray(spots[s.name]);
                
                /** @type {Spot} */
                const spot = isArray ? spots[s.name][i] : spots[s.name];

                let ManagerGO = s.name.includes('Foundations') ? FoundationsSpotGO : s.name.includes('Pile') ? PileSpotGO : SpotGO;

                if (s.name.includes('Foundations')) {
                    ManagerGO = FoundationsSpotGO;
                } else if (s.name.includes('Pile')) {
                    ManagerGO = PileSpotGO;
                } else if (s.name.includes('Stok')) {
                    ManagerGO = StokSpotGO;
                } else if (s.name.includes('Waste')) {
                    ManagerGO = WasteSpotGO;
                } else {
                    ManagerGO = SpotGO;
                }
                
                const spotGO = new ManagerGO(
                    this.#scene,
                    s.spots[i].x,
                    s.spots[i].y,
                    spot
                );

                if (isArray) {
                    this[`${s.name}`].push(spotGO);
                } else {
                    this[`${s.name}`] = spotGO;
                }

                this.#mappedSpots.set(spot, spotGO);

            }
            
        }
        

    }

    createCards() {

        for (let card of this.#croupier.packOfCards) {
            let cardGO = new CardGO(this.#scene, card, this.spotStok.x, this.spotStok.y);
            
            this.#cardsGO.push(cardGO);
            this.#mappedCards.set(card, cardGO);
        }

        /*
        const graphics = this.add.graphics({ fillStyle: { color: 0x2266aa } });
        const point3 = new Phaser.Geom.Point(600, 600);
        graphics.fillPointShape(point3, 5);
        */
    }
    
    redrawUIGame(settingsResize) {

        this.#settingsResize = settingsResize;
        this.#scene.events.emit('resizeGame', settingsResize);

    }

    redrawDeskGame(positions) {

        for(let s of positions) {
            
            const isArr = s.spots.length > 1;
           
            const name = s.name.slice(isArr ? 5: 4);

            for (let i = 0; i < s.spots.length; i++) {
                
                const spot = this.#croupier.nameToSpot(isArr ? `${name}${i + 1}` : name);

                const spotGO = this.#mappedSpots.get(spot);

                spotGO.setPosition(s.spots[i].x, s.spots[i].y);
                spotGO.resize();

                if (spot.isEmpty()) {
                    continue;
                }
                
                let x = spotGO.x;
                let y = spotGO.y; 

                if (spotGO instanceof PileSpotGO) {
                    let posY = y;
                    for (const card of spot.cards) {
                        this.#mappedCards.get(card).setPosition(x, posY);
                        posY += card.isOpen 
                            ? this.#scene.cardGeometry.offsetOpenCardY
                            : this.#scene.cardGeometry.offsetCloseCardY;
                    }

                } else {
                    for (const card of spot.cards) {
                        this.#mappedCards.get(card).setPosition(x, y);
                    }
                }

                

                if (spotGO instanceof WasteSpotGO) {

                    let deltaX = 0;
                    for (const card of spot.cards.slice(-3)) {
                        this.#mappedCards.get(card).setPosition(x + deltaX, y);
                        deltaX += this.#scene.cardGeometry.offsetOpenCardX;
                    }
                }

            }
            
        }
        
    }

    readBestResult() {
        this.bestrResult = {
            score: this.userSettingsManager.settings.bestScore,
            time: this.userSettingsManager.settings.bestTime,
            moves: this.userSettingsManager.settings.bestMoves,
        };
    }

    getBestResult() {
        if (!this.bestrResult) {
            this.readBestResult();
        }
        return this.bestrResult;
    }

    async gameNewOrReset(isNewGame = true) {

        this.readBestResult();

        this.statusGame = STATUS_GAME.RESET_START;
        this.currentDurationOfAnimation = 150;
        
        this.reusableTimerEvent.resetTimer();
        this.reusableTimerEvent.pauseTimer();

        this.#commandHistory.clear();

        this.numberOfMoves = 0;
        this.numberOfScore = 0;
        this.numberOfMagic = 2;
        
        this.#croupier.mixAndTransferToSpotStok(isNewGame);

        [this.spotStok, this.spotWaste, ...this.spotsFoundations, ...this.spotsPile].forEach(spotGO => {
            spotGO.updateText();
            spotGO.setVisible(true);
        });

        this.#croupier.spotStok.cards
            .map(card => this.#mappedCards.get(card))
            .forEach(cardGO => {
                cardGO.visible = false;
                cardGO.setPosition(this.spotStok.x, this.spotStok.y);
                cardGO.setScaleImage(1, 1);
                cardGO.setImageClose();
                this.#scene.input.setDraggable(cardGO, false);
                this.#scene.children.bringToTop(cardGO);
            });

        this.updateValueUI();
        
        this.statusGame = STATUS_GAME.RESET_END;

    }

    async dealCards() {

        this.statusGame = STATUS_GAME.DEAL;

        const cardsGO = this.#croupier.spotStok.cards.map(card => this.#mappedCards.get(card));
        
        cardsGO.forEach(cardGO => cardGO.visible = true);

        let currentIndex = this.#cardsGO.length;
        let maxIndex = currentIndex - 1;

        const moveToCardsGO = [];

        for (let i = 0; i < 7; i++) {
            const spotGO = this.spotsPile[i];
            for (let j = 0; j <= i; j++) {
                currentIndex--;
                moveToCardsGO.push({
                    cardGO: cardsGO[currentIndex],
                    spotGO: spotGO,
                    x: spotGO.x,
                    y: spotGO.y + j * this.#scene.cardGeometry.offsetCloseCardY,
                    delay: (maxIndex - currentIndex) * 15,
                    open: i === j,
                });

            }
        }
       
        this.#sound.deal();

        const promises = [];
        for (const str of moveToCardsGO) {

            this.#moveCardCore(str.spotGO, str.cardGO);

            const promise = new Promise((resolve, reject) => {

                this.#scene.tweens.add({
                    targets: str.cardGO,
                    x: str.x,
                    y: str.y,
                    ease: 'Quint.out',
                    duration: 230,
                    delay: str.delay,
                    onStart: () => {
                        this.#scene.children.bringToTop(str.cardGO);
                    },
                    
                    onComplete: () => {
                        // @ts-ignore
                        if (str.open) {
                            str.cardGO.flip(true, () => {
                                this.#setOpenCard(str.cardGO);
                                this.#scene.input.setDraggable(str.cardGO, true);
                                resolve();
                            }, 100, 10);
                        } else {
                            resolve();
                        }
                    }
                });

            });
            promises.push(promise);
        }
        
        await Promise.all(promises);

        [this.spotStok, this.spotWaste, ...this.spotsFoundations, ...this.spotsPile].forEach(spotGO => spotGO.updateText());
        
        this.statusGame = STATUS_GAME.READY;
    }

    async dealCards2() {

        const posX = this.#scene.scale.width / 2 - this.#scene.cardGeometry.width;
        const posY = this.#scene.scale.height + this.#scene.cardGeometry.height / 2;

        let cardsToMove = [];
        const cards = this.#croupier.spotStok.cards;
        const cardsGO = cards.map(card => this.#mappedCards.get(card));

        let currentIndex = this.#cardsGO.length;
        let maxIndex = currentIndex - 1;

        const moveToCardsGO = [];
        const f = (i, j, posY2) => {
            currentIndex--;
            moveToCardsGO.push({
                cardGO: cardsGO[currentIndex],
                spotGO: this.spotsPile[j],
                x: this.spotsPile[j].x,
                y: posY2,
                delay: (maxIndex - currentIndex) * 17,
                open: i === j,
            });
        };

        for (let i = 0; i < 7; i++) {
            const posY2 = this.spotsPile[0].y + i * this.#scene.cardGeometry.offsetCloseCardY;
            if ((i + 1) % 2 !== 0) {
                for (let j = i; j < 7; j++) {
                    f(i, j, posY2);
                }
            } else {
                for (let j = 6; j >= i; j--) {
                    f(i, j, posY2);
                }
            }
        }

        let delay = moveToCardsGO[moveToCardsGO.length - 1].delay + 2;
        for (let i = maxIndex; currentIndex > 0; i--) {
            currentIndex--;
            moveToCardsGO[i] = {
                cardGO: cardsGO[currentIndex],
                spotGO: this.spotStok,
                x: this.spotStok.x,
                y: this.spotStok.y,
                delay: delay + (maxIndex - currentIndex) * 10,
            };
        }

       
        this.#sound.deal();

        const promises = [];
        for (const str of moveToCardsGO) {

            str.cardGO.visible = true;
            str.cardGO.setPosition(posX, posY);

            this.#scene.children.bringToTop(str.cardGO);
            this.#moveCardCore(str.spotGO, str.cardGO);

            const promise = new Promise((resolve, reject) => {

                this.#scene.tweens.add({
                    targets: str.cardGO,
                    x: str.x,
                    y: str.y,
                    ease: 'Quint.out',
                    duration: 350,
                    delay: str.delay,
                    onComplete: () => {
                        // @ts-ignore
                        if (str.open) {
                            str.cardGO.flip(true, () => {
                                this.#setOpenCard(str.cardGO);
                                this.#scene.input.setDraggable(str.cardGO, true);
                                resolve();
                            }, 100, 10);
                        } else {
                            resolve();
                        }
                    }
                });

            });
            promises.push(promise);
        }
        
        await Promise.all(promises);

        [this.spotStok, this.spotWaste, ...this.spotsFoundations, ...this.spotsPile].forEach(spotGO => spotGO.updateText());
        
    }

    dealCards1() {

        let cardsToMove = [];
        const cards = this.#croupier.spotStok.cards;

        let currentIndex = this.#cardsGO.length;
        for (let numberOfCards = 1; numberOfCards <= this.spotsPile.length; numberOfCards++) {
            currentIndex -= numberOfCards;
            cardsToMove.push({
                spotGO: this.spotsPile[numberOfCards - 1],
                cardsGO: cards
                    .slice(currentIndex, currentIndex + numberOfCards)
                    .map(card => this.#mappedCards.get(card))
                    .reverse(),
            });
        }

        const scene = this.#scene;
        const mngr = this;
        for (let str of cardsToMove) {

            const lastCardGO = str.cardsGO[str.cardsGO.length - 1];

            const posX = str.spotGO.x;
            const posY = str.spotGO.y;
            let deltaY = 0;
            for (const cardGO of str.cardsGO) {
                
                this.#moveCardCore(str.spotGO, cardGO);

                this.#scene.children.bringToTop(cardGO);

                scene.tweens.add({
                    targets: cardGO,
                    x: posX,
                    y: posY + deltaY,
                    ease: 'Linear',
                    duration: 750,
                    onComplete: () => {
                        if (lastCardGO == cardGO) {
                            cardGO.flip(true, () => {
                                mngr.#setOpenCard(cardGO);
                                scene.input.setDraggable(cardGO, true);
                            }, 100);
                        }
                    }
                });

                deltaY += this.#scene.cardGeometry.offsetCloseCardY;

            }

            str.spotGO.updateText();
  
        }
        
        this.spotStok.updateText();
        
    }

    initIdleTime() {

        const isAutoHints = () => this.#scene.userSettingsManager.settings.autoHints;

        const idleTime = {
            time: 0,
            schedule: [
                {
                    name: 'show hint',
                    time: 15000,
                    loop: true,
                    delay: 15000,
                    callback: (item) => {
                        if (this.statusGame !== STATUS_GAME.RUNNING || !isAutoHints()) return;
                        console.info("Показать подсказку");
                        const data = {
                            displayText: false,
                            onlyFirst: true,
                        };
                        this.runCommandHint(data);
                    },
                    isCompleted: false,
                },
                {
                    name: 'pause',
                    time: 120000,
                    loop: false,
                    callback: (item) => {
                        console.info("Пауза игры");
                        if (this.statusGame !== STATUS_GAME.RUNNING) return;
                        this.statusGame = STATUS_GAME.PAUSE;
                        this.reusableTimerEvent.pauseTimer();
                        try {
                            this.sdk.showInterstitialAd();
                        } catch (error) {
                            console.error('Error when displaying ads:', error.message);
                        }
                    },
                    isCompleted: false,
                }
            ],
            checkSchedule: () => {
                if (this.statusGame !== STATUS_GAME.RUNNING) return;
                idleTime.time += 1000;
                for (const item of idleTime.schedule) {
                    if (item.isCompleted) {
                        if (!item.loop) continue;
                        item.time += item.delay;
                        item.isCompleted = false;
                    };
                    if (idleTime.time >= item.time) {
                        item.callback(item);
                        item.isCompleted = true;
                    }
                }
            },
            reset: () => {
                idleTime.time = 0;
                idleTime.schedule.forEach(item => {
                    item.isCompleted = false;
                    if (item.loop) {
                        item.time = item.delay;
                    }
                });
            }

        };

        this.idleTime = idleTime;
    }

    initTimer() {
        
        this.startTime = this.#scene.time.now;
        this.totalPausedTime = 0;
        this.lastPauseTime = 0;

        const manager = this;

        const updateTimer = () => {
            const currentTime = manager.#scene.time.now;
            const effectiveTime = currentTime - manager.startTime - manager.totalPausedTime;
            manager.numberOfTime = Math.floor(effectiveTime / 1000);
            manager.updateValueUI();
            manager.idleTime.checkSchedule();
        };
        
        const timerEvent = this.#scene.time.addEvent({
            delay: 1000,
            callback: updateTimer,
            callbackScope: manager,
            loop: true,
            paused: true,
        });

        this.reusableTimerEvent = {
            timer: timerEvent,
            pauseTimer: () => {
                manager.idleTime.reset();
                if (!timerEvent.paused) {
                    manager.lastPauseTime = manager.#scene.time.now;
                    timerEvent.paused = true;
                }
            },
            resumeTimer: () => {
                manager.idleTime.reset();
                if (timerEvent.paused) {
                    manager.totalPausedTime += manager.#scene.time.now - manager.lastPauseTime;
                    timerEvent.paused = false;
                }
            },
            resetTimer: () => {
                manager.idleTime.reset();
                timerEvent.paused = true;
                manager.startTime = manager.#scene.time.now;
                manager.totalPausedTime = 0;
                manager.lastPauseTime = 0;
                timerEvent.paused = false;
                manager.numberOfTime = 0;
                manager.updateValueUI();
            },
            getTime: () => {
                const curretTime = manager.#scene.time.now;
                const totalPausedTime = manager.totalPausedTime + (timerEvent.paused ? curretTime - manager.lastPauseTime : 0);
                return curretTime - manager.startTime - totalPausedTime;
            }
        };

    }

    startGame() {
        this.statusGame = STATUS_GAME.STARTING;
        
        this.reusableTimerEvent.resetTimer();
        this.reusableTimerEvent.resumeTimer();

        this.statusGame = STATUS_GAME.RUNNING;
    }

    gameIsOver() {

        this.reusableTimerEvent.pauseTimer();

        this.statusGame = STATUS_GAME.COMPLETED;

        [this.spotStok, this.spotWaste, ...this.spotsFoundations, ...this.spotsPile].forEach(spotGO => spotGO.setVisible(false));

        this.userSettingsManager.updateBestScore(this.numberOfScore);
        this.userSettingsManager.updateBestMoves(this.numberOfMoves);
        this.userSettingsManager.updateBestTime(this.numberOfTime);
        this.userSettingsManager.incrementGamesCompleted();
        this.userSettingsManager.setSaveState(0);
        this.userSettingsManager.saveSettings();

    }

    /**
     * @param {SpotGO} spotGO 
     * @param {CardGO} cardGO 
     */
    #moveCardCore(spotGO, cardGO) {
        /*
        if (this.#debugMode) {

            const currentSpotGO = this.#mappedSpots.get(this.#croupier.cardLocation(cardGO.value));
            this.#croupier.moveCard(spotGO.value, cardGO.value);
            currentSpotGO.updateText();
            spotGO.updateText();

        } else {
            this.#croupier.moveCard(spotGO.value, cardGO.value);
        }
        */
        this.#croupier.moveCard(spotGO.value, cardGO.value);
    }

    /**
     * @param {CardGO} cardGO 
     */
    #setOpenCard(cardGO) {
        this.#croupier.openCard(cardGO.value);
    }

    #setCloseCard(cardGO) {
        this.#croupier.closeCard(cardGO.value);
    }

    gameobjectdown(pointer, gameObject, dataClicked) {
        
        if (!this.checkStatusGameAndRunGame()) {
            return;
        }

        this.stopHint();

        if (gameObject instanceof CardGO || gameObject instanceof SpotGO) {
            dataClicked.gameObject = gameObject;
        } else {
            dataClicked.gameObject = undefined;
        }
        
    }

    async gameobjectup(pointer, gameObject, dataClicked) {
        
        if (!this.isGameRuning()) return false;

        if (this.#commandIsRunning) {
            return false;
        }

        if (gameObject instanceof CardGO) {
            return await this.onCardClicked(pointer, gameObject);
        } else if (gameObject instanceof SpotGO) {
            return await this.onSpotClicked(pointer, gameObject);
        }
        
        return false;
    }

    onEmptyClicked(pointer, gameObjects1, gameObjects2, wasClicked) {

        this.stopHint();

        if (gameObjects1.length > 0) {
            if (gameObjects1[0] instanceof CardGO) {
                const cardGO = gameObjects1[0];
                const spot = this.#croupier.cardLocation(cardGO.value);
                const spotGO = this.#mappedSpots.get(spot);
                if (spotGO === this.spotStok) {
                    return;
                } else if (spotGO instanceof PileSpotGO && cardGO.isOpen && cardGO === gameObjects2[0] && wasClicked) {
                    return;
                }
            } else  if (gameObjects1[0]  instanceof SpotGO) {
                if (gameObjects1[0]  === this.spotStok) {
                    return;
                }
            }
        }

        this.#scene.events.emit('emptyClicked');

    }

    checkStatusGameAndRunGame() {

        if (this.statusGame === STATUS_GAME.RUNNING) {
            return true;
        } if (this.statusGame === STATUS_GAME.READY) {
            this.startGame();
            return true;
        } if (this.statusGame === STATUS_GAME.PAUSE) {
            this.statusGame = STATUS_GAME.RUNNING;
            this.reusableTimerEvent.resumeTimer();
            return true;
        }
        return false;
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     * @param {CardGO} cardGO 
     */
    async onCardClicked(pointer, cardGO) {

        const currentSpot = this.#croupier.cardLocation(cardGO.value);
        const currentSpotGO = this.#mappedSpots.get(currentSpot);

        if(cardGO.isOpen) {
            
            if (currentSpotGO instanceof WasteSpotGO && currentSpot.lastCard() !== cardGO.value) {
                return false;
            }
            
            await this.makeStepCardAutomatically(cardGO);

            return true;

        }
        
        if (currentSpot.lastCard() !== cardGO.value) {
            return false;
        }
        
        if (currentSpotGO instanceof PileSpotGO) {
            
            // Команда открытия карты
            const commad = new CommandCard(
                this,
                'openCard',
                [cardGO.value],
                currentSpot,
                currentSpot);
            await this.executeCommands([commad]);

        } else if (currentSpotGO instanceof FoundationsSpotGO) {
            // We are not doing anything
        } else if (currentSpotGO instanceof WasteSpotGO) {
            // Automatic transfer of the card to a valid spot
        } else if (currentSpotGO instanceof StokSpotGO) {
            // Turn the card over and transfer it to WasteSpotGO

            // Команда открытия и перемещения карты
            const commad = new CommandCard(
                this,
                'moveCardFromStokToWaste',
                [cardGO.value],
                this.spotStok.value,
                this.spotWaste.value);
            await this.executeCommands([commad]);
            this.addMoves();
        }

        this.updateValueUI();

        return true;
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     * @param {SpotGO} spotGO 
     */
    async onSpotClicked(pointer, spotGO) {
        
        if (spotGO instanceof StokSpotGO) {

            if (this.spotStok.isEmpty() && !this.spotWaste.isEmpty()) {

                // Переносим всю пачку карт обратно
                const commad = new CommandCard(
                    this,
                    'moveCardsFromWasteToStok',
                    undefined,
                    undefined,
                    undefined);
                await this.executeCommands([commad]);
                this.addMoves();

                this.updateValueUI();
                
                return true;
            }
        }

        return false;
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     * @param {CardGO} cardGO 
     * @param {DataDrag} dataDrag
     */
    onDragStart(pointer, cardGO, dataDrag) {

        if (!this.isGameRuning()) return;

        // if (cardGO.parentContainer) {
        //     return;
        // }

        if (this.#commandIsRunning) {
            return;
        }

        // 1. Запрашиваем разрешение на перемещение
        // - карта открыта
        // - она первая
        // - если не первая то она находится в spotsPile
        //   (в spotWaste допустимо отображение до 3-х карт)
        
        const currentSpot = this.#croupier.cardLocation(cardGO.value);
        const indexCard = currentSpot.indexOf(cardGO.value);
        
        dataDrag.cardGO = cardGO;
        dataDrag.indexCard = indexCard;
        dataDrag.x = cardGO.x;
        dataDrag.y = cardGO.y;
        dataDrag.spotGO = this.#mappedSpots.get(currentSpot);
        dataDrag.width = this.#scene.cardGeometry.width;
        dataDrag.height = this.#scene.cardGeometry.height;
        
        if (!this.isAllowedToDrag(currentSpot, cardGO.value, indexCard)) {
            return;
        }
        
        dataDrag.isActive = true;

        if (indexCard > 0 && currentSpot.cards[indexCard - 1].isOpen) {
            dataDrag.backupCardGO = this.#mappedCards.get(currentSpot.cards[indexCard - 1]);
        } else {
            dataDrag.backupCardGO = undefined;
        }

        const cards = currentSpot.cards.slice(indexCard);

        const nameTexture = this.getTexture(
            this.#scene.cardGeometry.width,
            this.#scene.cardGeometry.height + this.#scene.cardGeometry.offsetDragCardY * (cards.length - 1),
            10,
            COLOR.BLACK
        );

        if (!dataDrag.shape) {
            dataDrag.shape = this.#scene.add.sprite(0, 0, nameTexture)
                .setOrigin(0, 0)
                .setVisible(false);
        }
        let dragShape = dataDrag.shape;

        dragShape.setTexture(nameTexture)
            .setPosition(dataDrag.x + dataDrag.shapeX, dataDrag.y + dataDrag.shapeY)
            .setOrigin(0, 0)
            .setVisible(true)
            .setAlpha(0.5)
            .setScale(1.05, 1.03);
        this.#scene.children.bringToTop(dragShape);

        let posY = 0;
        for (let card of cards) {
            const currentCardGO = this.#mappedCards.get(card);
            //currentCardGO.setPosition(0, posY);

            dataDrag.cardsGO.push(currentCardGO);
            posY += this.#scene.cardGeometry.offsetDragCardY;

            currentCardGO.setScaleImage(1.05, 1.05);
            this.#scene.children.bringToTop(currentCardGO);
        }

        // const container = this.#containerDrag;
        // container.removeAll();
        // container.setPosition(dataDrag.x, dataDrag.y);
        // container.add(dataDrag.cardsGO);

        // this.#scene.children.bringToTop(container);

        /**
         * @param {SpotGO[]} spotsGO 
         * @returns {availableSpotGO[]}
         */
        const availableSpotsGO = (spotsGO) => {
            /** @type {availableSpotGO[]} */
            const intersectionSpotsGO = [];
            for (let spotGO of spotsGO) {
                if (spotGO == dataDrag.spotGO && !(dataDrag.backupCardGO || spotGO.value.quantity == 1)) {
                    continue;
                }
                const geometryIntersection = spotGO.geometryIntersection();
                if (spotGO == dataDrag.spotGO) {
                    if (dataDrag.backupCardGO) {
                        geometryIntersection.x = dataDrag.backupCardGO.x;
                        geometryIntersection.y = dataDrag.backupCardGO.y;
                        if (spotGO instanceof PileSpotGO) {
                            geometryIntersection.height = this.#scene.scale.height - geometryIntersection.y;
                        }
                    } else if (dataDrag.indexCard == 0) {
                        geometryIntersection.x = spotGO.x;
                        geometryIntersection.y = spotGO.y;
                    }
                }

                const settingFindCards = {
                    spot: spotGO.value,
                    useCurrentCard: spotGO == dataDrag.spotGO,
                    currentCard: spotGO == dataDrag.spotGO ? dataDrag.backupCardGO?.value : undefined,
                };

                const result = this.#croupier.nextCards(settingFindCards);
                if (result.isAvailable && result.cards.includes(cardGO.value)) {
                    intersectionSpotsGO.push( { spotGO: spotGO, geometryIntersection: geometryIntersection, data: result } );
                }
            
            }
            return intersectionSpotsGO;
        }

        dataDrag.availableSpotsPileGO = availableSpotsGO(this.spotsPile);
        dataDrag.availableSpotsFoundationsGO = availableSpotsGO(this.spotsFoundations);

        this.#scene.events.emit('dragStart');
        
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     * @param {CardGO} cardGO
     * @param {DataDrag} dataDrag
     * @param {{x: number, y: number}} pointXY
     */
    onDrag(pointer, cardGO, dataDrag, pointXY) {

        if (!this.isGameRuning()) return;

        if (!dataDrag.isActive || dataDrag.isEnd) {
            return;
        }

        if (this.#commandIsRunning) {
            return;
        } 

        dataDrag.shape.setPosition(pointXY.x + dataDrag.shapeX, pointXY.y + dataDrag.shapeY);
        dataDrag.cardsGO.forEach(
            (value, index) => value.setPosition(pointXY.x, pointXY.y + index * this.#scene.cardGeometry.offsetDragCardY));

        const objPosition = { x: pointXY.x, y: pointXY.y, width: dataDrag.width, height: dataDrag.height };

        /**
         * @param {availableSpotGO[]} availableSpotsGO 
         * @returns {availableSpot[]}
         */
        const availableSpots = (availableSpotsGO) => {
            /** @type {availableSpot[]} */
            const intersectionSpots = [];
            for (const availableSpotGO of availableSpotsGO) {
                if (this.intersection(objPosition, availableSpotGO.geometryIntersection)) {
                    const square = this.intersectionSquare(objPosition, availableSpotGO.geometryIntersection);
                    if (square.width >= this.#scene.minEntryThreshold.width && square.height >= this.#scene.minEntryThreshold.height) {
                        intersectionSpots.push( { spot: availableSpotGO.spotGO.value, square: square, data: availableSpotGO.data } );
                    }
                }
            }
            return intersectionSpots;
        }

        const availableSpotsPile = availableSpots(dataDrag.availableSpotsPileGO);
        const availableSpotsFoundations = availableSpots(dataDrag.availableSpotsFoundationsGO);

        /** @type {availableSpot} */
        let maxSpotFoundations;
        if (availableSpotsFoundations.length) {
            maxSpotFoundations = availableSpotsFoundations.reduce((acc, curr) => acc.square.value > curr.square.value ? acc : curr);
        }
        /** @type {availableSpot} */
        let maxSpotPile;
        if (availableSpotsPile.length) {
            maxSpotPile = availableSpotsPile.reduce((acc, curr) => acc.square.value > curr.square.value ? acc : curr);
        }

        /** @type {availableSpot} */
        let maxSpot;
        if (maxSpotFoundations && maxSpotPile) {
            // У этой ячейки будет небольшое преимущество
            if(maxSpotFoundations.square.value + 1000 >= maxSpotPile.square.value) {
                maxSpot = maxSpotFoundations;
            } else {
                maxSpot = maxSpotPile;
            }
        } else if (maxSpotFoundations) {
            maxSpot = maxSpotFoundations;
        } else if (maxSpotPile) {
            maxSpot = maxSpotPile;
        }

        const selectedSpotGO = maxSpot ? this.#mappedSpots.get(maxSpot.spot) : undefined; 
        if (dataDrag.selectedSpotGO !== selectedSpotGO) {
            if (dataDrag.selectedSpotGO) {
                if (dataDrag.detailedInformation.data.lastCard) {
                    this.#mappedCards.get(dataDrag.detailedInformation.data.lastCard).turnOffTinting();
                } else {
                    dataDrag.selectedSpotGO.cardout();
                }
            }
            dataDrag.selectedSpotGO = selectedSpotGO;
            dataDrag.detailedInformation = maxSpot;
            if (dataDrag.selectedSpotGO) {
                if (dataDrag.detailedInformation.data.lastCard) {
                    this.#mappedCards.get(dataDrag.detailedInformation.data.lastCard).turnOnTinting();
                } else {
                    dataDrag.selectedSpotGO.cardover();
                }
            }
        }
        
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     * @param {CardGO} cardGO
     * @param {DataDrag} dataDrag
     */
    async onDragEnd(pointer, cardGO, dataDrag) {

        if (this.#commandIsRunning) {
            return;
        }

        if (!dataDrag.isActive || dataDrag.isEnd) {
            return;
        }
        
        if (dataDrag.shape) {
            dataDrag.shape.setVisible(false);
        }

        dataDrag.isEnd = true;

        if (dataDrag.selectedSpotGO) {
            if (dataDrag.detailedInformation.data.lastCard) {
                this.#mappedCards.get(dataDrag.detailedInformation.data.lastCard).turnOffTinting();
            } else {
                dataDrag.selectedSpotGO.cardout();
            }
        }
        
        //const container = this.#containerDrag;

        //for (let currentCardGO of container.list) {
        for (let currentCardGO of dataDrag.cardsGO) {
            // @ts-ignore
            currentCardGO.setScaleImage(1, 1);
        }

        let deltaY = 0;
        if (dataDrag.selectedSpotGO instanceof PileSpotGO || !dataDrag.selectedSpotGO && dataDrag.spotGO instanceof PileSpotGO) {
            deltaY = this.#scene.cardGeometry.offsetOpenCardY;
        }
        
        const isNewSpot = dataDrag.selectedSpotGO && dataDrag.selectedSpotGO !== dataDrag.spotGO;
        if (isNewSpot) {
            
            // Команда перемещения на новую позицию
            const commad = new CommandCard(
                this,
                'moveCard',
                dataDrag.cardsGO.map(currentCardGO => currentCardGO.value),
                dataDrag.spotGO.value,
                dataDrag.selectedSpotGO.value);

            /** @type {CommandCard[]} */
            const commandsCard = [commad];
            
            if (dataDrag.spotGO instanceof PileSpotGO && dataDrag.indexCard > 0 && !dataDrag.backupCardGO) {
                const currentCard = dataDrag.spotGO.value.cards[dataDrag.indexCard - 1];
                if (!currentCard.isOpen) {

                    // Команда открытия карты
                    const commad2 = new CommandCard(
                        this,
                        'openCard',
                        [currentCard],
                        dataDrag.spotGO.value,
                        dataDrag.spotGO.value);
                    
                    commandsCard.push(commad2);
                }
            }

            await this.executeCommands(commandsCard);
            this.addMoves();

            dataDrag.isEnd = false;
            dataDrag.isActive = false;

        } else {

            await this.moveMyObj(dataDrag.x, dataDrag.y, dataDrag, deltaY);

        }

        this.#scene.events.emit('dragEnd');

        this.updateValueUI();

    }

    async moveMyObj(posX, posY, dataDrag, deltaY) {

        const offsetOpenCardY = this.#scene.cardGeometry.offsetOpenCardY;

        const promise = new Promise((resolve, reject) => {

            this.#scene.tweens.add({
                targets: dataDrag.cardsGO,
                x: posX,
                y: {
                    ease: 'Linear',
                    duration: this.currentDurationOfAnimation,
                    value: {
                        getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                            return target.y;
                        },
                        getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                            return posY + offsetOpenCardY * targetIndex;
                        }
                    }
                },
                ease: 'Linear',
                duration: this.currentDurationOfAnimation,
                onComplete: () => {
                    resolve();
                }
            });

        });

        const result = await promise;

        // /** @type {CardGO[]} */
        // // @ts-ignore
        // const arr = [...container.list];
        // container.removeAll();
        for (let currentCardGO of dataDrag.cardsGO) {
            currentCardGO.setPosition(posX, posY);
            posY += deltaY;
        }

        this.correctPositionCardsGO(dataDrag.cardsGO);

        dataDrag.isEnd = false;
        dataDrag.isActive = false;
        
        return true;
        
    }


    /**
     * 
     * @param {SpotGO} spotGO 
     */
    checkСardPosition(spotGO) {

        let deltaX = 0;
        let deltaOpenCardY = 0;
        let deltaCloseCardY = 0;
        
        if (spotGO instanceof PileSpotGO) {
            deltaOpenCardY = this.#scene.cardGeometry.offsetOpenCardY;
            deltaCloseCardY = this.#scene.cardGeometry.offsetCloseCardY;
        }

        let posX = spotGO.x;
        let posY = spotGO.y;
        
        const cards = [];

        for (let i = 0; i < spotGO.value.cards.length; i++) {
            
            const cardGO = this.#mappedCards.get(spotGO.value.cards[i]);

            if (cardGO.x !== posX || cardGO.y !== posY) {
                const info = {
                    spot: spotGO.value.name,
                    card: cardGO.value.fullName,
                    posXY: {x: cardGO.x, y: cardGO.y},
                    rightPosXY: {x: posX, y: posY},
                    index: i,
                };
                cards.push(info);
            }

            posX += deltaX;
            posY += (cardGO.isOpen ? deltaOpenCardY : deltaCloseCardY);
        }
        return cards;
    }

    /**
     * @param {{x: number, y: number, width: number, height: number}} obj1
     * @param {{x: number, y: number, width: number, height: number}} obj2
     * @returns {boolean}
     */
    intersection(obj1, obj2) {
        return obj1.x + obj1.width > obj2.x
            && obj2.x + obj2.width > obj1.x
            && obj1.y + obj1.height > obj2.y
            && obj2.y + obj2.height > obj1.y;
    }

   /**
     * @param {{x: number, y: number, width: number, height: number}} obj1
     * @param {{x: number, y: number, width: number, height: number}} obj2
     * @returns {{width: number, height: number, value: number}}
     */
    intersectionSquare(obj1, obj2) {
        const left = Math.max(obj1.x, obj2.x);
        const right = Math.min(obj1.x + obj1.width, obj2.x + obj2.width);
        const bottom = Math.min(obj1.y + obj1.height, obj2.y + obj2.height);
        const top = Math.max(obj1.y, obj2.y);

        const width = right - left;
        const height = bottom - top;

        return {
            width: width,
            height: height,
            value: width * height
        };
    }

    /**
     * @param {Spot} spot 
     * @param {Card} card
     * @param {number} indexCard 
     */
    isAllowedToDrag(spot, card, indexCard) {

        if (!card.isOpen) {
            return false;
        }

        if (indexCard != spot.quantity - 1) {
            if (!spot.name.toLowerCase().includes('pile')) {
                return false;
            }
        }

        return true;
    }

    getCardGO(card) {
        return this.#mappedCards.get(card);
    }

    /** @param {CommandCard[]} commandsCard */
    async executeCommands(commandsCard) {

        this.#commandIsRunning = true;

        const delay = 10;

        const userAction = {
            name: `Step ${this.#commandHistory.quantity + 1}`,
            score: 0,
            commandsCard: [],
        };

        this.#sound.slide();
        let cancelAllActions = false;
        for (const commandCard of commandsCard) {

            const result = await commandCard.execute();
            
            if (!result) {
                cancelAllActions = true;
                break;
            }
            userAction.commandsCard.push(commandCard);
        }

        if (cancelAllActions) {
            userAction.commandsCard.reverse();
            for (const commandCard of commandsCard) {
                commandCard.undo();
            }
        } else {
            userAction.score = this.calculateScores(userAction.commandsCard);
            this.addScore(userAction.score);
            this.#commandHistory.push(userAction);
        }

        this.updateValueUI();

        this.checkPropertyGame();

        this.#commandIsRunning = false;

    }   

    async checkPropertyGame() {

        if (this.statusGame === STATUS_GAME.RUNNING && (this.#croupier.checkFoundationsSpot() || this.#croupier.checkPileSpot())) {
            
            if (this.isAutoComplite() || this.#croupier.checkFoundationsSpot()) {
                this.statusGame = STATUS_GAME.GAME_OVER;
                this.#scene.time.delayedCall(100, this.displayCompletionAndVictory, [], this);
            }

        }
    }

    isAutoComplite() {
        return this.#scene.userSettingsManager.settings.autoComplite;
    }
    
    async displayCompletionAndVictory() {

        this.currentDurationOfAnimation = 90;

        await this.runAutoSteps();

        this.gameIsOver();

    }

    async runAutoSteps() {

        // Блокируем интерфейс

        if (!this.#croupier.checkPileSpot() || this.statusGame !== STATUS_GAME.GAME_OVER) {
            return;
        }

        const commandsCard = [];
        let commandName = undefined;
        for (let i = 0; i < 500 && !this.#croupier.checkFoundationsSpot(); i++) {
            
            let step = this.#croupier.getAutoStep();
            if (!step) {
                break;
            }

            if (step.spotTo === this.spotWaste.value) {
                commandName = 'moveCardFromStokToWaste';
            } else if (step.spotTo === this.spotStok.value) {
                commandName = 'moveCardsFromWasteToStok';
            } else {
                commandName = 'moveCard';
            }

            commandsCard[0] = new CommandCard(
                this,
                commandName,
                [step.card],
                step.spotFrom,
                step.spotTo);
                
            await this.executeCommands(commandsCard);
            this.addMoves();

        }
    }

    /** @param {CommandCard[]} commandsCard */
    calculateScores(commandsCard) {
        let sum = 0;
        for (const commandCard of commandsCard) {
            if (commandCard.name === 'openCard') {
                if (commandCard.spotFrom === commandCard.spotTo
                    && commandCard.spotFrom.name.toLowerCase().includes('pile')) {
                        sum += 5;
                    }
            } else if (commandCard.name === 'moveCard') {
                if (commandCard.spotTo.name.toLowerCase().includes('foundations')) {
                    if (!commandCard.spotFrom.name.toLowerCase().includes('foundations')) {
                        sum += 10;
                    }
                } else if (commandCard.spotTo.name.toLowerCase().includes('pile')){
                    if (commandCard.spotFrom.name.toLowerCase().includes('waste')) {
                        sum += 5;
                    }
                } else if (commandCard.spotFrom.name.toLowerCase().includes('foundations')) {
                    if (!commandCard.spotTo.name.toLowerCase().includes('foundations')) {
                        sum -= 10;
                    }
                } else if (commandCard.spotFrom.name.toLowerCase().includes('pile')){
                    if (commandCard.spotTo.name.toLowerCase().includes('waste')) {
                        sum -= 5;
                    }
                }
            }
        }
        return Math.max(0, sum)
    }

    showHistory() {
        return  this.#commandHistory.getHistory();
    }

    async runCommandUndo(data) {

        const fResult = (isCorrect = true) => {
            if (data && data.hasOwnProperty('callback') && data.callback) {
                data.callback(isCorrect);
            }
            return isCorrect;
        };

        if (this.#commandIsRunning) {
            return fResult(false);
        }
        if (this.checkStatusGameAndRunGame()) {
            this.stopHint();
            await this.undoUserAction();
        }
        
        return fResult(true);
    }

    async undoUserAction() {

        this.#commandIsRunning = true;

        const userAction = this.#commandHistory.pop();

        if (userAction) {
            
            this.#sound.undo();

            const commandsCard = [...userAction.commandsCard].reverse();
            for (const commandCard of commandsCard) {
                await commandCard.undo();
            }
            this.addMoves();
            if (userAction.score) {
                this.addScore(-userAction.score);
            }

        }

        this.updateValueUI();

        this.#commandIsRunning = false;

    }

    async setDelay(ms) {
        async function f() {
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => resolve("готово!"), ms)
            });
            let result = await promise; // будет ждать, пока промис не выполнится
        }
        await f();
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async command_openCard(cards, spotFrom, spotTo) {

        const cardGO = this.#mappedCards.get(cards[0]); 
        const promise = new Promise((resolve, reject) => {
            cardGO.flip(true, () => {
                resolve();
            }, 200);
        });
        const result = await promise;
        this.#setOpenCard(cardGO);
        this.#scene.input.setDraggable(cardGO, true);

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async commandUndo_openCard(cards, spotFrom, spotTo) {

        const cardGO = this.#mappedCards.get(cards[0]); 
        const promise = new Promise((resolve, reject) => {
            cardGO.flip(false, () => {
                resolve();
            }, 200);
        });
        const result = await promise;
        this.#setCloseCard(cardGO);
        this.#scene.input.setDraggable(cardGO, false);

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async command_moveCardFromStokToWaste(cards, spotFrom, spotTo) {

        const cardGO = this.#mappedCards.get(cards[0]);

        this.#scene.children.bringToTop(cardGO);

        let posX = this.spotWaste.x;
        const posY = this.spotWaste.y;

        const promises = [];

        if (!this.spotWaste.isEmpty()) {
            const deltaX = this.#scene.cardGeometry.offsetOpenCardX;
            if (this.spotWaste.value.quantity == 1) {
                posX += deltaX;
            } else {
                posX += deltaX * 2;
            }
            if (this.spotWaste.value.quantity >= 3) {
                const cardsGO = this.spotWaste.value.cards.slice(-2).map(card => this.#mappedCards.get(card));
                
                let posX2 = this.spotWaste.x;

                const promise3 = new Promise((resolve, reject) => {
                    this.#scene.tweens.add({
                        targets: cardsGO,
                        y: posY,
                        x: {
                            ease: 'Linear',
                            duration: this.currentDurationOfAnimation,
                            value: {
                                getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                                    return target.x;
                                },
                                getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                                    value = posX2;
                                    posX2 += deltaX;
                                    return value;
                                }
                            }
                        },
                        ease: 'Linear',
                        duration: this.currentDurationOfAnimation,
                        onComplete: () => { resolve(); }
                    });
                });
                promises.push(promise3);
            }
        }

        // const promise1 = new Promise((resolve, reject) => {
        //     cardGO.flip(true, () => {
        //         resolve();
        //     }, 100);
        // });
        // promises.push(promise1);

        const promise2 = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: posX,
                y: posY,
                ease: 'Linear',
                duration: this.currentDurationOfAnimation,
                onComplete: () => {
                    resolve();
                }
            });
        });
        promises.push(promise2);

        cardGO.setImageOpen();

        const results = await Promise.all(promises);

        this.#setOpenCard(cardGO);
        this.#scene.input.setDraggable(cardGO, true);
        this.#moveCardCore(this.spotWaste, cardGO);
        this.spotWaste.updateText();
        this.spotStok.updateText();

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async commandUndo_moveCardFromStokToWaste(cards, spotFrom, spotTo) {

        const cardGO = this.#mappedCards.get(cards[0]);

        this.#scene.children.bringToTop(cardGO);

        const promises = [];

        if (this.spotWaste.value.quantity > 3) {

            const cardsGO = this.spotWaste.value.cards.slice(-3, -1).map(card => this.#mappedCards.get(card));

            const deltaX = this.#scene.cardGeometry.offsetOpenCardX;
            let posX = this.spotWaste.x + deltaX;
            const posY = this.spotWaste.y;

            const promise3 = new Promise((resolve, reject) => {
                this.#scene.tweens.add({
                    targets: cardsGO,
                    y: posY,
                    x: {
                        ease: 'Linear',
                        duration: this.currentDurationOfAnimation,
                        value: {
                            getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                                return target.x;
                            },
                            getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                                value = posX;
                                posX += deltaX;
                                return value;
                            }
                        }
                    },
                    ease: 'Linear',
                    duration: this.currentDurationOfAnimation,
                    onComplete: () => { resolve(); }
                });
            });
            promises.push(promise3);

        }

        // const promise1 = new Promise((resolve, reject) => {
        //     cardGO.flip(false, () => {
        //         resolve();
        //     }, 100);
        // });
        // promises.push(promise1);

        const promise2 = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: this.spotStok.x,
                y: this.spotStok.y,
                ease: 'Linear',
                duration: this.currentDurationOfAnimation,
                onComplete: () => {
                    resolve();
                }
            });
        });
        promises.push(promise2);

        cardGO.setImageClose();

        const results = await Promise.all(promises);

        this.#setCloseCard(cardGO);
        this.#scene.input.setDraggable(cardGO, false);
        this.#moveCardCore(this.spotStok, cardGO);
        this.spotWaste.updateText();
        this.spotStok.updateText();

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async command_moveCardsFromWasteToStok(cards, spotFrom, spotTo) {

        const cardsGO = this.spotWaste.value.cards.map(card => this.#mappedCards.get(card)).reverse();
        
        // let posX = this.spotStok.x;
        // if (this.spotWaste.x !== this.spotStok.x) {
        //     posX = Math.round(this.spotWaste.x - (this.spotWaste.x - this.spotStok.x) / 3);
        // }
        // let posY = this.spotStok.y;
        // if (this.spotWaste.y !== this.spotStok.y) {
        //     posY = Math.round(this.spotWaste.y - (this.spotWaste.y - this.spotStok.y) / 3);
        // }

        const promise = new Promise((resolve, reject) => {
            // this.#scene.tweens.add({
            //     targets: cardsGO,
            //     x: posX,
            //     y: posY,
            //     scaleX: 0.3,
            //     ease: 'Linear',
            //     duration: this.currentDurationOfAnimation,
            //     onComplete: () => {
                    for (const currentCardGO of cardsGO) {
                        currentCardGO.setImageClose();
                        this.#scene.children.bringToTop(currentCardGO);
                    }
                    this.#scene.tweens.add({
                        targets: cardsGO,
                        x: this.spotStok.x,
                        y: this.spotStok.y,
                        scaleX: 1,
                        ease: 'Linear',
                        duration: this.currentDurationOfAnimation,
                        onComplete: () => {                              
                            resolve();
                        }
                    });
            //     }
            // });
        });
        const result = await promise;

        for (const currentCardGO of cardsGO) {
            this.#setCloseCard(currentCardGO);
            this.#moveCardCore(this.spotStok, currentCardGO);
        }

        this.#scene.input.setDraggable(cardsGO, false);
        this.correctPositionCardsGO(cardsGO);
        
        this.spotStok.updateText();
        this.spotWaste.updateText();

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async commandUndo_moveCardsFromWasteToStok(cards, spotFrom, spotTo) {

        const cardsGO = this.spotStok.value.cards.map(card => this.#mappedCards.get(card)).reverse();
        
        // let posX = this.spotStok.x;
        // if (this.spotWaste.x !== this.spotStok.x) {
        //     posX = Math.round(this.spotStok.x - (this.spotStok.x - this.spotWaste.x) / 3);
        // }
        // let posY = this.spotStok.y;
        // if (this.spotWaste.y !== this.spotStok.y) {
        //     posY = Math.round(this.spotStok.y - (this.spotStok.y - this.spotWaste.y) / 3);
        // }

        const pointsEnd = new Map();
        let deltaX = 0;
        cardsGO.slice(-3).forEach((cardGO, index) => {
            pointsEnd.set(cardGO, {x: this.spotWaste.x + deltaX, y: this.spotWaste.y});
            deltaX += this.#scene.cardGeometry.offsetOpenCardX;
        });

        const posXEnd = this.spotWaste.x;

        const promise = new Promise((resolve, reject) => {
            // this.#scene.tweens.add({
            //     targets: cardsGO,
            //     x: posX,
            //     y: posY,
            //     scaleX: 0.3,
            //     ease: 'Linear',
            //     duration: this.currentDurationOfAnimation,
            //     onComplete: () => {
                    for (const currentCardGO of cardsGO) {
                        currentCardGO.setImageOpen();
                        this.#scene.children.bringToTop(currentCardGO);
                    }
                    this.#scene.tweens.add({
                        targets: cardsGO,

                        x: {
                            ease: 'Linear',
                            duration: this.currentDurationOfAnimation,
                            value: {
                                getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                                    return target.x;
                                },
                                getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                                    if (pointsEnd.has(target)) {
                                        return pointsEnd.get(target).x;
                                    }
                                    return posXEnd;
                                }
                            }
                        },
                        y: this.spotWaste.y,

                        
                        scaleX: 1,
                        ease: 'Linear',
                        duration: this.currentDurationOfAnimation,
                        onComplete: () => {                              
                            resolve();
                        }
                    });
            //     }
            // });
        });
        const result = await promise;

        for (const currentCardGO of cardsGO) {
            this.#setOpenCard(currentCardGO);
            this.#moveCardCore(this.spotWaste, currentCardGO);
        }

        this.#scene.input.setDraggable(cardsGO, true);
        
        this.correctPositionCardsGO(cardsGO);

        this.spotStok.updateText();
        this.spotWaste.updateText();

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async command_moveCard(cards, spotFrom, spotTo) {

        const spotFromGO = this.#mappedSpots.get(spotFrom);
        const spotToGO = this.#mappedSpots.get(spotTo);

        let posY = spotToGO.y;
        let deltaOpenCardY = 0;
        let deltaCloseCardY = 0;
        if (spotToGO instanceof PileSpotGO) {
            deltaOpenCardY = this.#scene.cardGeometry.offsetOpenCardY;
            deltaCloseCardY = this.#scene.cardGeometry.offsetCloseCardY;
            if (!spotTo.isEmpty()) {
                posY = spotTo.cards.reduce((acc, curr) => acc + (curr.isOpen ? deltaOpenCardY : deltaCloseCardY), posY);
            }
        }

        const cardsGO = cards.map(card => this.#mappedCards.get(card));
        for (const cardGO of cardsGO) {
            this.#scene.children.bringToTop(cardGO);
        }

        let posX = spotToGO.x;
        if (spotToGO instanceof WasteSpotGO && spotTo.quantity > 0) {
            const deltaX = this.#scene.cardGeometry.offsetOpenCardX;
            if (spotTo.quantity == 1) {
                posX += deltaX;
            } else {
                posX += deltaX * 2;
            }
        }

        const promises = [];

        if (spotFromGO instanceof WasteSpotGO && spotFrom.quantity > 3) {
            
            // commandUndo_moveCardFromStokToWaste
            
            const cardsGO2 = this.spotWaste.value.cards.slice(-3, -1).map(card => this.#mappedCards.get(card));

            const deltaX = this.#scene.cardGeometry.offsetOpenCardX;
            let posX2 = this.spotWaste.x + deltaX;
            const posY2 = this.spotWaste.y;

            const promise2 = new Promise((resolve, reject) => {
                this.#scene.tweens.add({
                    targets: cardsGO2,
                    y: posY2,
                    x: {
                        ease: 'Linear',
                        duration: this.currentDurationOfAnimation,
                        value: {
                            getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                                return target.x;
                            },
                            getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                                value = posX2;
                                posX2 += deltaX;
                                return value;
                            }
                        }
                    },
                    ease: 'Linear',
                    duration: this.currentDurationOfAnimation,
                    onComplete: () => { resolve(); }
                });
            });
            promises.push(promise2);

        } else if (spotToGO instanceof WasteSpotGO && spotTo.quantity >= 3) {

            // command_moveCardFromStokToWaste

            const cardsGO3 = this.spotWaste.value.cards.slice(-2).map(card => this.#mappedCards.get(card));
                
            let posX3 = this.spotWaste.x;

            const deltaX = this.#scene.cardGeometry.offsetOpenCardX;

            const promise3 = new Promise((resolve, reject) => {
                this.#scene.tweens.add({
                    targets: cardsGO3,
                    y: posY,
                    x: {
                        ease: 'Linear',
                        duration: this.currentDurationOfAnimation,
                        value: {
                            getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                                return target.x;
                            },
                            getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                                value = posX3;
                                posX3 += deltaX;
                                return value;
                            }
                        }
                    },
                    ease: 'Linear',
                    duration: this.currentDurationOfAnimation,
                    onComplete: () => { resolve(); }
                });
            });
            promises.push(promise3);
        }

        const promise = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardsGO,
                x: posX,
                y: {
                    ease: 'Linear',
                    duration: this.currentDurationOfAnimation,
                    value: {
                        getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                            return target.y;
                        },
                        getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                            value = posY;
                            posY += deltaOpenCardY;
                            return value;
                        }
                    }
                },
                ease: 'Linear',
                duration: this.currentDurationOfAnimation,
                onComplete: () => { resolve(); }
            });
        });
        promises.push(promise);

        const results = await Promise.all(promises);

        for (let card of cards) {
            this.#croupier.moveCard(spotTo, card);
        }
        this.correctPositionCardsGO(cardsGO);

        spotFromGO.updateText();
        spotToGO.updateText();

        if (spotToGO instanceof FoundationsSpotGO && !(spotFromGO instanceof FoundationsSpotGO)) {
            this.completionToFoundations(spotToGO, cardsGO);
        }

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async commandUndo_moveCard(cards, spotFrom, spotTo) {
        return await this.command_moveCard(cards, spotTo, spotFrom);
    }

    /** @param {CardGO} cardGO */
    async makeStepCardAutomatically(cardGO) {
        
        if (!cardGO.isOpen) {
            return false;
        }

        const result = this.#croupier.firstAvailableSpot(cardGO.value);

        if (!result) {
            
            // The shake-up

            this.#commandIsRunning = true;

            const posX = cardGO.x;
            let directionShake = 10;

            const currentSpot = this.#croupier.cardLocation(cardGO.value);
            const indexCard = currentSpot.indexOf(cardGO.value);
            const cardsGO = currentSpot.cards.slice(indexCard).map(card => this.#mappedCards.get(card));

            
            this.#sound.shake();
            const promise = new Promise((resolve, reject) => {
                this.#scene.tweens.add({
                    targets: cardsGO,
                    x: {
                        repeat: 4,
                        duration: 20,
                        ease: 'Linear',
                        yoyo: true,
                        x: this.#scene.cardGeometry.offsetOpenCardX,
                        value: {

                            getActive: function (target, key, value, targetIndex, totalTargets, tween) {
                                return posX;
                            },
                            getStart: function (target, key, value, targetIndex, totalTargets, tween) {
                                if (targetIndex == 0) {
                                    directionShake *= -1;
                                }
                                return posX;
                            },
                            getEnd: function (target, key, value, targetIndex, totalTargets, tween) {
                                return posX + directionShake;
                            }
                        }
                    },

                    onComplete: () => {
                        resolve();
                    }
                });
            });
            const result = await promise;
            
            cardGO.x = posX;
            
            this.correctPositionCardsGO(cardsGO);

            this.#commandIsRunning = false;

            return true;
        }

        // Команда перемещения на новую позицию
        const commad = new CommandCard(
            this,
            'moveCard',
            result.spotFrom.cards.slice(result.indexCard),
            result.spotFrom,
            result.spotTo);

        /** @type {CommandCard[]} */
        const commandsCard = [commad];

        const currentSpotGO = this.#mappedSpots.get(result.spotFrom);

        if (currentSpotGO instanceof PileSpotGO
            && result.indexCard > 0
            && !result.spotFrom.cards[result.indexCard - 1].isOpen) {

            // Команда открытия карты
            const commad2 = new CommandCard(
                this,
                'openCard',
                [result.spotFrom.cards[result.indexCard - 1]],
                result.spotFrom,
                result.spotFrom);

            commandsCard.push(commad2);

        }

        await this.executeCommands(commandsCard);
        this.addMoves();
        this.updateValueUI();

        return true;

    }

    updateValueUI() {
        
        if (this.#notifyUI) {

            this.#scene.events.emit('updateValueUI',
            {
                moves: this.#numberOfMoves,
                score: this.#numberOfScore,
                undo: this.#commandHistory.quantity,
                time: this.#numberOfTime,
                statusGame: this.#statusGame,
                quantityInStok: this.spotStok.value.quantity,
            });
            
            this.#notifyUI = false;
        }
    }

    addMagic(num) {
        this.numberOfMagic = this.numberOfMagic + num;
    }

    addMoves() {
        this.numberOfMoves = this.numberOfMoves + 1;
    }

    /** @param {number} numberOfScore */
    addScore(numberOfScore) {
        this.numberOfScore = this.numberOfScore + numberOfScore;
    }

    toJSON() {
        return {
            spots: this.#croupier.toJSON(),
            score: this.#numberOfScore,
            time: this.reusableTimerEvent.getTime(),
            moves: this.#numberOfMoves,
            magic: this.#numberOfMagic,
            history: this.#commandHistory.toJSON(),
        };
    }

    restoreGame(dataJSON) {

        const mementoState = JSON.parse(dataJSON);
        
        const f = (spotsGO, dataSpots, moveY = false) => {
            let indexSpot = 0;
            for (const dataSpot of dataSpots) {
                /** @type {SpotGO} */
                const spotGO = spotsGO[indexSpot];
                let posY = spotGO.y;
                for (const str of dataSpot) {
                    const card = this.#croupier.nameToCard(str[0], str[1]);
                    card.isOpen = str[2];
                    const cardGO = this.#mappedCards.get(card);
                    this.#moveCardCore(spotGO, cardGO);
                    card.isOpen ? cardGO.setImageOpen() : cardGO.setImageClose();
                    cardGO.setScaleImage(1, 1);
                    cardGO.setPosition(spotGO.x, posY);
                    this.#scene.input.setDraggable(cardGO, card.isOpen);
                    this.#scene.children.bringToTop(cardGO);
                    if (moveY) {
                        posY += card.isOpen 
                            ? this.#scene.cardGeometry.offsetOpenCardY
                            : this.#scene.cardGeometry.offsetCloseCardY;
                    }
                }
                spotGO.updateText();
                indexSpot++;
            }
        }

        this.#croupier.clearSpots();
        f(this.spotsFoundations, mementoState.spots.Foundations);
        f(this.spotsPile, mementoState.spots.Pile, true);
        f([this.spotStok], mementoState.spots.Stok);
        f([this.spotWaste], mementoState.spots.Waste);

        let deltaX = 0;
        for (const card of this.spotWaste.value.cards.slice(-3)) {
            this.#mappedCards.get(card).setPosition(this.spotWaste.x + deltaX, this.spotWaste.y);
            deltaX += this.#scene.cardGeometry.offsetOpenCardX;
        }

        this.numberOfScore = mementoState.score;
        this.numberOfMoves = mementoState.moves;
        this.#numberOfMagic = mementoState.magic || 2;
        
        // таймер
        const currentTime = this.#scene.time.now;
        this.startTime = currentTime - mementoState.time;
        this.lastPauseTime = currentTime;
        this.numberOfTime = Math.floor(mementoState.time / 1000);


        this.#commandHistory.clear();

        // Восстановить историю ходов
        for (const strUserAction of mementoState.history) {

            // 0 - name
            // 1 - score
            // 2 - commandsCard
            
            const userAction = {
                name: strUserAction[0],
                score: strUserAction[1],
                commandsCard: [],
            };

            for (const strCommandCard of strUserAction[2]) {

                // 0 - name
                // 1 - spotFrom
                // 2 - spotTo
                // 3 - cards

                userAction.commandsCard.push(
                    new CommandCard(
                        this,
                        strCommandCard[0],
                        strCommandCard[3].map(fullname => fullname ? this.#croupier.fullNameToCard(fullname) : null),
                        this.#croupier.nameToSpot(strCommandCard[1]),
                        this.#croupier.nameToSpot(strCommandCard[2]))
                );

            }

            this.#commandHistory.push(userAction);
            
        }
        
        this.#cardsGO.forEach(cardGO => cardGO.visible = true);

        [this.spotStok, this.spotWaste, ...this.spotsFoundations, ...this.spotsPile].forEach(spotGO => spotGO.updateText());

        this.updateValueUI();

    }

    saveGame() {

        const text = JSON.stringify(this.toJSON());

        console.table(this.toJSON());

    }

    saveGameState() {

        if (this.isGameRuning()) {

            this.userSettingsManager.saveGameSession( JSON.stringify(this.toJSON()) ).then(() => {

                this.userSettingsManager.setSaveState(1);
                this.userSettingsManager.saveSettings();

            });

        }
    }

    loadGameState(dataSessionJSON) {

        if (!dataSessionJSON) {
            return false;
        }
        
        this.restoreGame(dataSessionJSON);
        this.statusGame = STATUS_GAME.PAUSE;
        return true;
    }

    /** @param {CardGO[]} cardsGO */
    correctPositionCardsGO(cardsGO) {

        if (cardsGO.length === 0) {
            return;
        }

        const spot = this.#croupier.cardLocation(cardsGO[0].value);

        const spotGO = this.#mappedSpots.get(spot);

        if (spotGO instanceof FoundationsSpotGO || spotGO instanceof StokSpotGO) {

            for (const cardGO of cardsGO) {
                cardGO.setPosition(spotGO.x, spotGO.y);
                this.#scene.children.bringToTop(cardGO);
            }

        } else if (spotGO instanceof PileSpotGO) {
            
            let posY = spotGO.y;
            
            const index = spot.indexOf(cardsGO[0].value);
            if (index > 0) {
                for (const card of spot.cards.slice(0, index)) {
                    posY += card.isOpen 
                            ? this.#scene.cardGeometry.offsetOpenCardY
                            : this.#scene.cardGeometry.offsetCloseCardY;
                }
            }

            for (const cardGO of cardsGO) {
                cardGO.setPosition(spotGO.x, posY);
                this.#scene.children.bringToTop(cardGO);
                posY += cardGO.isOpen 
                    ? this.#scene.cardGeometry.offsetOpenCardY
                    : this.#scene.cardGeometry.offsetCloseCardY;
            }

        } else if (spotGO instanceof WasteSpotGO) {

            let firstCard = undefined;
            let secondCard = undefined;

            const cardsToMove = this.spotWaste.value.cards.slice(-3);
            if (cardsToMove.length > 2) {
                firstCard = cardsToMove[2];
            }
            if (cardsToMove.length > 1) {
                secondCard = cardsToMove[1];
            }

            for (const cardGO of cardsGO) {
                if (cardGO.value === firstCard) {
                    cardGO.setPosition(spotGO.x + this.#scene.cardGeometry.offsetOpenCardX * 2, spotGO.y);
                } else if (cardGO.value === secondCard) {
                    cardGO.setPosition(spotGO.x + this.#scene.cardGeometry.offsetOpenCardX, spotGO.y);
                } else {
                    cardGO.setPosition(spotGO.x, spotGO.y);
                }
                this.#scene.children.bringToTop(cardGO);
            }

        }

    }

    /**
     * @param {FoundationsSpotGO} spotGO 
     * @param {CardGO[]} cardsGO 
     */
    completionToFoundations(spotGO, cardsGO) {
        
        if (spotGO instanceof FoundationsSpotGO) {

            spotGO.beautifulEffect(cardsGO[0].value.suit);
            this.#sound.guitarStrings();

        }

    }

    async handleOpeningModalUI(data) {

        this.stopHint();

        if (data.isOpen) {

            this.putOnPause();

        }
        
    }


    async showRewardedVideo(data) {

        this.stopHint();

        this.putOnPause();

        

        let result = false;
        try {
            result = await this.sdk.showRewardedAd();
            this.addMagic(2);
        } catch (error) {
            console.error('Error when displaying ads:', error.message);
        }
        
        let text = result ? this.localization.magic_updated : this.localization.magic_no_updated;
        this.#scene.events.emit('hintShowText', {text: text});

        this.#scene.time.delayedCall(2000, () => {
            this.#scene.events.emit('hintHideText', {});
        }, [], this);
    }


    putOnPause() {
        if (this.statusGame === STATUS_GAME.RUNNING) {
            this.statusGame = STATUS_GAME.PAUSE;
            this.reusableTimerEvent.pauseTimer();
            return true;
        }
        return false;
    }
    
    initHints() {
        
        const manager = this;

        this.dataHint = new (class {
            constructor() {
                this.x = 0;
                this.y = 0;
                this.executionAborted = false;
                this.manager = manager;
                this.scene = manager.#scene;
                this.sprites = [];
                this.container = this.scene.add.container();
                this.baseSpeed = 200;
                this.tween = undefined;
                this.tweenText = undefined;
                this.onComplete = undefined;
                this.onStopCallback = undefined;
                this.displayText = false;
                const nameTexture = manager.getTexture.call(
                    manager,
                    this.scene.cardGeometry.width + 16,
                    this.scene.cardGeometry.height + 16,
                    10,
                    COLOR.BRIGHT_YELLOW
                );
                this.shape = this.scene.add.sprite(0, 0, nameTexture)
                    .setOrigin(0, 0)
                    .setVisible(false);
            }
            setText(text) {
                if (!this.displayText) return;
                this.scene.events.emit('hintShowText', {text: text});
            }
            hideText() {
                this.scene.events.emit('hintHideText', {});
            }
            setPosition(x, y) {
                this.x = x;
                this.y = y;
                this.container.setPosition(this.x, this.y);
            }
            setDisplayText(value) {
                this.displayText = value;
            }
            hide() {
                this.hideText();
                this.container.removeAll();
                this.shape.setVisible(false);
                this.sprites.forEach(sprite => sprite.setVisible(false));
            }
            getHint() {
                return manager.#croupier.getHint();
            }
            /** @param {Card[]} cards */
            addCards(cards) {
                if (this.container.length > 0) {
                    this.hide();
                }
                this.initShape(cards.length);
                let card, cardGO, sprite;
                for (let i = 0; i < cards.length; i++) {
                    cardGO = manager.#mappedCards.get(cards[i]);
                    i === 0 && this.setPosition(cardGO.x, cardGO.y);
                    this.initSprite(i)
                        .setTexture('cards', cardGO.fullName)
                        .setOrigin(0, 0)
                        .setTint(COLOR.YELLOW);
                }
                this.scene.children.bringToTop(this.container);
            }
            initShape(num) {
                const _size = 12;
                const nameTexture = manager.getTexture.call(
                    manager,
                    this.scene.cardGeometry.width + _size,
                    this.scene.cardGeometry.height + _size + this.scene.cardGeometry.offsetOpenCardY * (num - 1),
                    10,
                    COLOR.BRIGHT_YELLOW
                );
                this.shape.setTexture(nameTexture)
                    .setPosition(-_size/2, -_size/2)
                    .setVisible(true)
                    .setTint(COLOR.YELLOW)
                    .setAlpha(0.9);
                this.container.add(this.shape);
            }
            initSprite(index) {
                this.sprites[index] === undefined && (this.sprites[index] = this.scene.add.sprite(0, 0, 'cards', 'back2'));
                const sprite = this.sprites[index];
                sprite
                    .setTexture('cards', 'back2')
                    .setOrigin(0, 0)
                    .setPosition(0, index * this.scene.cardGeometry.offsetOpenCardY)
                    .setVisible(true);
                this.scene.children.bringToTop(sprite);
                this.container.add(sprite);
                return sprite;
            }
            getEndPosition(step) {
                const spotGO = manager.#mappedSpots.get(step.spotTo);
                if (spotGO instanceof PileSpotGO) {
                    const baseGO = step.baseCard ? manager.#mappedCards.get(step.baseCard) : spotGO;
                    return {
                        x: baseGO.x,
                        y: baseGO.y + (step.baseCard ? this.scene.cardGeometry.offsetOpenCardY : 0)
                    }
                }
                return {
                    x: spotGO.x,
                    y: spotGO.y
                };
            }
            getDuration(posXY) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, posXY.x, posXY.y);
                const speed = this.baseSpeed + (distance / 100) * 50;
                return (distance / speed) * 1000;
            }
            showStep(step, description, callback, delay = 0) {
                this.addCards(step.cards);
                const posXY = this.getEndPosition(step);
                const duration = this.getDuration(posXY);
                this.onComplete = (isStop) => {
                    this.hide();
                    if (!isStop && callback) {
                        callback();
                    }
                };
                this.setText(description);
                this.tween = this.scene.tweens.add({
                    targets: this.container,
                    x: posXY.x,
                    y: posXY.y,
                    ease: 'expo.out',
                    duration: duration,
                    hold: 200,
                    delay: delay,
                    onComplete: () => {
                        this.complite();
                    }
                });
            }
            showStepToWaste(callback, delay = 0) {
                this.hide();
                this.setPosition(manager.spotStok.x, manager.spotStok.y);
                this.scene.children.bringToTop(this.container);
                this.initShape(1);
                const sprite = this.initSprite(0);
                sprite.setTint(COLOR.YELLOW);
                let deltaX = 0;
                if (manager.spotWaste.value.quantity > 2) {
                    deltaX = this.scene.cardGeometry.offsetOpenCardX * 2;
                } else if (manager.spotWaste.value.quantity > 1) {
                    deltaX = this.scene.cardGeometry.offsetOpenCardX;
                }
                const posXY = {
                    x: manager.spotWaste.x + deltaX,
                    y: manager.spotWaste.y
                };
                const duration = this.getDuration(posXY);
                this.onComplete = (isStop) => {
                    this.hide();
                    if (!isStop && callback) {
                        callback();
                    }
                };
                this.setText(manager.localization.hint_draw);
                this.tween = this.scene.tweens.add({
                    targets: this.container,
                    x: posXY.x,
                    y: posXY.y,
                    ease: 'expo.out',
                    duration: duration,
                    hold: 200,
                    delay: delay,
                    onComplete: () => {
                        this.complite();
                    }
                });
            }
            showStepToStok(callback, delay = 0) {
                this.hide();
                this.onComplete = (isStop) => {
                    this.hide();
                    manager.spotStok.resetFlashingShape();
                    if (!isStop && callback) {
                        callback();
                    }
                };
                this.setText(manager.localization.hint_recycle_cards);
                this.tween = manager.spotStok.flashingShape(() => {
                    this.complite();
                });
            }
            showNoneStep(callback, delay = 0) {
                this.hide();
                this.onComplete = (isStop) => {
                    this.hide();
                    if (!isStop && callback) {
                        callback();
                    }
                };
                this.setText(manager.localization.hint_none);
                this.tween = this.scene.tweens.add({
                    targets: {value: 1},
                    value: 1,
                    duration: 700,
                    delay: delay,
                    onComplete: () => {
                        this.complite();
                    }
                });
            }
            complite() {
                this.tween = undefined;
                this.tweenText = undefined;
                if (this.onComplete) {
                    const fComplete = this.onComplete;
                    this.onComplete = undefined;
                    fComplete(this.executionAborted);
                };
                if (this.executionAborted) {
                    const fStop = this.onStopCallback;
                    this.onStopCallback = undefined;
                    fStop();
                }
            }
            stop() {
                this.executionAborted = true;
                if (this.tween) {
                    this.tween.stop();
                    this.scene.tweens.remove(this.tween);
                    this.complite();
                }
                this.executionAborted = false;
            }
            setOnStopCallback(callback) {
                this.executionAborted = false;
                this.onStopCallback = callback;
            }
        });

    }

    stopHint() {
        this.dataHint.stop();
    }

    async runCommandHint(data) {

        const fResult = (isCorrect = true) => {
            if (data && data.hasOwnProperty('callback') && data.callback) {
                data.callback(isCorrect);
            }
            if (data && data.hasOwnProperty('resetIdleTimer') && data.resetIdleTimer) {
                this.resetIdleTimer();
            }
            return isCorrect;
        };

        if (!this.checkStatusGameAndRunGame()) {
            return fResult(false);
        }

        this.stopHint();

        this.dataHint.setOnStopCallback(() => fResult(false));
        
        const onlyFirst = data && data.hasOwnProperty('onlyFirst') ? data.onlyFirst : false;
        const displayText = data && data.hasOwnProperty('displayText') ? data.displayText : true;

        this.dataHint.setDisplayText(displayText);

        const hint = this.dataHint.getHint(); 
        if (hint.availableSteps.length > 0) {
            if (onlyFirst && hint.availableSteps.length > 1) {
                hint.availableSteps = [hint.availableSteps[0]];
            }
            let num = 0;
            const iteratorStep = hint.availableSteps[Symbol.iterator]();
            const manager = this;
            const tweenHint = (delay = 0) => {
                let result = iteratorStep.next();
                if (result.done) {
                    this.dataHint.complite();
                    return fResult(true);
                }
                const description = manager.localize('hint_move', {current: ++num, total: hint.availableSteps.length})
                manager.dataHint.showStep(result.value, description, () => {tweenHint(delay)}, 100);
            }
            tweenHint(100);
        } else if (hint.areThereAnyCardsInStok || hint.areThereAnyCardsInWaste) {
            if (!this.spotStok.isEmpty()) {
                this.dataHint.showStepToWaste(() => {fResult(true)}, 100);
            } else {
                this.dataHint.showStepToStok(() => {fResult(true)}, 100);
            }
        } else {
            this.dataHint.showNoneStep(() => {fResult(true)}, 100);
        }

    }

    async runCommandMagic(data) {
        
        const fResult = (isCorrect = true) => {
            if (data && data.hasOwnProperty('callback') && data.callback) {
                data.callback(isCorrect);
            }
            return isCorrect;
        };

        if (!this.checkStatusGameAndRunGame()) {
            return fResult(false);
        }

        this.stopHint();

        const dataMagicMove = this.#croupier.getMagicMove();
        if (!dataMagicMove) {
            return fResult(true);
        }

        if (this.numberOfMagic <= 0) {
            
            this.#scene.events.emit('showAdPanel');

            return fResult(true);
        }

        let nameCommand;
        if (dataMagicMove.type === 'FirstCard') {
            nameCommand = 'magicMoveCardFirstCard';
        } else if (dataMagicMove.type === 'LastCard') {
            nameCommand = 'magicMoveCardLastCard';
        } else if (dataMagicMove.type === 'AnyClosedCard') {
            nameCommand = 'magicMoveAnyClosedCardToFreeSpace';
        } else {
            // красивый эффект
            return fResult(true);
        }

        const commad = new CommandCard(
            this,
            nameCommand,
            [dataMagicMove.card, dataMagicMove.baseCardTo, dataMagicMove.baseCardFrom],
            dataMagicMove.spotFrom,
            dataMagicMove.spotTo);

        await this.executeCommands([commad]);

        this.addMagic(-1);

        this.addMoves();
        this.updateValueUI();

        return fResult(true);
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async command_magicMoveCardFirstCard(cards, spotFrom, spotTo) {

        const cardGO = this.#mappedCards.get(cards[0]);
        const spotFromGO = this.#mappedSpots.get(spotFrom);
        const spotToGO = this.#mappedSpots.get(spotTo);

        let posX = cardGO.x;
        let posY = cardGO.y;
        if (this.#settingsResize.settingDesk.type === 'LANDSCAPE') {
            posX -= this.#scene.cardGeometry.width;
        } else {
            posY -= this.#scene.cardGeometry.height;
        }

        let promise = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: posX,
                y: posY,
                ease: 'Linear',
                duration: 100,
                onComplete: () => {
                    resolve();
                }
            });
        });
        await promise;
        
        this.#scene.children.bringToTop(cardGO);

        posX = this.#scene.scale.width / 2 - this.#scene.cardGeometry.width;
        posY = this.#scene.scale.height / 2 - this.#scene.cardGeometry.height;

        promise = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: posX,
                y: posY,
                scale: 2,
                ease: 'Linear',
                hold: cardGO.isOpen ? 300 : 0,
                duration: 200,
                onComplete: () => {
                    resolve();
                }
            });
        });
        await promise;

        if (!cardGO.isOpen) {
            promise = new Promise((resolve, reject) => {
                cardGO.flip(true, () => {
                    resolve();
                }, 200, 200, 300);
            });
            await promise;
        }
        
        posX = this.#mappedCards.get(cards[1]).x;
        posY = this.#mappedCards.get(cards[1]).y;

        promise = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: posX,
                y: posY,
                scale: 1,
                ease: 'Linear',
                duration: 200,
                delay: 100,
                onComplete: () => {
                    resolve();
                }
            });
        });
        await promise;

        this.#setOpenCard(cardGO);
        this.#scene.input.setDraggable(cardGO, true);
        if (spotFromGO === spotToGO) {
            this.#croupier.magicMoveCardIntoSpotFirstCard(cards[0], spotFrom, cards[1]);
        } else {
            this.#croupier.magicMoveCard(cards[0], spotFrom, spotTo, spotTo.indexOf(cards[1]));
        }
        spotFromGO.updateText();
        spotToGO.updateText();

        /** @param {Spot} spot */
        const f = (spot) => {
            if (spot.quantity) {
                const cardsGO = spot.cards.map(card => this.#mappedCards.get(card));
                this.correctPositionCardsGO(cardsGO);
            }
        };

        f(spotFrom);
        f(spotTo);

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async commandUndo_magicMoveCardFirstCard(cards, spotFrom, spotTo) {

        const cardGO = this.#mappedCards.get(cards[0]);
        const spotFromGO = this.#mappedSpots.get(spotFrom);
        const spotToGO = this.#mappedSpots.get(spotTo);

        let promise = new Promise((resolve, reject) => {
            cardGO.magicShowHide(false, resolve, 500);
        });
        await promise;

        if (spotFromGO !== this.spotWaste) {
            this.#setCloseCard(cardGO);
            cardGO.setImageClose();
            this.#scene.input.setDraggable(cardGO, false);
        }

        if (spotFromGO === spotToGO) {
            this.#croupier.undoMagicMoveCardIntoSpotFirstCard(cards[0], spotFrom, cards[2]);
        } else {
            this.#croupier.magicMoveCard(cards[0], spotTo, spotFrom, cards[2] ? spotFrom.indexOf(cards[2]) + 1 : 0);
        }

        spotFromGO.updateText();
        spotToGO.updateText();

        /** @param {Spot} spot */
        const f = (spot) => {
            const cardsGO = spot.cards.map(card => this.#mappedCards.get(card));
            this.correctPositionCardsGO(cardsGO);
        };

        f(spotFrom);
        f(spotTo);

        promise = new Promise((resolve, reject) => {
            cardGO.magicShowHide(true, resolve, 500);
        });
        await promise;

        return true;
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async command_magicMoveCardLastCard(cards, spotFrom, spotTo) {

        const cardGO = this.#mappedCards.get(cards[0]);
        const spotFromGO = this.#mappedSpots.get(spotFrom);
        const spotToGO = this.#mappedSpots.get(spotTo);

        let posX = cardGO.x;
        let posY = cardGO.y;
        if (this.#settingsResize.settingDesk.type === 'LANDSCAPE') {
            posX -= this.#scene.cardGeometry.width;
        } else {
            posY -= this.#scene.cardGeometry.height;
        }

        let promise = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: posX,
                y: posY,
                ease: 'Linear',
                duration: 100,
                onComplete: () => {
                    resolve();
                }
            });
        });
        await promise;
        
        this.#scene.children.bringToTop(cardGO);

        posX = this.#scene.scale.width / 2 - this.#scene.cardGeometry.width;
        posY = this.#scene.scale.height / 2 - this.#scene.cardGeometry.height;

        promise = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: posX,
                y: posY,
                scale: 2,
                ease: 'Linear',
                duration: 200,
                hold: cardGO.isOpen ? 300 : 0,
                onComplete: () => {
                    resolve();
                }
            });
        });
        await promise;

        if (!cardGO.isOpen) {
            promise = new Promise((resolve, reject) => {
                cardGO.flip(true, () => {
                    resolve();
                }, 200, 200, 300);
            });
            await promise;
        }
        
        posX = spotToGO.x;
        posY = spotToGO.y;

        if (spotToGO instanceof PileSpotGO) {
            for (const card of spotToGO.value.cards) {
                posY += card.isOpen 
                    ? this.#scene.cardGeometry.offsetOpenCardY
                    : this.#scene.cardGeometry.offsetCloseCardY;
            }
        }

        promise = new Promise((resolve, reject) => {
            this.#scene.tweens.add({
                targets: cardGO,
                x: posX,
                y: posY,
                scale: 1,
                ease: 'Linear',
                duration: 200,
                delay: 100,
                onComplete: () => {
                    resolve();
                }
            });
        });
        await promise;

        if (spotToGO instanceof FoundationsSpotGO && !(spotFromGO instanceof FoundationsSpotGO)) {
            this.completionToFoundations(spotToGO, [cardGO]);
        }
        
        this.#setOpenCard(cardGO);
        this.#scene.input.setDraggable(cardGO, true);
        
        if (spotFromGO === spotToGO) {
            this.#croupier.magicMoveCardIntoSpotLastCard(cards[0], spotFrom);
        } else {
            this.#croupier.magicMoveCard(cards[0], spotFrom, spotTo);
        }

        spotFromGO.updateText();
        spotToGO.updateText();

        /** @param {Spot} spot */
        const f = (spot) => {
            const cardsGO = spot.cards.map(card => this.#mappedCards.get(card));
            this.correctPositionCardsGO(cardsGO);
        };

        f(spotFrom);
        f(spotTo);
        
        return true;

    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async commandUndo_magicMoveCardLastCard(cards, spotFrom, spotTo) {
        return await this.commandUndo_magicMoveCardFirstCard(cards, spotFrom, spotTo); 
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async command_magicMoveAnyClosedCardToFreeSpace(cards, spotFrom, spotTo) {
       return await this.command_magicMoveCardLastCard(cards, spotFrom, spotTo);
    }

    /**
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    async commandUndo_magicMoveAnyClosedCardToFreeSpace(cards, spotFrom, spotTo) {
        return await this.commandUndo_magicMoveCardFirstCard(cards, spotFrom, spotTo);
    }

    isGameRuning() {
        return this.#statusGame === STATUS_GAME.READY
            || this.#statusGame === STATUS_GAME.RUNNING
            || this.#statusGame === STATUS_GAME.PAUSE;
    }

    resetIdleTimer() {
        this.idleTime.reset();
    }

    getTexture(width, height, radius, color) {
        return generateTexture(this.#scene, width, height, radius, color);
    }

    localize(key, params) {
        let template = this.localization[key];
        for (const param in params) {
            template = template.replace(`{${param}}`, params[param]);
        }
        return template;
    }

    onEvent(event, data) {
        if (event === 'saveSettings') {
            this.#sound.updateVolume();
        }
    }
}
