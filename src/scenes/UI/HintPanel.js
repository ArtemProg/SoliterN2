// @ts-check
import * as observer from './Observer.js';

export default class HintPanel extends observer.SubjectMixin(observer.Observer) {
    
    constructor(scene, isOpen) {
        
        super();

        this.scene = scene;

        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';

        this.label = this.scene.add.text(0, 0, 'HINT')
            .setColor('#ffffff')
            .setText('123456789012345678901234')
            .setFontSize((isDesktop ? 30 : 40) * window.devicePixelRatio)
            .setFontFamily('Arial')
            .setOrigin(0.5, 0.5)
            .setScale(1 / window.devicePixelRatio);

        this.width = this.label.width / window.devicePixelRatio;
        this.height = this.label.height * 3 / window.devicePixelRatio;
        this.isOpen = isOpen;

        this.scale = 1;
        
        this.container = scene.add.container();
        this.container.setSize(this.width, this.height);

        this.updatePosition();
       
        this.shape = this.scene.add.sprite(0, 0, this.getNameTexture())
            .setAlpha(0.7)
            .setOrigin(0.5, 0.5);

        this.container.add(this.shape);
        this.container.add(this.label);
        scene.add.existing(this.container);

        this.setVisible(this.isOpen);
        
    }

    updatePosition() {
        let separatorY = 0
        {
            let itemSize = 70;
            let scale = 1;
            if (this.scene.settingsResize.settingDesk.type !== 'DESKTOP') {
                scale = 30 / 18;
                itemSize = itemSize * scale;
            }
            let cellSize = itemSize * 1.2;
            separatorY += cellSize;
        }
        this.container.setPosition(this.scene.scale.width / 2, this.scene.scale.height - this.height - separatorY);
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

        let separatorY = 0
        {
            let itemSize = 70;
            let scale = 1;
            if (scene.settingsResize.settingDesk.type !== 'DESKTOP') {
                scale = 30 / 18;
                itemSize = itemSize * scale;
            }
            let cellSize = itemSize * 1.2;
            separatorY += cellSize;
        }

        const height = 120 / scaleGame;

        const posX = scene.scale.width / 2;
        const posY = scene.scale.height - height - separatorY;

        return {
            width: 500 / scaleGame,
            height: height,
            fontSize: (isDesktop ? 30 : 40) *  window.devicePixelRatio,
            x: posX,
            y: posY,
        }
    }

    resize() {
        
        //const props = HintPanel.getBaseSettings(this.scene);

        this.updatePosition();

        //this.container.setSize(this.width, this.height);

        // this.shape.setTexture(this.getNameTexture())
        //     .setAlpha(0.7)
        //     .setOrigin(0.5, 0.5);

        //this.label.setFontSize(props.fontSize);
    }

    onEvent(event, data) {

        if (event === 'resize') {
            this.resize();
        }
        
    }

    

}