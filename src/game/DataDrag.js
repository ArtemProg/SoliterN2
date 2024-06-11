// @ts-check

/** @typedef {import("../scenes/GameScene.js").default} GameScene */
/** @typedef {import("./CardGO.js").default} CardGO */
/** @typedef {import("./SpotGO.js").default} SpotGO */
/** @typedef {import("../core/Card.js").default} Card */
/** @typedef {import("../core/Spot.js").default} Spot */

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

export default class DataDrag {
    /** @type {boolean} */
    isActive = false;
    /** @type {boolean} */
    isEnd = false;
    /** @type {CardGO} */
    cardGO;
    /** @type {CardGO} */
    backupCardGO;
    /** @type {SpotGO} */
    spotGO;
    /** @type {SpotGO} */
    selectedSpotGO;
    /** @type {number} */
    x = 0;
    /** @type {number} */
    y = 0;
    /** @type {number} */
    width = 0;
    /** @type {number} */
    height = 0;
    /** @type {number} */
    indexCard = 0;
    /** @type {CardGO[]} */
    cardsGO = [];
    /** @type {availableSpot} */
    detailedInformation;
    /** @type {availableSpotGO[]} */
    availableSpotsFoundationsGO;
    /** @type {availableSpotGO[]} */
    availableSpotsPileGO;
    /** @type {object} */
    shape;

    shapeX = 4;
    shapeY = 4;
}