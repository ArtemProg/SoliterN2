// @ts-check
import {Observer, SubjectMixin} from './Observer.js';

export default class HintPanel extends SubjectMixin(Observer) {
    
    constructor(scene, isOpen) {
        
        super();

        const props = HintPanel.getBaseSettings(scene);

        this.scene = scene;
        this.width = props.width;
        this.height = props.height;
        this.isOpen = isOpen;

        this.scale = 1;
        
        this.container = scene.add.container();
        this.container.setSize(this.width, this.height);
        this.container.setPosition(props.x, props.y)
       
        this.shape = this.scene.add.sprite(0, 0, this.getNameTexture())
            .setAlpha(0.7)
            .setOrigin(0.5, 0.5);

        this.label = this.scene.add.text(0, 0, 'HINT')
            .setColor('#ffffff')
            .setFontSize(props.fontSize)
            .setFontFamily('Arial')
            .setOrigin(0.5, 0.5);
        
        this.container.add(this.shape);
        this.container.add(this.label);
        scene.add.existing(this.container);

        this.setVisible(this.isOpen);
        
    }

    getNameTexture() {
        const nameTexture = this.scene.getTexture(
            this.width,
            this.height,
            10,
            0x000000
        );
        return nameTexture;
    }
    
    showHint(data) {
        return new Promise(resolve => {
            this.setText(data.text);
            this.setVisible(true);
            resolve();
        });
    }

    hideHint(data) {
        return new Promise(resolve => {
            this.setVisible(false);
            resolve();
        });
    }

    setText(text) {
        this.label.setText(text);
    }

    setVisible(value) {
        this.isOpen = value;
        this.container.setVisible(this.isOpen);
    }

    static getBaseSettings(scene) {

        const isLandscape = scene.settingsResize.settingDesk.type === 'LANDSCAPE';
        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';

        const _scaleGame = window.devicePixelRatio * scene.scaleGame;
        const scaleGame = _scaleGame * (isDesktop ? 30/18 : 1);

        const posX = scene.scale.width / 2;
        const posY = scene.scale.height - 240 / scaleGame;

        return {
            width: 500 / scaleGame,
            height: 120 / scaleGame,
            fontSize: 40 / scaleGame,
            x: posX,
            y: posY,
        }
    }

    resize() {
        
        const props = HintPanel.getBaseSettings(this.scene);

        this.container.setPosition(props.x, props.y);

        this.container.setSize(this.width, this.height);

        this.shape.setTexture(this.getNameTexture())
            .setAlpha(0.7)
            .setOrigin(0.5, 0.5);

        this.label.setFontSize(props.fontSize);
    }

    onEvent(event, data) {

        if (event === 'resize') {
            this.resize();
        }
        
    }

    

}