import Form from "./Form.js"
import Button from "./Button.js"

export default class ButtonPanel extends Form {

    baseItemSize = 0;
    btns;
    activeBtn;
    #mappedBtns;

    constructor(scene, isOpen) {
        
        const props = ButtonPanel.getBaseSettings(scene);

        super(scene, props.width, props.height, isOpen, {fillStyle: { color: 0x000000, alpha: 0.5 }});

        this.btns = [];
        this.extendShape = props.extendShape;
        this.#mappedBtns = new Map();

        this.cellSize = props.cellSize;

        props.btns.forEach((btn, index, arr) => {

            this.btns[index] = new Button(
                this,
                btn.name,
                btn.text,
                btn.timeOut,
                {texture: 'cards', frame: 'circleUI'},
                index,
                this.onButtondown,
                btn.awaitCompletion
            );
            this.#mappedBtns.set(btn.name, this.btns[index]);

        });

        this.updateLocalization();

    }

    onButtondown(btn, event) {
        
        if (this.isCooldown) {

            if (this.activeBtn?.name === 'Hint' && btn.name !== 'Hint') {
                this.scene.stopHint();
            } else {
                return false;
            }
        }

        this.activeBtn = undefined;

        if (btn.awaitCompletion) {
            this.isCooldown = true;
            this.activeBtn = btn;
        }

        const dataEvent = {name: 'buttonPanel'};
        if (btn.name === 'Settings' && event === 'onClick') {
            this.notify('onClickSettings', dataEvent);
        } else if (btn.name === 'Magic' && event === 'onClick') {
            this.notify('onClickMagic', dataEvent);
        } else if (btn.name === 'Play' && event === 'onClick') {
            this.notify('onClickPlay', dataEvent);
        } else if (btn.name === 'Hint' && event === 'onClick') {
            this.notify('onClickHint', dataEvent);
        } else if (btn.name === 'Undo' && event === 'onClick') {
            this.notify('onClickUndo', dataEvent);
        } else {
            return false;
        }

        if (!btn.awaitCompletion) {
            this.startCooldown(btn.delay);
        }
        
        return true;
    }

    getPosition(isOpen) {
        return ButtonPanel.getPosition(this.scene, this.width, this.height, isOpen);
    }

    static getPosition(scene, width, height, isOpen) {
        return {
            x: (scene.scale.width - width) / 2,
            y: scene.scale.height - height * 1.2 * (isOpen ? 1 : -1),

        };
    }

    static getBaseSettings(scene) {

        const baseItemSize = 70;

        const localization = scene.getLocalization();

        const btns = [
            {name: 'Settings', text: `${localization.btn_settings}`, timeOut: 200, awaitCompletion: false},
            {name: 'Magic', text: `${localization.btn_magic}`, timeOut: 1200, awaitCompletion: true},
            {name: 'Play', text: `${localization.btn_play}`, timeOut: 200, awaitCompletion: false},
            {name: 'Hint', text: `${localization.btn_hint}`, timeOut: 300, awaitCompletion: true},
            {name: 'Undo', text: `${localization.btn_undo}`, timeOut: 200, awaitCompletion: true},
        ];

        //let itemSize = baseItemSize / window.devicePixelRatio / scene.scaleGame;
        let itemSize = baseItemSize;

        let scale = 1;
        if (scene.settingsResize.settingDesk.type !== 'DESKTOP') {
            scale = 30 / 18;
            itemSize = itemSize * scale;
        }

        let cellSize = itemSize * 1.2;
        
        let width = cellSize * btns.length;

        if (width > scene.scale.width) {
            const _width = scene.scale.width * 0.98;
            width = _width;
            cellSize = width / btns.length;
        }
        let height = cellSize;

        return {
            baseItemSize: baseItemSize,
            btns: btns,
            itemSize: itemSize,
            cellSize: cellSize,
            width: width,
            height: height,
            scale: scale,
            extendShape: width < scene.scale.width,
        };

    }

    resize() {
        
        const props = ButtonPanel.getBaseSettings(this.scene);

        this.cellSize = props.cellSize;

        this.width = props.width;
        this.height = props.height;
        
        this.scale = 1;
        if (this.width > this.scene.scale.width) {
            const _width = this.scene.scale.width * 0.98;
            this.scale = _width / this.width;
            this.width = _width;
            this.cellSize = this.width / this.btns.length;
        }
        this.height = this.cellSize;
        
        this.extendShape = this.width < this.scene.scale.width;

        super.resize();

        this.btns.forEach((btn, index, arr) => {
            btn.resize();
        });

    }

    setUndo(value) {
        const btn = this.#mappedBtns.get('Undo');
        btn.setCanBeInteractive(this.scene.isGameRuning() && value > 0);
        this.canBeInteractive ? btn.setInteractive() : btn.disableInteractive();
    }

    setInteractiveForChild() {
        this.btns.forEach((btn) => {
            this.canBeInteractive ? btn.setInteractive() : btn.disableInteractive();
        });
    }

    onEvent(event, data) {

        super.onEvent(event, data);

        if (event === 'restartGame') {
            this.setInteractiveForChild();
        } else {

            let btn;

            if (event === 'onMagicComplite') {
                btn = this.#mappedBtns.get('Magic');
            } else if (event === 'onHintComplite') {
                btn = this.#mappedBtns.get('Hint');
            } else if (event === 'onUndoComplite') {
                btn = this.#mappedBtns.get('Undo');
            }
            if (btn) {
                let callback;
                if (btn === this.activeBtn) {
                    callback = () => {
                        this.isCooldown = false;
                        this.activeBtn = undefined;
                    }
                }
                btn.commandIsComplite(callback);
            }

        }
    }

    disableGameBtn() {
        for (const btn of this.btns) {
            if (btn.awaitCompletion) {
                btn.setCanBeInteractive(false);
            }
        }
    }

    activationGameBtn() {
        for (const btn of this.btns) {
            if (btn.awaitCompletion) {
                btn.setCanBeInteractive(true);
            }
        }
    }

    drawBackground(x, y, width, height, radius = 20) {

        if (this.extendShape) {

            super.drawBackground(x - 15, y, width + 30, height, radius);

        } else {
            super.drawBackground(x, y, width, height, radius);
        }
    }

    updateLocalization() {
        const localization = this.scene.getLocalization();
        this.#mappedBtns.get('Settings').setText(localization.btn_settings);
        this.#mappedBtns.get('Magic').setText(localization.btn_magic);
        this.#mappedBtns.get('Play').setText(localization.btn_play);
        this.#mappedBtns.get('Hint').setText(localization.btn_hint);
        this.#mappedBtns.get('Undo').setText(localization.btn_undo);
    }
}