// @ts-check

/** @typedef {import("../Croupier.js").default} Croupier */
/** @typedef {import("./GameState.js").default} GameState */

export default class Caretaker {
    
    /** @type {GameState[]} */
    #gameStates = [];

    /** @type {Croupier} */
    #croupier;

    /** 
     * @param {Croupier} croupier
    */
    constructor(croupier) {
        this.#croupier = croupier;
    }

    /** 
     * @param {String} description
    */
    backup(description) {
        this.#gameStates.push(this.#croupier.save(description));
    }

    restore() {
        if (!this.#gameStates.length) {
            return;
        }

        const gameState = this.#gameStates.pop();
        this.#croupier.restore(gameState);
    }
}