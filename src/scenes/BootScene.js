// @ts-check

// import {COLOR} from "../core/tools/constants.js"

import UserSettingsManager from "../game/UserSettingsManager.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
        this.sdk = null;
        this.userSettingsManager = null;
    }

    init() {
        this.sdk = window.sdkProvider;
    }

    preload() {
        // this.scene.launch('Preload');
    }

    async create() {

        this.sdk.init()
            .then(() => {
                this.userSettingsManager = new UserSettingsManager(this.sdk);
                return this.userSettingsManager.loadSettings();
            })
            .then(() => {
                this.scene.start('Preload', { sdkProvider: this.sdk, userSettingsManager: this.userSettingsManager });
            })
            .catch(err => {
                console.error('Failed to initialize SDK in BootScene:', err);
            });

        //  const settings = {
        //     background: 0x17B978,
        //     red: 0xFF0000,
        //     black: 0x000000,
        // };
        // this.registry.set('settings', settings);

        // this.cameras.main.setBackgroundColor(settings.background);

        //this.cameras.main.setBackgroundColor(COLOR.BACKGROUND);

    }
}