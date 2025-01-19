import Form from "./Form.js"
import BaseButton from "./BaseButton.js"

export default class PlayPanel extends Form {

    baseItemSize = 0;
    btns = [];

    // New Game
    // Replay
    // Close
    constructor(scene, isOpen) {
        
        const props = PlayPanel.getBaseSettings(scene);

        super(scene, props.width, props.height, isOpen, {fillStyle: { color: 0x000000, alpha: 0.85  }});

        // this.cellSize = props.cellSize;

        // props.btns.forEach((btn, index, arr) => {

        //     this.btns[index] = new Button(this, btn.name, btn.name, {texture: 'cards', frame: 'circleUI'}, index);

        // });
        
        // const scaleGame = window.devicePixelRatio * scene.scaleGame;
        // const width = 500 / scaleGame;
        // const height = 130  / scaleGame;
        // const posX = this.width / 2;
        // const posY1 = 120  / scaleGame;
        // const posY2 = posY1 + height + 30 / scaleGame;
        // const posY3 = this.height - 100 / scaleGame;

        const localization = scene.cache.json.get('localization');

        const color = 0xffffff;

        this.btns[0] = new BaseButton(
            props.btn.posX,
            props.btn.posY1,
            props.btn.width,
            props.btn.height,
            color,
            this,
            {name: 'NewGame', text: `${localization.btn_new_game}`, fontSize: props.btn.fontSize, texture: 'plus'},
            this.onButtondown
        ).setOrigin(0.4);

        this.btns[1] = new BaseButton(
            props.btn.posX,
            props.btn.posY2,
            props.btn.width,
            props.btn.height,
            color,
            this,
            {name: 'Replay', text: `${localization.btn_replay}`, fontSize: props.btn.fontSize, texture: 'replay'},
            this.onButtondown
        ).setOrigin(0.4);

        this.btns[2] = new BaseButton(
            props.btn.posX,
            props.btn.posY3,
            props.btn.width,
            props.btn.height,
            color,
            this,
            {name: 'Close', text: `${localization.btn_close}`, fontSize: props.btn.fontSize, texture: 'close'},
            this.onButtondown
        ).setOrigin(0.4);

    }

    onButtondown(btn, event) {
        
        if (this.isCooldown) return;

        const dataEvent = {name: 'playPanel'};
        if (btn.name === 'NewGame' && event === 'onClick') {
            this.notify('onClickNewGame', dataEvent);
        } else if (btn.name === 'Replay' && event === 'onClick') {
            this.notify('onClickReplay', dataEvent);
        } else if (btn.name === 'Close' && event === 'onClick') {
            this.notify('onClickClose', dataEvent);
        }

        this.startCooldown(btn.delay);
    }

    getPosition(isOpen) {
        return {
            x: (this.scene.scale.width - this.width) / 2,
            y: isOpen ? (this.scene.scale.height - this.height) / 2 : - this.height - 10,
        };
    }

    // getPosition(isOpen) {
    //     return ButtonPanel.getPosition(this.scene, this.width, this.height, isOpen);
    // }

    // static getPosition(scene, width, height, isOpen) {
    //     return {
    //         x: (scene.scale.width - width) / 2,
    //         y: scene.scale.height - height * 1.1 * (isOpen ? 1 : -1),

    //     };
    // }

    static getBaseSettings(scene) {

        const btns = [
            {name: 'NewGame', text: 'New Game', timeOut: 500},
            {name: 'Replay', text: 'Replay', timeOut: 1200},
            {name: 'Close', text: 'Close', timeOut: 1500},
        ];

        const isLandscape = scene.settingsResize.settingDesk.type === 'LANDSCAPE';
        const isPortrait = scene.settingsResize.settingDesk.type === 'PORTRAIT';
        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';
        
        let scaleGame = window.devicePixelRatio * scene.scaleGame * (isDesktop ? 2 : 1);

        let width = 600 / scaleGame;

        if (width >= scene.scale.width * (isPortrait ? 0.8 : 0.5)) {
            width = scene.scale.width * (isPortrait ? 0.8 : 0.5);
            scaleGame = 600 / width;
        }

        let height = isLandscape ? scene.scale.height : 190 * 4 / scaleGame;

        const btn_width = 500 / scaleGame;
        const btn_height = 130 / scaleGame;

        const pecentY = isLandscape ? 1.2 : 1;

        const btn_posX = width / 2;
        const btn_posY1 = btn_height * (isLandscape ? 1.2 : 2.2);
        const btn_posY2 = btn_posY1 + btn_height + 30 / scaleGame;
        const btn_posY3 = height - btn_height;

        return {
            btns: btns,
            btn: {
                width: btn_width,
                height: btn_height,
                posX: btn_posX,
                posY1: btn_posY1,
                posY2: btn_posY2,
                posY3: btn_posY3,
                fontSize: 60 / scaleGame,
                spriteScale: 1 / scaleGame,
            },
            width: width,
            height: height,
        };

    }

    resize() {
        
        const props = PlayPanel.getBaseSettings(this.scene);

        this.width = props.width;
        this.height = props.height;

        super.resize();
        
        this.btns[0].setSize(props.btn.width, props.btn.height);
        this.btns[1].setSize(props.btn.width, props.btn.height);
        this.btns[2].setSize(props.btn.width, props.btn.height);
        
        this.btns[0].setScaleSprite(props.btn.spriteScale);
        this.btns[1].setScaleSprite(props.btn.spriteScale);
        this.btns[2].setScaleSprite(props.btn.spriteScale);
        
        this.btns[0].setFontSize(props.btn.fontSize);
        this.btns[1].setFontSize(props.btn.fontSize);
        this.btns[2].setFontSize(props.btn.fontSize);

        this.btns[0].setPosition(props.btn.posX, props.btn.posY1);
        this.btns[1].setPosition(props.btn.posX, props.btn.posY2);
        this.btns[2].setPosition(props.btn.posX, props.btn.posY3);


        
    }
}