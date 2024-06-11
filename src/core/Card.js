// @ts-check

export default class Card {

    /** @type {String} */
    #suit;

    /** @type {String} */
    #rank;

    /** @type {Boolean} */
    #isOpen = false;

    /** 
     * @param {String} suit
     * @param {String} rank
    */
    constructor(suit, rank) {
        this.#suit = suit;
        this.#rank = rank;
    }

    /** @returns {String}  */
    get suit() {
        return this.#suit;
    }

    /** @returns {String}  */
    get rank() {
        return this.#rank;
    }

    /** @returns {String}  */
    get fullName() {
        return `${this.#suit}${this.#rank}`
    }

    /** @returns {Boolean}  */
    get isOpen() {
        return this.#isOpen;
    }

    /** @param {Boolean} value */
    set isOpen(value) {
        this.#isOpen = value;
    }

    /** @returns {String}  */
    toString() {
        return this.fullName;
    }
}