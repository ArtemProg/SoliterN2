// @ts-check

/** @typedef {import("./Card.js").default} Card */
/** @typedef {import("./Spot.js").default} Spot */

export default class CommandCard {

    /** @type {object} */
    #receiver;
    /** @type {Card[]} */
    #cards;
    /** @type {Spot} */
    #spotFrom;
    /** @type {Spot} */
    #spotTo;
    /** @type {string} */
    #name;

    /**
     * @param {object} receiver
     * @param {string} name 
     * @param {Card[]} cards 
     * @param {Spot} spotFrom 
     * @param {Spot} spotTo 
     */
    constructor(receiver, name, cards, spotFrom, spotTo) {
        this.#receiver = receiver;
        this.#name = name;
        this.#cards = cards ? [...cards] : undefined;
        this.#spotFrom = spotFrom;
        this.#spotTo = spotTo;
    }

    async execute() {

        const method = this.#receiver[`command_${this.name}`];
        if (method == undefined) {
            return false;
        }

        const result = await method.call(this.#receiver, this.cards, this.spotFrom, this.spotTo);

        return true;
    }

    async undo() {

        const method = this.#receiver[`commandUndo_${this.name}`];
        if (method == undefined) {
            return false;
        }

        const result = await method.call(this.#receiver, this.cards, this.spotFrom, this.spotTo);

        return true;
    }

    get name() {
        return this.#name;
    }

    get cards() {
        return this.#cards ? [...this.#cards] : undefined;
    }

    get spotFrom() {
        return this.#spotFrom;
    }

    get spotTo() {
        return this.#spotTo;
    }

    toJSON () {
        return  [
            this.name,
            this.#spotFrom ? this.#spotFrom.name : '',
            this.#spotTo ? this.#spotTo.name : '',
            this.#cards ? this.#cards.map(card => card ? card.fullName : null) : [],
        ];
    }
}