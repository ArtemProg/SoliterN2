
const SUITS = ['hearts', 'spades', 'diamonds', 'clubs'];

const RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

const cardSize = {
    width: 112,
    height: 172
};

function createSpriteDescriptor(filename, x, y, width, height) {
    return {
        filename: filename,
        frame: { x: x, y: y, w: width, h: height },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: width, h: height },
        sourceSize: { w: width, h: height },
        pivot: { x: 0.5, y: 0.5 }
    };
}

function generate() {

    const frames = [];

    let posY = 0;
    //posY += cardSize.height;

    // 1. cards
    for (let i = 0; i < RANKS.length; i++, posY += cardSize.height) {
        for (let j = 0, posX = 0; j < SUITS.length; j++, posX += cardSize.width) {
            frames.push(createSpriteDescriptor(`${SUITS[j]}${RANKS[i]}`, posX, posY, cardSize.width, cardSize.height));
        }
    }

    // 2. spots
    const items2 = ['shape', 'spot', 'spotA'];
    for (let i = 0, posX = 0; i < items2.length; i++, posX += cardSize.width) {
        frames.push(createSpriteDescriptor(items2[i], posX, posY, cardSize.width, cardSize.height));
    }
    posY += cardSize.height;
    
    // 3. suits
    for (let i = 0, posX = 0; i < SUITS.length; i++, posX += cardSize.width) {
        frames.push(createSpriteDescriptor(SUITS[i], posX, posY, 79, 80));
    }
    posY += cardSize.height

    // 4. back
    const items4 = ['back1', 'back2', 'back3'];
    for (let i = 0, posX = 0; i < items4.length; i++, posX += cardSize.width) {
        frames.push(createSpriteDescriptor(items4[i], posX, posY, cardSize.width, cardSize.height));
    }
    posY += cardSize.height;

    // 5. UI
    const items5 = ['circleUI'];
    for (let i = 0, posX = 0; i < items4.length; i++, posX += 70) {
        frames.push(createSpriteDescriptor(items5[i], posX, posY, 70, 70));
    }
    posY += cardSize.height;

    const atlas = {
        frames: frames,
        meta: {
            version: "1.0",
            image: "cards.png",
            format: "RGBA8888",
            size: {
                w: cardSize.width * 4,
                h: cardSize.height * 17
            },
            scale: "1"
        }
    };

    return atlas;

}

const atlas = generate();

const atlasJSON = JSON.stringify(atlas);

export {atlasJSON};

