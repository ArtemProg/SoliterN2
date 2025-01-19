// @ts-check

import './css/style.css';

import Phaser from 'phaser';
import BootScene from "./scenes/BootScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import StartScene from "./scenes/StartScene.js";
import GameScene from "./scenes/GameScene.js";
import UIScene from "./scenes/UIScene.js";
import YandexSDK from "./gameProvider/YandexSDK.js";
import MockSDK from "./gameProvider/MockSDK.js";
import LocalStorageSDK from "./gameProvider/LocalStorageSDK";

//import {atlasJSON} from "./core/tools/atlas.js";


window.addEventListener('load', () => {
    
    function chooseSDKProvider() {
        return new LocalStorageSDK();
        if (process.env.NODE_ENV === 'production') {
          return new YandexSDK();
        } else {
            return new LocalStorageSDK();
        }

    }

    window.sdkProvider = chooseSDKProvider();

    window.sdkProvider.loadSDK().then((data) => {

        const game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'phaser-game',
            width: window.innerWidth,
            height: window.innerHeight,
            scene: [BootScene, PreloadScene, StartScene, GameScene, UIScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            
        });
        window.focus();

    }).catch((err) => {
        console.error(err);
    });

});

document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault(); // Block multitouch gestures like pinch-to-zoom
    }
}, { passive: false });

document.addEventListener('wheel', function(event) {
    if (event.ctrlKey) {
        event.preventDefault(); // Block CTRL+wheel zoom
    }
}, { passive: false });

document.addEventListener('gesturestart', function(event) {
    event.preventDefault();  // Disable gesture events like pinch-to-zoom
});



// черный 161213ff
// красный df1128ff