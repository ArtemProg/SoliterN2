// @ts-check

import * as SettingDesk from "./tools/SetingDesk.js"

export default class StartScene extends Phaser.Scene {
    
    // #playerData;

    constructor() {
        super('Start');
        this.sdk = null;
        this.userSettingsManager = null;
        this.dataSessionJSON = null;
    }

    init(data) {
        this.sdk = data.sdkProvider;
        this.userSettingsManager = data.userSettingsManager;
        this.dataSessionJSON = data.dataSessionJSON;
    }

    create() {

        const cardGeometry = {
            // width: 140,
            // height: 190,
            width: 112,
            height: 172,
            offsetOpenCardY: 55,
            offsetCloseCardY: 20,
            offsetOpenCardX: 40,
            offsetDragCardY: 40,
        };


        const parentSize = {
            width: window.innerWidth,
            height: window.innerHeight,
            aspectRatio: window.innerHeight / window.innerWidth,
        };

        let settingDesk;

        if (this.game.device.os.desktop) {
            settingDesk = SettingDesk.myScaleApp_DESKTOP(cardGeometry, parentSize);
        } else if (parentSize.width > parentSize.height) {
            settingDesk = SettingDesk.myScaleApp_LANDSCAPE(cardGeometry, parentSize);
        } else {
            settingDesk = SettingDesk.myScaleApp_PORTRAIT(cardGeometry, parentSize);
        }

        this.scale.resize(settingDesk.width, settingDesk.height);
        this.cameras.resize(settingDesk.width, settingDesk.height);
        this.scale.setGameSize(settingDesk.width, settingDesk.height);

        this.scene.start('Game', {
            sdkProvider: this.sdk,
            userSettingsManager: this.userSettingsManager,
            dataSessionJSON: this.dataSessionJSON,
            cardGeometry: cardGeometry,
            settingDesk: settingDesk,
        });
    }
}