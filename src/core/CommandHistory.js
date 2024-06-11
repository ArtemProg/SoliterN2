// @ts-check

/** @typedef {import("./CommandCard.js").default} CommandCard */

/** 
 * @typedef {object} UserAction
 * @property {string} name
 * @property {number} score
 * @property {CommandCard[]} commandsCard
*/

export default class CommandHistory {

    /** @type {UserAction[]} */
    #history = [];

    /** @param {UserAction} userAction */
    push(userAction) {
        this.#history.push(userAction);
    }

    /** @returns {UserAction} */
    pop() {
        return this.#history.length ? this.#history.pop() : undefined;
    }

    getHistory() {
        return [...this.#history];
    }

    /** @returns {Number}  */
    get quantity() {
        return this.#history.length;
    }

    clear() {
        this.#history.length = 0;
    }
    
    toJSON() {
        return this.#history.map(userAction =>
            [
                userAction.name,
                userAction.score,
                userAction.commandsCard.map(
                    commandCard => commandCard.toJSON()
                ),
            ]
    );
    }
}