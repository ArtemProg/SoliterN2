// @ts-check

/** @typedef {import("./Card.js").default} Card */
/** @typedef {import("./Croupier.js").default} Croupier */

export default class Spot {
    
    /** @type {Card[]} */
    #cards = [];

    /** @type {Croupier} */
    #croupier;

    /** @type {string} */
    #name;

    /** 
    * @param {Croupier} croupier
    * @param {string} name
    */
    constructor(croupier, name) {
        this.#croupier = croupier;
        this.#name = name;
    }

    /** @returns {Number}  */
    get quantity() {
        return this.#cards.length;
    }

    /** @returns {Card[]}  */
    get cards() {
        return [...this.#cards];
    }

    /** 
    * @param {Card[]} cards
    */
    set cards(cards) {
        this.#cards = [...cards];
    }

    /** 
     * @param {Card} card
    */
    add(card) {
        this.#cards.push(card);
    }

    /** 
     * @param {Card} card
     * @param {number} index
    */
    magicAdd(card, index) {
        this.#cards.splice(index, 0, card);
    }

    /** 
     * @param {Card} card
     * @param {Card} cardTo
    */
    magicMoveCardIntoSpotFirstCard(card, cardTo) {
        let index1 = this.#cards.indexOf(card);
        const index2 = this.#cards.indexOf(cardTo);
        if (index1 + 1 === index2) {
            return;
        }
        while (index1 + 1 < index2) {
            this.#cards[index1] = this.#cards[index1 + 1];
            index1++;
        }
        this.#cards[index1] = card;
    }

    /** 
     * @param {Card} card
     * @param {Card} cardTo
    */
    undoMagicMoveCardIntoSpotFirstCard(card, cardTo) {
        let index1 = this.#cards.indexOf(card);
        const index2 = cardTo === undefined ? 0 : this.#cards.indexOf(cardTo) + 1;
        if (index1 === index2) {
            return;
        }
        while (index1 > index2) {
            this.#cards[index1] = this.#cards[index1 - 1];
            index1--;
        }
        this.#cards[index1] = card;
    }

    /** 
     * @param {Card} card
    */
    magicMoveCardIntoSpotLastCard(card) {
        let index1 = this.#cards.indexOf(card);
        const index2 = this.#cards.length - 1;
        
        while (index1 < index2) {
            this.#cards[index1] = this.#cards[index1 + 1];
            index1++;
        }
        this.#cards[index1] = card;
    }

    pop() {
        return this.#cards.pop();
    }

    /** 
     * @param {Card} card 
     * @returns {number}
     */
    indexOf(card) {
        return this.#cards.indexOf(card);
    }

    /**
     * @param {number} index 
     */
    getCard(index) {
        return this.#cards[index];
    }

    /** 
     * @param {Card} card
     * @returns {Boolean}
    */
    removeCard(card) {
        const index = this.#cards.indexOf(card);
        if (index > -1) {
            this.#cards.splice(index, 1);
            return true;
        }
        return false;
    }

    /** @returns {string}  */
    get name() {
        return this.#name;
    }

    /** @returns {string}  */
    toString() {
        return `${this.#name} (${this.quantity})`;
    }

    /**
     * @returns {Card|undefined}
     */
    lastCard() {
        if (this.#cards.length == 0) {
            return undefined;
        }
        return this.#cards[this.#cards.length - 1];
    }

    isEmpty() {
        return this.#cards.length == 0;
    }

    isThereAClosedCard() {
        return this.cards.find(card => !card.isOpen);
    }

    clear() {
        this.#cards.forEach(card => this.#croupier.cardDeleteLocation(card));
        this.#cards.length = 0;
    }

    cardsToString() {
        return this.#cards.map(card => [card.suit, card.rank, card.isOpen]);
    }
}