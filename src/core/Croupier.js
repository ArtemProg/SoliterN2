// @ts-check

import Card from "./Card.js";
import Spot from "./Spot.js";
import GameState from "./tools/GameState.js";

export default class Croupier {
    
    /** @type {Card[]} */
    #packOfCards = [];

    /** @type {Card[]} */
    #currentDealCards = [];
    
    /** @type {Spot} */
    #spotStok;
    
    /** @type {Spot} */
    #spotWaste;

    /** @type {Spot[]} */
    #spotsPile = [];

    /** @type {Spot[]} */
    #spotsFoundations = [];

    /** @type {Map<Card, Spot>} */
    #cardsLocation = new Map;

    /** @type {Map<string, Card>} */
    #nameToCard = new Map;

    /** @type {Map<string, Spot>} */
    #nameToSpot = new Map;

    #hashValidСards = new Map;

    constructor() {
        
        this.#createCards();
        this.#createSpots();

    }

    #createCards() {
        for(const prop in SUITS) {
            RANKS.forEach(rank => {
                const card = new Card(SUITS[prop], rank);
                this.#packOfCards.push(card);
                this.#nameToCard.set(card.fullName, card);
            })
        }
    }

    #createSpots() {
        
        const f = name => {
            const spot = new Spot(this, name);
            this.#nameToSpot.set(name, spot);
            return spot;
        }
        
        this.#spotStok = f('Stok');
        
        
        this.#spotWaste = f('Waste');
        
        for(let i = 1; i <= 7; i++) {
            this.#spotsPile.push(f(`Pile${i}`));
        }
        
        for(let i = 1; i <= 4; i++) {
            this.#spotsFoundations.push(f(`Foundations${i}`));
        }
    }

    clearSpots() {
        this.#spotWaste.clear();
        this.#spotStok.clear();
        this.#spotsFoundations.forEach(spot => spot.clear());
        this.#spotsPile.forEach(spot => spot.clear());
        this.#cardsLocation.clear();
    }

    mixAndTransferToSpotStok(isNewGame = true) {
       
        this.clearSpots();

        if (isNewGame || this.#currentDealCards.length === 0) {
            
            /** @type {Card[]} */
            const packOfCards = [...this.#packOfCards];

            Phaser.Utils.Array.Shuffle(packOfCards);

            this.#currentDealCards = [...packOfCards];

        }
        
        for (let card of this.#currentDealCards) {
            this.#spotStok.add(card);
            card.isOpen = false;
            this.#cardsLocation.set(card, this.#spotStok);
        }
    }

    #handOutCards() {

        /** @type {Card[]} */
        const packOfCards = [];

        /** @type {Number} */
        let cardIndex = 0;

        /** @type {Spot} */
        let currentSpot;

        /** @type {Card} */
        let currentCard;

        /*
        for (let i = 0; i < this.#spotsPile.length; i++) {
            currentSpot = this.#spotsPile[i];
            for (let j = 0; j < i + 1; j++, cardIndex++) {
                currentCard = packOfCards[cardIndex];
                currentSpot.add(currentCard);
                this.#cardsLocation.set(currentCard, currentSpot);
            }
        }
        */

    }

    /**
     * @param {String} description
     * @returns {GameState} 
    */
    save(description) {
        return new GameState(
            [...this.#packOfCards],
            [this.#spotStok, this.#spotWaste, ...this.#spotsPile, ...this.#spotsFoundations],
            description
        );
    }

    /** @param {GameState} gameState */
    restore(gameState) {

        const mapCards = gameState.getCards();
        const mapSpots = gameState.getSpots();
        
        mapSpots.forEach((cards, spot) => {
            spot.cards = [...cards];
            cards.forEach((card) => {
                this.#cardsLocation.set(card, spot);
            });
        });

        mapCards.forEach((isOpen, card) => {
            card.isOpen = isOpen;
        });

    }

    /**
    * @param {Card} card
    */
    cardDeleteLocation(card) {
        return this.#cardsLocation.delete(card);
    }

    /**
    * @param {Card} card
    * @returns {Spot}
    */
    cardLocation(card) {
        return this.#cardsLocation.get(card);
    }

    /** @returns {Card[]} */
    get packOfCards() {
        return [...this.#packOfCards];
    }

    
    get spots() {
        return {
            spotStok: this.#spotStok,
            spotWaste: this.#spotWaste,
            spotsPile: [...this.#spotsPile],
            spotsFoundations: [...this.#spotsFoundations]
        }
    }

    /** @returns {Spot[]} */
    get spotsPile() {
        return [...this.#spotsPile];
    }

    /** @returns {Spot} */
    get spotStok() {
        return this.#spotStok;
    } 

    /** @returns {Spot} */
    get spotWaste() {
        return this.#spotWaste;
    }

    /** 
     * @param {Spot} spot
     * @param {Card} card
    */
    moveCard(spot, card) {
        const currentSpot = this.cardLocation(card);
        if (spot === currentSpot) {
            return;
        } else if (currentSpot) {
            currentSpot.removeCard(card);
        }
        spot.add(card);
        this.#cardsLocation.set(card, spot);
    }

    /**
     * @param {Card} card 
     */
    openCard(card) {
        card.isOpen = true;
    }

    /**
     * @param {Card} card 
     */
    closeCard(card) {
        card.isOpen = false;
    }

    suitsAll() {
        return SUITS;
    }

    ranksAll() {
        return RANKS;
    }

    /**
     * 
     * @param {object} settingFindCards
     * @param {Spot} settingFindCards.spot
     * @param {boolean} settingFindCards.useCurrentCard
     * @param {Card} settingFindCards.currentCard
     * @returns {{lastCard: Card, cards: Card[], isAvailable: boolean}}
     */
    nextCards(settingFindCards) {
        
        /** @type {Card[]} */
        const cards = [];

        /** @type {Card|undefined} */
        let card;

        if (settingFindCards.useCurrentCard) {
            card = settingFindCards.currentCard;
        } else {
            card = settingFindCards.spot.lastCard();
        }

        if (card && !card.isOpen) {

            return {
                lastCard: undefined,
                cards: [],
                isAvailable: false,
            };
            
        }

        const hashKey = `${settingFindCards.spot.name.slice(0, -1)}${card}`;

        let result = this.#hashValidСards.get(hashKey);

        if (result) {
            return result;
        }

        let suits, rank;
        if (settingFindCards.spot.name.toLowerCase().includes('pile')) {
            
            // * Если пусто:
            // 1. любая масть
            // 2. только король
            // * Если не пусто
            // 1. Следующая карта
            // 2. Только две масти

            if (card) {
                const indexRank = RANKS.indexOf(card.rank);
                if (indexRank > 0) {
                    rank = RANKS[indexRank - 1];
                    if (card.suit == SUITS.DIAMONDS || card.suit == SUITS.HEARTS) {
                        suits = [SUITS.CLUBS, SUITS.SPADES];
                    } else {
                        suits = [SUITS.DIAMONDS, SUITS.HEARTS];
                    }
                }
            } else {
                rank = RANKS[RANKS.length - 1];
                suits = [SUITS.CLUBS, SUITS.SPADES, SUITS.DIAMONDS, SUITS.HEARTS];
            }

        } else {

            // * Если пусто:
            // 1. любая масть
            // 2. только туз
            // * Если не пусто
            // 1. Следующая карта
            // 2. Только одна масть

            if (card) {
                const indexRank = RANKS.indexOf(card.rank);
                if (indexRank < RANKS.length - 1) {
                    rank = RANKS[indexRank + 1];
                    suits = [card.suit];
                }
            } else {
                rank = RANKS[0];
                suits = [SUITS.CLUBS, SUITS.SPADES, SUITS.DIAMONDS, SUITS.HEARTS];
            }

        }

        if (suits && rank) {
            for(const suit of suits) {
                cards.push(this.nameToCard(suit, rank));
            }
        }

        result = {
            lastCard: card,
            cards: cards,
            isAvailable: cards.length > 0,
        };

        this.#hashValidСards.set(hashKey, result);

        return result;
    }

    getHint() {

        const availableSteps = [];
        let areThereAnyCardsInWaste = false;
        let areThereAnyCardsInStok = false;
        const cardToFoundations = new Map();
        const settingFindCards = {
            spot: undefined,
            useCurrentCard: false,
            currentCard: undefined

        };

        /** @param {Spot[]} spots */
        const f = (spots, isFoundations = false) => {
            let empty = false;
            for (const spot of spots) {
                if (spot.quantity === 0) {
                    if (empty) continue;
                    empty = true;
                }
                settingFindCards.spot = spot;
                const result = this.nextCards(settingFindCards);
                if (!result.isAvailable) {
                    continue;
                }
                for (const currentCard of result.cards) {
                    const currentSpot = this.cardLocation(currentCard);
                    if (!currentCard.isOpen) {
                        if (currentSpot === this.#spotStok) {
                            areThereAnyCardsInStok = true;
                        }
                        continue;
                    }

                    const currentIndex = currentSpot.indexOf(currentCard);

                    const isLastCard = currentSpot.lastCard() === currentCard;

                    let price = 0;
                    if (currentSpot === this.#spotWaste) {
                        if (!isLastCard) {
                            areThereAnyCardsInWaste = true;
                            continue;
                        };
                        if (isFoundations) {
                            cardToFoundations.set(currentCard, currentSpot);
                        } else {
                            if (cardToFoundations.has(currentCard)) continue;
                            price += 5;
                        }
                    } else if (this.#spotsFoundations.includes(currentSpot)) {
                        continue;
                    } else if (this.#spotsPile.includes(currentSpot)) {
                        if (isFoundations) {
                            if (!isLastCard) continue;
                            cardToFoundations.set(currentCard, currentSpot);
                        } else {
                            if (isLastCard && cardToFoundations.has(currentCard)) continue;
                        }
                        const isOpen = currentIndex > 0 && !currentSpot.getCard(currentIndex - 1).isOpen;
                        if (!isFoundations && !isOpen) {
                            if (currentIndex || !spot.quantity) continue;
                        };
                        if (isOpen) price += 10;
                    }

                    if (isFoundations) price += 10;

                    const step = {
                        cards: currentSpot.cards.slice(currentIndex),
                        spotFrom: currentSpot,
                        spotTo: spot,
                        baseCard: result.lastCard,
                        price: price,
                    };

                    availableSteps.push(step);

                }
                  
            }
        }
        
        f(this.#spotsFoundations, true);
        f(this.#spotsPile, false);

        availableSteps.sort((a, b) => b.price - a.price);

        return {
            availableSteps: availableSteps,
            areThereAnyCardsInWaste: areThereAnyCardsInWaste,
            areThereAnyCardsInStok: areThereAnyCardsInStok,
        };
    }

    getMagicMove() {
        
        const mapCardSpot1 = new Map();
        const cards1 = [];
        const cards2 = [];

        const settingFindCards = {
            spot: undefined,
            useCurrentCard: false,
            currentCard: undefined

        };

        /** @param {Spot[]} spots */
        const f = (spots) => {
            for (const spot of spots) {
                settingFindCards.spot = spot;
                const result = this.nextCards(settingFindCards);
                if (result.isAvailable) {
                    for (const currentCard of result.cards) {
                        const currentSpot = this.cardLocation(currentCard);
                        if (!currentCard.isOpen || currentSpot === this.#spotStok) {
                            let availableSpots = mapCardSpot1.get(currentCard);
                            if (!availableSpots) {
                                mapCardSpot1.set(currentCard, [{spot: spot, baseCardTo: result.lastCard}]);
                                if (currentSpot !== this.#spotStok && currentSpot !== this.#spotWaste) {
                                    cards1.push(currentCard);
                                } else {
                                    cards2.push(currentCard);
                                }
                            } else if (availableSpots.find(item => item.spot === spot) === undefined) {
                                availableSpots.push({spot: spot, baseCardTo: result.lastCard});
                            }
                        }
                    }
                }   
            }
        }
        
        f(this.#spotsPile);
        f(this.#spotsFoundations);
        
        const fResult = (arr1, arr2, mapCardSpot, type) => {
            const arr = arr1.length > 0 ? arr1 : arr2;
            const card = arr[Math.floor(Math.random() * arr.length)];
            const spots = mapCardSpot.get(card);
            const dataSpot = spots[Math.floor(Math.random() * spots.length)];

            const spotFrom = this.cardLocation(card);
            const index = spotFrom.indexOf(card);
            const baseCardFrom = index === 0 ? undefined : spotFrom.getCard(index - 1);

            return {
                type: type,
                card: card,
                spotFrom: spotFrom,
                spotTo: dataSpot.spot,
                baseCardTo: dataSpot.baseCardTo,
                baseCardFrom: baseCardFrom,
            };
        };


        if (cards1.length === 0) {
        
            const cards3 = [];
            const cards4 = [];
            const mapCardSpot2 = new Map();
            for (const spot of this.#spotsPile) {
                if (spot.quantity < 1) {
                    continue;
                }
                const card = spot.cards.find(card => card.isOpen);
                if (!card) {
                    continue;
                }

                const indexRank = RANKS.indexOf(card.rank);
                if (indexRank >= RANKS.length - 1) {
                    continue;
                }
                const rank = RANKS[indexRank + 1];
                let suits;
                if (card.suit == SUITS.DIAMONDS || card.suit == SUITS.HEARTS) {
                    suits = [SUITS.CLUBS, SUITS.SPADES];
                } else {
                    suits = [SUITS.DIAMONDS, SUITS.HEARTS];
                }
                for (const suit of suits) {
                    const currentCard = this.nameToCard(suit, rank);
                    const currentSpot = this.cardLocation(currentCard);
                    if (currentCard.isOpen && currentSpot !== this.#spotWaste) {
                        continue;
                    }
                    let availableSpots = mapCardSpot2.get(currentCard);
                    
                    if (!availableSpots) {
                        mapCardSpot2.set(currentCard, [{spot: spot, baseCardTo: card}]);
                        if (currentSpot !== this.#spotStok && currentSpot !== this.#spotWaste) {
                            cards3.push(currentCard);
                        } else {
                            cards4.push(currentCard);
                        }
                    } else if (availableSpots.find(item => item.spot === spot) === undefined) {
                        availableSpots.push({spot: spot, baseCardTo: card});
                    }

                }
            }

            if (cards3.length > 0 || cards4.length > 0) {
                return fResult(cards3, cards4, mapCardSpot2, 'FirstCard');
            }

        }

        if (cards1.length > 0 || cards2.length > 0) {
            return fResult(cards1, cards2, mapCardSpot1, 'LastCard');
        }

        const spotsFrom = [];
        const spotsTo = [];
        for (const spot of this.#spotsPile) {
            if (spot.quantity === 0) {
                spotsTo.push(spot);
            } else if (spot.isThereAClosedCard()) {
                spotsFrom.push(spot);
            }
        }
        if (spotsFrom.length > 0 && spotsTo.length > 0) {
            
            const spotFrom = spotsFrom[Math.floor(Math.random() * spotsFrom.length)];
            const spotTo = spotsTo[Math.floor(Math.random() * spotsTo.length)];
            const cards = spotFrom.cards.filter(card => !card.isOpen);
            const card = cards[Math.floor(Math.random() * cards.length)];

            return {
                type: 'AnyClosedCard',
                card: card,
                spotFrom: spotFrom,
                spotTo: spotTo,
                baseCardTo: undefined,
                baseCardFrom: undefined,
            };
        }

        return undefined;

    }

    /**
     * 
     * @param {Card} card 
     * @returns { {card: Card, spotFrom: Spot, spotTo: Spot, indexCard: number} | undefined }
     */
    firstAvailableSpot(card) {

        const cardLocationSpot = this.cardLocation(card);

        const settingFindCards = {
            spot: undefined,
            useCurrentCard: false,
            currentCard: undefined,
        };
        
        const isCorrectSpot = (spot) => {
            if (spot == cardLocationSpot) {
                return false;
            }
            settingFindCards.spot = spot;
            const result = this.nextCards(settingFindCards);
            return result.isAvailable && result.cards.includes(card);
        }

        const indexCard = cardLocationSpot.indexOf(card);

        /** @type {Spot[]} */
        const spots = [];
        if (cardLocationSpot.lastCard() == card) {
            for (const currentSpot of this.#spotsFoundations) {
                if (isCorrectSpot(currentSpot)) {
                    return {
                        card: card,
                        spotFrom: cardLocationSpot,
                        spotTo: currentSpot,
                        indexCard: indexCard,
                    };
                }
            }
        }

        for (const currentSpot of this.#spotsPile) {
            if (isCorrectSpot(currentSpot)) {
                return {
                    card: card,
                    spotFrom: cardLocationSpot,
                    spotTo: currentSpot,
                    indexCard: indexCard,
                };
            }
        }

        return undefined;

    }

    /** 
     * @param {Card} card
     * @param {Spot} spotFrom
     * @param {Spot} spotTo
     * @param {number} index
    */
    magicMoveCard(card, spotFrom, spotTo, index = -1) {

        spotFrom.removeCard(card);
        this.#cardsLocation.set(card, spotTo);

        if (index === -1) {
            spotTo.add(card);
        } else {
            spotTo.magicAdd(card, index);
        }
    }

    /** 
     * @param {Card} card
     * @param {Spot} spot
     * @param {Card} cardTo
    */
    magicMoveCardIntoSpotFirstCard(card, spot, cardTo) {
        spot.magicMoveCardIntoSpotFirstCard(card, cardTo);
    }

    /** 
     * @param {Card} card
     * @param {Spot} spot
     * @param {Card} cardTo
    */
    undoMagicMoveCardIntoSpotFirstCard(card, spot, cardTo) {
        spot.undoMagicMoveCardIntoSpotFirstCard(card, cardTo);
    }

    /** 
     * @param {Card} card
     * @param {Spot} spot
    */
    magicMoveCardIntoSpotLastCard(card, spot) {
        spot.magicMoveCardIntoSpotLastCard(card);
    }

    /**
     * 
     * @param {string} suit 
     * @param {string} rank 
     * @returns {Card}
     */
    nameToCard(suit, rank) {
        return this.fullNameToCard(`${suit}${rank}`);
    }

    /**
     * 
     * @param {string} fullName 
     * @returns {Card}
     */
    fullNameToCard(fullName) {
        return this.#nameToCard.get(fullName);
    }

     /**
     * 
     * @param {string} name 
     * @returns {Spot}
     */
     nameToSpot(name) {
        return this.#nameToSpot.get(name);
    }

    checkFoundationsSpot() {
        for (const spot of this.#spotsFoundations) {
            if (spot.quantity < 13) {
                return false;
            }
        }
        return true;
    }

    checkPileSpot() {
        for (const spot of this.#spotsPile) {
            if (spot.isThereAClosedCard()) {
                return false;
            }
        }
        return true;
    }

    getAutoStep() {

        const settingFindCards = {
            spot: undefined,
            useCurrentCard: false,
            currentCard: undefined
        };

        /**
         * @param {Spot} spot 
         * @param {Card} card 
         */
        const isMoveValid = (spot, card) => {
            settingFindCards.spot = spot;
            const result = this.nextCards(settingFindCards);
            if (result.isAvailable) {
                return result.cards.includes(card);
            }
            return false;
        };

        /** @param {Spot[]} spots */
        const fGetAvailableSpot = (spots, card) => {
            for (const spot of spots) {
                if (isMoveValid(spot, card)) {
                    return spot;
                }
            }
            return undefined;
        };
        
        let currentCard;
        let availableSpot;

        /**
         * @param {Spot[]} spotsFrom 
         * @param {Spot[][]} arrSpotsTo 
         * @returns {{card: Card, spotFrom: Spot, spotTo: Spot}}
         */
        const fAvailableStep = (spotsFrom, arrSpotsTo) => {
            for (const spotFrom of spotsFrom) {
                if (spotFrom.isEmpty()) {
                    continue;
                }
                currentCard = spotFrom.lastCard();
                for (const spotsTo of arrSpotsTo) {
                    availableSpot = fGetAvailableSpot(spotsTo, currentCard);
                    if (availableSpot) {
                        return {
                            card: currentCard,
                            spotFrom: spotFrom,
                            spotTo: availableSpot,
                        };
                    }
                }
            }
            return undefined;
        }

        let availableStep = fAvailableStep([this.#spotWaste], [this.#spotsFoundations, this.#spotsPile]);
        if(!availableStep) {
            availableStep = fAvailableStep(this.#spotsPile, [this.#spotsFoundations]);
        }

        if(!availableStep) {

            if (!this.spotStok.isEmpty()) {
                availableStep = {
                    card: this.spotStok.lastCard(),
                    spotFrom: this.spotStok,
                    spotTo: this.spotWaste,
                };
            } else if (!this.spotWaste.isEmpty()) {
                availableStep = {
                    card: this.spotWaste.lastCard(),
                    spotFrom: this.spotWaste,
                    spotTo: this.spotStok,
                };
            }

            
        }

        return availableStep;
        
    }

    toJSON() {
        return {
            Stok: [this.#spotStok.cardsToString()],
            Waste: [this.#spotWaste.cardsToString()],
            Pile: this.#spotsPile.map(spot => spot.cardsToString()),
            Foundations: this.#spotsFoundations.map(spot => spot.cardsToString()),
        }   
    }
}

const SUITS = Object.freeze({
    CLUBS: "clubs",
    DIAMONDS: "diamonds",
    HEARTS: "hearts",
    SPADES: "spades"
});

const RANKS = Object.freeze(
    ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King']
);