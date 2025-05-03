import Form from "./Form.js"
import BaseButton from "./BaseButton.js"

export default class WonPanel extends Form {

    baseItemSize = 0;
    btns = [];

    constructor(scene, isOpen) {

        const props = WonPanel.getBaseSettings(scene);

        super(scene, props.width, props.height, isOpen, {fillStyle: { color: 0x000000, alpha: 0.85  }});

        this.scaleGame = props.scaleGame;

        const dataTitle = props.title;
        this.title = this.scene.add.text(dataTitle.posX, dataTitle.posY, `label_won`)
            .setColor('#ffffff')
            .setFontSize(dataTitle.fontSize)
            .setFontFamily('Arial')
            .setOrigin(0.5, 0.5);
        this.add(this.title);

        const dataCell = props.cell;
        this.score = this.createCell(dataCell.posX1, `label_score`, '0', dataCell.fontSize);
        this.time = this.createCell(dataCell.posX2, `label_time`, '00:00', dataCell.fontSize);
        this.moves = this.createCell(dataCell.posX3, `label_moves`, '0', dataCell.fontSize);

        const color = 0xffffff;

        this.bestTitle = this.scene.add.text(this.width / 2, this.posY(4), `best_title`)
            .setColor('#ffffff')
            .setFontSize(dataCell.fontSize * 0.8)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5)
            .setVisible(false);
        
        this.bestScore = this.scene.add.text(dataCell.posX1, this.posY(5), '0')
            .setColor('#ffffff')
            .setFontSize(dataCell.fontSize * 0.8)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5)
            .setVisible(false);
        
        this.bestTime = this.scene.add.text(dataCell.posX2, this.posY(5), '00:00')
            .setColor('#ffffff')
            .setFontSize(dataCell.fontSize * 0.8)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5)
            .setVisible(false);
        
        this.bestMoves = this.scene.add.text(dataCell.posX3, this.posY(5), '0')
            .setColor('#ffffff')
            .setFontSize(dataCell.fontSize * 0.8)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5)
            .setVisible(false);

        this.add(this.bestTitle);
        this.add(this.bestScore);
        this.add(this.bestTime);
        this.add(this.bestMoves);

        this.btns[0] = new BaseButton(
            props.btn.posX1,
            props.btn.posY,
            props.btn.width,
            props.btn.height,
            color,
            this,
            {name: 'Menu', text: `btn_menu`, fontSize: props.btn.fontSize},
            this.onButtondown
        );

        this.btns[1] = new BaseButton(
            props.btn.posX2,
            props.btn.posY,
            props.btn.width,
            props.btn.height,
            color,
            this,
            {name: 'NewGame', text: `btn_new_game`, fontSize: props.btn.fontSize},
            this.onButtondown
        );

        this.updateLocalization();
        
    }

    posY(row) {
        if (row === 1) {
            return 200 / this.scaleGame;
        } else if (row === 2) {
            return 250 / this.scaleGame;
        } else if (row === 3) {
            return 300 / this.scaleGame;
        } else if (row === 4) {
            return 400 / this.scaleGame;
        } else if (row === 5) {
            return 450 / this.scaleGame;
        }
        
        return 0;
    }

    createCell(x, title, value, fontSize) {

        const labelTitle = this.scene.add.text(x, this.posY(1), title)
            .setColor('#ffffff')
            .setFontSize(fontSize)
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5);

        const image = this.scene.add.sprite(x, this.posY(2), 'icons', 'star')
            .setOrigin(0.5, 0.5)
            .setAlpha(0.85)
            .setVisible(false);

        const labelValue = this.scene.add.text(x, this.posY(3), value)
            .setColor('#ffffff')
            .setFontSize(fontSize)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setOrigin(0.5, 0.5);

        this.add(labelTitle);
        this.add(image);
        this.add(labelValue);

        const tween = this.scene.tweens.add({
            targets: image,
            angle: '+=60',
            duration: 1500,
            scale: '+=0.25',
            ease: 'Linear',
            yoyo: true,
            paused: true,
            repeat: -1
        });

        return {
            title: labelTitle,
            image: image,
            tween: tween,
            value: labelValue,
            setFontSize: (fontSize) => {
                labelTitle.setFontSize(fontSize);
                labelValue.setFontSize(fontSize);
            },
            setScaleImage(scale) {
                image.setScale(scale);
            },
            setPositionX: (posX) => {
                labelTitle.setPosition(posX, this.posY(1));
                image.setPosition(posX, this.posY(2));
                labelValue.setPosition(posX, this.posY(3));
            },
            setText: (text) => {
                labelTitle.setText(text);
            },
        };
    }

    open() {

        const bestResult = this.scene.getBestResult();
        if (bestResult.score) {
            this.bestTitle.setVisible(true);
            this.bestScore.setText(bestResult.score).setVisible(true);
            this.bestTime.setText(this.scene.formatTime(bestResult.time)).setVisible(true);
            this.bestMoves.setText(bestResult.moves).setVisible(true);
        } else {
            this.bestTitle.setVisible(false);
            this.bestScore.setVisible(false);
            this.bestTime.setVisible(false);
            this.bestMoves.setVisible(false);
        }

        this.scene.time.delayedCall(200, () => {
            
            this.score.value.setText(this.scene.getScore());
            this.time.value.setText(this.scene.formatTime(this.scene.getTime()));
            this.moves.value.setText(this.scene.getMoves());

        });

        if (this.scene.getScore() > bestResult.score) {
            this.score.image.setVisible(true);
            this.score.tween.resume();
        } else {
            this.score.image.setVisible(false);
        }

        if (this.scene.getTime() < bestResult.time || bestResult.time === 0) {
            this.time.image.setVisible(true);
            this.time.tween.resume();
        } else {
            this.time.image.setVisible(false);
        }

        if (this.scene.getMoves() < bestResult.moves || bestResult.moves === 0) {
            this.moves.image.setVisible(true);
            this.moves.tween.resume();
        } else {
            this.moves.image.setVisible(false);
        }

        this.btns[1].resumeTween();

        return super.open();
    }

    close() {

        this.btns[1].pauseTween();

        this.moves.tween.pause();
        this.time.tween.pause();
        this.score.tween.pause();

        return super.close();
    }

    onButtondown(btn, event) {
        
        if (this.isCooldown) return;

        const dataEvent = {name: 'wonPanel'};
        if (btn.name === 'Menu' && event === 'onClick') {
            this.notify('onClickMenu', dataEvent);
        } else if (btn.name === 'NewGame' && event === 'onClick') {
            this.notify('onClickNewGame', dataEvent);
        }

        this.startCooldown(btn.delay);
    }

    getPosition(isOpen) {
        return {
            x: (this.scene.scale.width - this.width) / 2,
            y: isOpen ? (this.scene.scale.height - this.height) / 2 : - this.height - 10,
        };
    }

    static getBaseSettings(scene) {

        const btns = [
            {name: 'Menu', text: 'Menu', timeOut: 500},
            {name: 'NewGame', text: 'New Game', timeOut: 500},
        ];

        
        const isLandscape = scene.settingsResize.settingDesk.type === 'LANDSCAPE';
        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';
        
        const _scaleGame = window.devicePixelRatio * scene.scaleGame;
        const scaleGame = _scaleGame * (isDesktop ? 30/18 : (window.devicePixelRatio > 2.5 ? 0.7 : 1));


        const scaleGame2 = isDesktop ? 1.5 : 0.8;//window.devicePixelRatio * scene.scaleGame * (isDesktop ? 2 : 1);

        // let width = 600 / scaleGame;
        // let height = isLandscape ? scene.scale.height : 190 * 4 / scaleGame;

        let width = 600 / scaleGame2;
        let height = 670 / scaleGame2;

        const btn_width = width / 2 * 0.8;
        const btn_height = 100 / scaleGame2;

        const separator = (width - btn_width * 2) / 3;

        const btn_posX1 = separator + btn_width / 2;
        const btn_posX2 = width - btn_posX1;
        const btn_posY = height - separator - btn_height / 2;

        const cellSize = width / 3;
        const cell_posX1 = cellSize / 2;
        const cell_posX2 = cellSize / 2 + cellSize;
        const cell_posX3 = cellSize / 2 + cellSize * 2;

        return {
            btns: btns,
            btn: {
                width: btn_width,
                height: btn_height,
                posX1: btn_posX1,
                posX2: btn_posX2,
                posY: btn_posY,
                fontSize: 40 / scaleGame2,
            },
            cell: {
                cellSize: cellSize,
                posX1: cell_posX1,
                posX2: cell_posX2,
                posX3: cell_posX3,
                fontSize: 40 / scaleGame2,
                scaleImage: 0.5,//_scaleGame * (isDesktop ? 0.9 : 1),
            },
            title: {
                posX: width / 2,
                posY: 60 / scaleGame2,
                fontSize: 60 / scaleGame2,
            },
            width: width,
            height: height,
            scaleGame: scaleGame2,
        };

    }

    resize() {
        
        const props = WonPanel.getBaseSettings(this.scene);

        this.width = props.width;
        this.height = props.height;
        this.scaleGame = props.scaleGame;

        super.resize();

        this.title.setFontSize(props.title.fontSize);
        this.title.setPosition(props.title.posX, props.title.posY);

        this.score.setFontSize(props.cell.fontSize);
        this.score.setPositionX(props.cell.posX1);
        this.score.setScaleImage(props.cell.scaleImage);
        this.time.setFontSize(props.cell.fontSize);
        this.time.setPositionX(props.cell.posX2);
        this.time.setScaleImage(props.cell.scaleImage);
        this.moves.setFontSize(props.cell.fontSize);
        this.moves.setPositionX(props.cell.posX3);
        this.moves.setScaleImage(props.cell.scaleImage);

        this.bestTitle.setPosition(this.width / 2, this.posY(4));
        this.bestScore.setPosition(props.cell.posX1, this.posY(5));
        this.bestTime.setPosition(props.cell.posX2, this.posY(5));
        this.bestMoves.setPosition(props.cell.posX3, this.posY(5));

        this.bestTitle.setFontSize(props.cell.fontSize * 0.8);
        this.bestMoves.setFontSize(props.cell.fontSize * 0.8);
        this.bestTime.setFontSize(props.cell.fontSize * 0.8);
        this.bestScore.setFontSize(props.cell.fontSize * 0.8);

        this.btns[0].setPosition(props.btn.posX1, props.btn.posY);
        this.btns[1].setPosition(props.btn.posX2, props.btn.posY);

        this.btns[0].setSize(props.btn.width, props.btn.height);
        this.btns[1].setSize(props.btn.width, props.btn.height);

        this.btns[0].setFontSize(props.btn.fontSize);
        this.btns[1].setFontSize(props.btn.fontSize);
        
    }

    updateLocalization() {
        const localization = this.scene.getLocalization();

        this.title.setText(localization.label_won);
        this.score.setText(localization.label_score);
        this.time.setText(localization.label_time);
        this.moves.setText(localization.label_moves);

        this.bestTitle.setText(`----- ( ${localization.best_title} )-----`);
    }
}