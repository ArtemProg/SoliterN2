// @ts-check
const settingDesk = new Map();

function getFullName(name, parentSize) {
    return `${name}_${parentSize.width}x${parentSize.height}x${ Math.round((parentSize.aspectRatio + Number.EPSILON) * 1000) / 1000 }`;
}

function myScaleApp_LANDSCAPE1(cardGeometry, parentSize) {

    const PERCENT_WIDTH_CARD_FROM_SCREEN = 0.064;
    const PERCENT_DASHBOARD_Y = 0.06;
    const PERCENT_SEPARATOR_Y_1 = 0.018;
    const PERCENT_SEPARATOR_Y_2 = 0.016;
    const PERCENT_COLUMN_1 = 0.23;
    const PERCENT_COLUMN_2 = 0.53;
    const PERCENT_COLUMN_3 = 0.24;
    const PERCENT_SEPARATOR_X = 0.012;
    const PERCENT_STOK_CENTRE_Y = 0.555;
    
    const screenWidth = cardGeometry.width / PERCENT_WIDTH_CARD_FROM_SCREEN;
    const screenHeight = parentSize.aspectRatio > 1
        ? screenWidth / parentSize.aspectRatio
        : screenWidth * parentSize.aspectRatio;
    
    const column1 = Math.round(screenWidth * PERCENT_COLUMN_1);
    const column2 = Math.round(screenWidth * PERCENT_COLUMN_2);
    const column3 = Math.round(screenWidth * PERCENT_COLUMN_3);
    const separatorX = Math.round(screenWidth * PERCENT_SEPARATOR_X);
    const dashboardY = Math.round(screenHeight * PERCENT_DASHBOARD_Y);
    const separatorY1 = Math.round(screenHeight * PERCENT_SEPARATOR_Y_1);
    const separatorY2 = Math.round(screenHeight * PERCENT_SEPARATOR_Y_2);

    const column1PosY = (screenHeight - dashboardY) / 2 - cardGeometry.height * 2 - separatorY2 - separatorY2 / 2;

    const funRow = num => Math.round(dashboardY + column1PosY + (cardGeometry.height + separatorY2) * (num - 1));
    
    const column2PosY = dashboardY + separatorY1;
    
    const funColumn2PosX = num => Math.round(column1 + (cardGeometry.width + separatorX) * (num - 1));
    
    const column1PosX = Math.round(column1 / 2 - cardGeometry.width / 2);
    
    const column3StokPosX = Math.round(column1 + column2 + column3 / 2 - cardGeometry.width / 2);
    const column3StokPosY = Math.round(PERCENT_STOK_CENTRE_Y * screenHeight - cardGeometry.height / 2);
    const column3WastePosX = Math.round(column1 + column2 + column3 / 2 - (cardGeometry.offsetOpenCardX * 2 + cardGeometry.width) / 2);
    const column3WastePosY = Math.round(column3StokPosY - cardGeometry.height - cardGeometry.height * 0.55);

    const positionsSpots = 
    [
        {
            name: "spotStok",
            spots: [
                {x: column3StokPosX, y: column3StokPosY},
            ]
        },
        {
            name: "spotWaste",
            spots: [
                {x: column3WastePosX, y: column3WastePosY},
                
            ]
        },
        {
            name: "spotsFoundations",
            spots: [
                {x: column1PosX, y: funRow(1)},
                {x: column1PosX, y: funRow(2)},
                {x: column1PosX, y: funRow(3)},
                {x: column1PosX, y: funRow(4)},
            ]
        },
        {
            name: "spotsPile",
            spots: [
                {x: funColumn2PosX(1), y: column2PosY},
                {x: funColumn2PosX(2), y: column2PosY},
                {x: funColumn2PosX(3), y: column2PosY},
                {x: funColumn2PosX(4), y: column2PosY},
                {x: funColumn2PosX(5), y: column2PosY},
                {x: funColumn2PosX(6), y: column2PosY},
                {x: funColumn2PosX(7), y: column2PosY},
            ]
        },
    ];

    return {
        type: 'LANDSCAPE',
        width: Math.round(screenWidth),
        height: Math.round(screenHeight),
        positionSpot: positionsSpots,
        dashboardHeight: dashboardY,
        activeDesk: {start: column1PosX, end: column3StokPosX + cardGeometry.width},
    }
    
}

function myScaleApp_LANDSCAPE(cardGeometry, parentSize) {

    const fullName = getFullName('landscape', parentSize);

    let data = settingDesk.get(fullName);

    if (data) {
        return data;
    }

    const PERCENT_HEIGHT_CARD_FROM_SCREEN = 0.210;
    const PERCENT_DASHBOARD_Y = 0.287;
    const PERCENT_SEPARATOR_Y_1 = 0.080;
    const PERCENT_SEPARATOR_Y_2 = 0.086;

    const PERCENT_COLUMN_1 = parentSize.aspectRatio > 0.7 ? 0.2 : 0.23;
    const PERCENT_COLUMN_2 = 0.53;
    const PERCENT_COLUMN_3 = parentSize.aspectRatio > 0.7 ? 0.27 : 0.24;
    const PERCENT_SEPARATOR_X = 0.012;
    const PERCENT_STOK_CENTRE_Y = 0.555;
    
    let screenHeight = cardGeometry.height / PERCENT_HEIGHT_CARD_FROM_SCREEN;
    let screenWidth = parentSize.aspectRatio > 1
        ? screenHeight * parentSize.aspectRatio
        : screenHeight / parentSize.aspectRatio;

    if (screenWidth < cardGeometry.width * 14) {
        screenWidth = cardGeometry.width * 14;
        screenHeight = parentSize.aspectRatio > 1
            ? screenWidth / parentSize.aspectRatio
            : screenWidth * parentSize.aspectRatio;
    }

    //const screenWidth = cardGeometry.width / PERCENT_WIDTH_CARD_FROM_SCREEN;
    // const screenHeight = parentSize.aspectRatio > 1
    //     ? screenWidth / parentSize.aspectRatio
    //     : screenWidth * parentSize.aspectRatio;
    
    const column1 = Math.round(screenWidth * PERCENT_COLUMN_1);
    const column2 = Math.round(screenWidth * PERCENT_COLUMN_2);
    const column3 = Math.round(screenWidth * PERCENT_COLUMN_3);
    const separatorX = Math.round(screenWidth * PERCENT_SEPARATOR_X);
    const dashboardY = Math.round(cardGeometry.height * PERCENT_DASHBOARD_Y);
    const separatorY1 = Math.round(cardGeometry.height * PERCENT_SEPARATOR_Y_1);
    const separatorY2 = Math.round(cardGeometry.height * PERCENT_SEPARATOR_Y_2);

    const column1PosY = (screenHeight - dashboardY) / 2 - separatorY1 - cardGeometry.height * 2 - separatorY2 - separatorY2 / 2;

    const funRow = num => Math.round(dashboardY + column1PosY + (cardGeometry.height + separatorY2) * (num - 1));
    
    
    
    const column2PosY = dashboardY + separatorY1;
    
    const funColumn2PosX = num => Math.round(column1 + (cardGeometry.width + separatorX) * (num - 1));
    
    const column1PosX = Math.round(column1 / 2 - cardGeometry.width / 2);
    
    const column3StokPosX = Math.round(column1 + column2 + column3 / 2 - cardGeometry.width / 2);
    const column3StokPosY = Math.round(PERCENT_STOK_CENTRE_Y * screenHeight - cardGeometry.height / 2);
    const column3WastePosX = Math.round(column1 + column2 + column3 / 2 - (cardGeometry.offsetOpenCardX * 2 + cardGeometry.width) / 2);
    const column3WastePosY = Math.round(column3StokPosY - cardGeometry.height - cardGeometry.height * 0.55);

    const positionsSpots = 
    [
        {
            name: "spotStok",
            spots: [
                {x: column3StokPosX, y: column3StokPosY},
            ]
        },
        {
            name: "spotWaste",
            spots: [
                {x: column3WastePosX, y: column3WastePosY},
                
            ]
        },
        {
            name: "spotsFoundations",
            spots: [
                {x: column1PosX, y: funRow(1)},
                {x: column1PosX, y: funRow(2)},
                {x: column1PosX, y: funRow(3)},
                {x: column1PosX, y: funRow(4)},
            ]
        },
        {
            name: "spotsPile",
            spots: [
                {x: funColumn2PosX(1), y: column2PosY},
                {x: funColumn2PosX(2), y: column2PosY},
                {x: funColumn2PosX(3), y: column2PosY},
                {x: funColumn2PosX(4), y: column2PosY},
                {x: funColumn2PosX(5), y: column2PosY},
                {x: funColumn2PosX(6), y: column2PosY},
                {x: funColumn2PosX(7), y: column2PosY},
            ]
        },
    ];

    data = {
        type: 'LANDSCAPE',
        width: Math.round(screenWidth),
        height: Math.round(screenHeight),
        positionSpot: positionsSpots,
        dashboardHeight: dashboardY,
        activeDesk: {start: column1PosX, end: column3StokPosX + cardGeometry.width},
    };

    settingDesk.set(fullName, data);

    return data;
    
}

function myScaleApp_PORTRAIT(cardGeometry, parentSize) {

    const fullName = getFullName('portrait', parentSize);

    let data = settingDesk.get(fullName);

    if (data) {
        return data;
    }

    const PERCENT_WIDTH_SEPARATOR_FROM_CARD_1 = 0.055;
    const PERCENT_WIDTH_SEPARATOR_FROM_CARD_2 = 0.1;
    const PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_1 = 0.030;
    const PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_2 = parentSize.aspectRatio > 2.0 ? 0.035 : 0.035 / 2.0 / parentSize.aspectRatio;
    const PERCENT_HEIGHT_DASHBOARD_FROM_SCREEN = 0.010;

    const separatorX_1 = Math.round(cardGeometry.width * PERCENT_WIDTH_SEPARATOR_FROM_CARD_1);
    const separatorX_2 = Math.round(cardGeometry.width * PERCENT_WIDTH_SEPARATOR_FROM_CARD_2);
   
    let screenWidth = cardGeometry.width * 7 + separatorX_1 * 2 + separatorX_2 * 6;
    let screenHeight = parentSize.aspectRatio > 1
        ? screenWidth * parentSize.aspectRatio
        : screenWidth / parentSize.aspectRatio;

    let deltaSeparatorX = 0;
    if (20 * cardGeometry.offsetOpenCardY + cardGeometry.height > screenHeight) {
        screenHeight = 20 * cardGeometry.offsetOpenCardY + cardGeometry.height;
        const baseWidth = screenWidth;
        screenWidth = parentSize.aspectRatio > 1
            ? screenHeight / parentSize.aspectRatio
            : screenHeight * parentSize.aspectRatio;
        
            deltaSeparatorX = (screenWidth - baseWidth) / 8;
    }

    const separatorY1 = Math.round(screenHeight * PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_1);
    const separatorY2 = Math.round(screenHeight * PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_2);
    const dashboardY = Math.round(screenHeight * PERCENT_HEIGHT_DASHBOARD_FROM_SCREEN);

    const minHeight = 12 * cardGeometry.offsetOpenCardY + 6 * cardGeometry.offsetCloseCardY + 2 * cardGeometry.height + separatorY1 + separatorY2 + dashboardY;

    const funPosX = column => separatorX_1 + deltaSeparatorX + (separatorX_2 + cardGeometry.width + deltaSeparatorX) * (column - 1);

    const row1 = dashboardY + separatorY1;
    const row2 = row1 + cardGeometry.height + separatorY2;

    const positionsSpots = 
    [
        {
            name: "spotStok",
            spots: [
                {x: funPosX(7), y: row1},
            ]
        },
        {
            name: "spotWaste",
            spots: [
                {x: funPosX(5) + (funPosX(6) + cardGeometry.width - funPosX(5)) / 2 - (cardGeometry.offsetOpenCardX * 2 + cardGeometry.width) / 2, y: row1},
                
            ]
        },
        {
            name: "spotsFoundations",
            spots: [
                {x: funPosX(1), y: row1},
                {x: funPosX(2), y: row1},
                {x: funPosX(3), y: row1},
                {x: funPosX(4), y: row1},
            ]
        },
        {
            name: "spotsPile",
            spots: [
                {x: funPosX(1), y: row2},
                {x: funPosX(2), y: row2},
                {x: funPosX(3), y: row2},
                {x: funPosX(4), y: row2},
                {x: funPosX(5), y: row2},
                {x: funPosX(6), y: row2},
                {x: funPosX(7), y: row2},
            ]
        },
    ];

    data = {
        type: 'PORTRAIT',
        width: Math.round(screenWidth),
        height: Math.round(screenHeight),
        positionSpot: positionsSpots,
        dashboardHeight: dashboardY,
        activeDesk: {start: funPosX(1), end: funPosX(7) + cardGeometry.width},
    };

    settingDesk.set(fullName, data);

    return data;
    
}

function myScaleApp_DESKTOP(cardGeometry, parentSize) {

    const fullName = getFullName('desktop', parentSize);

    let data = settingDesk.get(fullName);

    if (data) {
        return data;
    }

    const PERCENT_HEIGHT_CARD_FROM_SCREEN = 0.176;
    const PERCENT_WIDTH_SEPARATOR_FROM_CARD = 0.272;
    const PERCENT_WIDTH_SEPARATOR_FROM_SCREEN = 0.019;
    const PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_1 = 0.001;
    const PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_2 = 0.030;
    const PERCENT_HEIGHT_DASHBOARD_FROM_SCREEN = 0.043;
    
    let screenHeight = cardGeometry.height / PERCENT_HEIGHT_CARD_FROM_SCREEN;
    let screenWidth = screenHeight / parentSize.aspectRatio;
        
    if (cardGeometry.width * 8 > screenWidth) {
        screenWidth = cardGeometry.width * 9;
        screenHeight = screenWidth * parentSize.aspectRatio;
    }

    const separatorX = Math.round(screenWidth * PERCENT_WIDTH_SEPARATOR_FROM_SCREEN);
    const deltaX = screenWidth / 2 - (cardGeometry.width * 7 + separatorX * 6) / 2;

    const separatorY1 = Math.round(screenHeight * PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_1);
    const separatorY2 = Math.round(screenHeight * PERCENT_HEIGHT_SEPARATOR_FROM_SCREEN_2);
    const dashboardY = Math.round(screenHeight * PERCENT_HEIGHT_DASHBOARD_FROM_SCREEN);

    const row1 = dashboardY + separatorY1;
    const row2 = row1 + cardGeometry.height + separatorY2;
  
    const funPosX = column =>  deltaX + (cardGeometry.width + separatorX) * (column - 1);

    const positionsSpots = 
    [
        {
            name: "spotStok",
            spots: [
                {x: funPosX(7), y: row1},
            ]
        },
        {
            name: "spotWaste",
            spots: [
                {x: funPosX(5) + (funPosX(6) + cardGeometry.width - funPosX(5)) / 2 - (cardGeometry.offsetOpenCardX * 2 + cardGeometry.width) / 2, y: row1},
                
            ]
        },
        {
            name: "spotsFoundations",
            spots: [
                {x: funPosX(1), y: row1},
                {x: funPosX(2), y: row1},
                {x: funPosX(3), y: row1},
                {x: funPosX(4), y: row1},
            ]
        },
        {
            name: "spotsPile",
            spots: [
                {x: funPosX(1), y: row2},
                {x: funPosX(2), y: row2},
                {x: funPosX(3), y: row2},
                {x: funPosX(4), y: row2},
                {x: funPosX(5), y: row2},
                {x: funPosX(6), y: row2},
                {x: funPosX(7), y: row2},
            ]
        },
    ];

    data = {
        type: 'DESKTOP',
        width: Math.round(screenWidth),
        height: Math.round(screenHeight),
        positionSpot: positionsSpots,
        dashboardHeight: dashboardY,
        activeDesk: {start: funPosX(1), end: funPosX(7) + cardGeometry.width},
    };

    settingDesk.set(fullName, data);

    return data;

    // const screenWidth = cardGeometry.width * 7 + distance * 8;
    // let screenHeight;
    // {
    //     // if (parentSize.aspectRatio > 1) {
    //         screenHeight =  screenWidth * parentSize.aspectRatio;
    //     // } else {
    //     //     screenHeight =  screenWidth / parentSize.aspectRatio;
    //     // }
    // }

    // const positionsSpots = 
    // [
    //     {
    //         name: "spotStok",
    //         spots: [
    //             // {x: distance, y: distance}
    //             {x: distance + 6 * cardGeometry.width + (distance * 1) * 6, y: distance},
    //         ]
    //     },
    //     {
    //         name: "spotWaste",
    //         spots: [
    //             // {x: distance * 3 + this.cardSize.width, y: distance}
    //             {x: distance + 4 * cardGeometry.width + (distance * 1) * 4, y: distance},
                
    //         ]
    //     },
    //     {
    //         name: "spotsFoundations",
    //         spots: [
    //             {x: distance + 0 * cardGeometry.width + (distance * 1) * 0, y: distance},
    //             {x: distance + 1 * cardGeometry.width + (distance * 1) * 1, y: distance},
    //             {x: distance + 2 * cardGeometry.width + (distance * 1) * 2, y: distance},
    //             {x: distance + 3 * cardGeometry.width + (distance * 1) * 3, y: distance},
    //         ]
    //     },
    //     {
    //         name: "spotsPile",
    //         spots: [
    //             {x: 0 * cardGeometry.width + distance + (distance * 1) * 0, y: cardGeometry.height + distance * 4},
    //             {x: 1 * cardGeometry.width + distance + (distance * 1) * 1, y: cardGeometry.height + distance * 4},
    //             {x: 2 * cardGeometry.width + distance + (distance * 1) * 2, y: cardGeometry.height + distance * 4},
    //             {x: 3 * cardGeometry.width + distance + (distance * 1) * 3, y: cardGeometry.height + distance * 4},
    //             {x: 4 * cardGeometry.width + distance + (distance * 1) * 4, y: cardGeometry.height + distance * 4},
    //             {x: 5 * cardGeometry.width + distance + (distance * 1) * 5, y: cardGeometry.height + distance * 4},
    //             {x: 6 * cardGeometry.width + distance + (distance * 1) * 6, y: cardGeometry.height + distance * 4},
    //         ]
    //     },
    // ];

    return {
        width: Math.round(cardGeometry.width * 8),
        height: Math.round(screenHeight),
        // positionSpot: positionsSpots,
    }

}

export {myScaleApp_PORTRAIT, myScaleApp_LANDSCAPE, myScaleApp_DESKTOP};