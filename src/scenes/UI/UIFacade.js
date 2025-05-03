// @ts-check

import * as observer from './Observer.js';
import ButtonPanel from './ButtonPanel.js';
import BackgroundPanel from './BackgroundPanel.js';
import PlayPanel from './PlayPanel.js';
import SettingsPanel from './SettingsPanel.js';
import LanguageSelectPanel from './LanguageSelectPanel.js';
import AdPanel from './AdPanel.js';
import WonPanel from './WonPanel.js';
import * as constants from "../../core/tools/constants.js"

export default class UIFacade extends observer.SubjectMixin(observer.Observer) {

    buttonPanel;

    constructor(scene) {
        super();

        this.scene = scene;
        this.isAnimating = false;
        this.isCooldown = false;

        this.isButtonPanelOpen = true;
        this.buttonPanel = new ButtonPanel(scene, this.isButtonPanelOpen);
        this.buttonPanel.addObserver(this);
        this.addObserver(this.buttonPanel);

        this.isBackgroundPanelOpen = false;
        this.backgroundPanel = new BackgroundPanel(scene, this.isBackgroundPanelOpen);
        this.backgroundPanel.addObserver(this);
        this.addObserver(this.backgroundPanel);

        this.isPlayPanelOpen = false;
        this.playPanel = new PlayPanel(scene, this.isPlayPanelOpen);
        this.playPanel.addObserver(this);
        this.addObserver(this.playPanel);
        
        this.isSettingsPanelOpen = false;
        this.settingsPanel = new SettingsPanel(scene, this.isSettingsPanelOpen);
        this.settingsPanel.addObserver(this);
        this.addObserver(this.settingsPanel);

        this.isLanguagePanelOpen = false;
        this.languagePanel = new LanguageSelectPanel(scene, this.isLanguagePanelOpen);
        this.languagePanel.addObserver(this);
        this.addObserver(this.languagePanel);

        this.isWonPanelOpen = false;
        this.wonPanel = new WonPanel(scene, this.isWonPanelOpen);
        this.wonPanel.addObserver(this);
        this.addObserver(this.wonPanel);

        this.isAdPanelOpen = false;
        this.adPanel = new AdPanel(scene, this.isAdPanelOpen);
        this.adPanel.addObserver(this);
        this.addObserver(this.adPanel);
    }

    startCooldown() {
        this.isCooldown = true;
        this.scene.time.delayedCall(200, () => {
            this.isCooldown = false;
        });
    }

    onEvent(event, data) {

        if (this.isAnimating || this.isCooldown) return;

        if (data.name === 'backgroundPanel') {

            if (event === 'pointerdown') {
                if (this.isLanguagePanelOpen) {
                    this.toggleLanguagePanel();
                } else if (this.isSettingsPanelOpen) {
                    this.toggleSettingsPanel();
                } else if (this.isPlayPanelOpen) {
                    this.togglePlayPanel();
                } else if (this.isAdPanelOpen) {
                    this.toggleAdPanel();
                }
            }

        } else if (data.name === 'settingPanel') {
            
            if (event === 'onClickSettingsLanguage') {
                this.toggleLanguagePanel();
            }
            
        } else if (data.name === 'buttonPanel') {
        
            if (event === 'onClickSettings') {
                this.toggleSettingsPanel();
            } else if (event === 'onClickPlay') {
                this.togglePlayPanel();
            } else if (event === 'onClickMagic') {
                this.scene.onClickMagic((data) => this.onMagicComplite(data));
            } else if (event === 'onClickHint') {
                this.scene.onClickHint((data) => this.onHintComplite(data));
            } else if (event === 'onClickUndo') {
                this.scene.onClickUndo((data) => this.onUndoComplite(data));
            }

        } else if (data.name === 'playPanel') {

            if (event === 'onClickNewGame') {
                this.togglePlayPanel();
                this.scene.onClickNewGame();
            } else if (event === 'onClickReplay') {
                this.togglePlayPanel();
                this.scene.onClickReplay();
            } else if (event === 'onClickClose') {
                this.togglePlayPanel();
            }

        } else if (data.name === 'wonPanel') {

            if (event === 'onClickMenu') {
                this.toggleWonPanel();
            } else if (event === 'onClickNewGame') {
                this.toggleWonPanel();
                this.scene.onClickNewGame();
            }
        } else if (data.name === 'adPanel') {

            if (event === 'onClickShowRewardedAd') {
                this.toggleAdPanel();
                this.scene.onClickShowRewardedAd();
            }
        }
    }

    onMagicComplite(isCorrect) {
        this.buttonPanel.onEvent('onMagicComplite', isCorrect);
    }

    onHintComplite(isCorrect) {
        this.buttonPanel.onEvent('onHintComplite', isCorrect);
    }

    onUndoComplite(isCorrect) {
        this.buttonPanel.onEvent('onUndoComplite', isCorrect);
    }

    onCloseLanguagePanel(isCorrect) {
        this.settingsPanel.onEvent('onCloseLanguagePanel', isCorrect);
    }

    onOpenModalUI(panel, isOpen) {
        this.scene.onOpenModalUI({isOpen: isOpen});
    }

    openButtonPanel() {
        
        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;

        this.buttonPanel.open().then(() => {
            this.isButtonPanelOpen = true;
            this.isAnimating = false;
            this.startCooldown();
        });

    }

    closeButtonPanel() {
        
        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;

        this.buttonPanel.close().then(() => {
            this.isButtonPanelOpen = false;
            this.isAnimating = false;
            this.startCooldown();
        });
    }

    toggleButtonPanel() {
        if (this.isAnimating || this.isCooldown) return;

        if (this.isButtonPanelOpen) {
            this.closeButtonPanel();
        } else {
            this.openButtonPanel();
        }
    }

    turnOffInteractiveButtonPanel() {
        if (this.isButtonPanelOpen) {
            this.buttonPanel.setCanBeInteractive(false);
        }
    }

    turnOnInteractiveButtonPanel() {
        if (this.isButtonPanelOpen) {
            this.buttonPanel.setCanBeInteractive(true);
        }
    }

    openPlayPanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;
        
        const hideButtonPanel = this.buttonPanel.close();
        const showBackgroundPanel = this.backgroundPanel.open();
        const showPlayPanel = this.playPanel.open();
        
        Promise.all([hideButtonPanel, showBackgroundPanel, showPlayPanel]).then(() => {
            this.isButtonPanelOpen = false;
            this.isBackgroundPanelOpen = true;
            this.isPlayPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.playPanel, this.isPlayPanelOpen);
            this.startCooldown();
        });
    }

    closePlayPanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;

        const hideBackgroundPanel = this.backgroundPanel.close();
        const hidePlayPanel = this.playPanel.close();
        const showButtonPanel = this.buttonPanel.open();

        Promise.all([hideBackgroundPanel, hidePlayPanel, showButtonPanel]).then(() => {
            this.isBackgroundPanelOpen = false;
            this.isPlayPanelOpen = false;
            this.isButtonPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.playPanel, this.isPlayPanelOpen);
            this.startCooldown();
        });
    }

    togglePlayPanel() {

        if (this.isAnimating || this.isCooldown) return;

        if (this.isPlayPanelOpen) {
            this.closePlayPanel();
        } else {
            this.openPlayPanel();
        }
    }

    openSettingsPanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;
        
        const hideButtonPanel = this.buttonPanel.close();
        const showBackgroundPanel = this.backgroundPanel.open();
        const showSettingsPanel = this.settingsPanel.open();
        
        Promise.all([hideButtonPanel, showBackgroundPanel, showSettingsPanel]).then(() => {
            this.isButtonPanelOpen = false;
            this.isBackgroundPanelOpen = true;
            this.isSettingsPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.settingsPanel, this.isSettingsPanelOpen);
            this.startCooldown();
        });
    }

    closeSettingsPanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;

        const hideBackgroundPanel = this.backgroundPanel.close();
        const hideSettingsPanel = this.settingsPanel.close();
        const showButtonPanel = this.buttonPanel.open();

        Promise.all([hideBackgroundPanel, hideSettingsPanel, showButtonPanel]).then(() => {
            this.isBackgroundPanelOpen = false;
            this.isSettingsPanelOpen = false;
            this.isButtonPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.settingsPanel, this.isSettingsPanelOpen);
            this.startCooldown();
        });
    }

    toggleSettingsPanel() {
        
        if (this.isAnimating || this.isCooldown) return;

        if (this.isSettingsPanelOpen) {
            this.closeSettingsPanel();
        } else {
            this.openSettingsPanel();
        }
    }

    openLanguagePanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;
        
        const showLanguagePanel = this.languagePanel.open();
        
        Promise.all([showLanguagePanel]).then(() => {
            this.isLanguagePanelOpen = true;
            this.isAnimating = false;
            this.startCooldown();
        });
    }

    closeLanguagePanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;

        const hideLanguagePanel = this.languagePanel.close();

        Promise.all([hideLanguagePanel]).then(() => {
            this.isLanguagePanelOpen = false;
            this.isAnimating = false;
            this.startCooldown();
            this.onCloseLanguagePanel();
        });
    }

    toggleLanguagePanel() {
        
        if (this.isAnimating || this.isCooldown) return;

        if (this.isLanguagePanelOpen) {
            this.closeLanguagePanel();
        } else {
            this.openLanguagePanel();
        }
    }

    openWonPanel(checkAvailability = true) {

        if (checkAvailability && (this.isAnimating || this.isCooldown)) return;

        this.isAnimating = true;
        
        const hideButtonPanel = this.buttonPanel.close();
        const showBackgroundPanel = this.backgroundPanel.open();
        const showWonPanel = this.wonPanel.open();
        
        Promise.all([hideButtonPanel, showBackgroundPanel, showWonPanel]).then(() => {
            this.isButtonPanelOpen = false;
            this.isBackgroundPanelOpen = true;
            this.isWonPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.wonPanel, this.isWonPanelOpen);
            this.startCooldown();
        });
    }

    closeWonPanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;

        const hideBackgroundPanel = this.backgroundPanel.close();
        const hideWonPanel = this.wonPanel.close();
        const showButtonPanel = this.buttonPanel.open();

        Promise.all([hideBackgroundPanel, hideWonPanel, showButtonPanel]).then(() => {
            this.isBackgroundPanelOpen = false;
            this.isWonPanelOpen = false;
            this.isButtonPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.wonPanel, this.isWonPanelOpen);
            this.startCooldown();
        });
    }

    toggleWonPanel() {
        if (this.isAnimating || this.isCooldown) return;

        if (this.isWonPanelOpen) {
            this.closeWonPanel();
        } else {
            this.openWonPanel();
        }
    }

    openAdPanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;
        
        const hideButtonPanel = this.buttonPanel.close();
        const showBackgroundPanel = this.backgroundPanel.open();
        const showAdPanel = this.adPanel.open();
        
        Promise.all([hideButtonPanel, showBackgroundPanel, showAdPanel]).then(() => {
            this.isButtonPanelOpen = false;
            this.isBackgroundPanelOpen = true;
            this.isAdPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.wonPanel, this.isWonPanelOpen);
            this.startCooldown();
        });
    }

    closeAdPanel() {

        if (this.isAnimating || this.isCooldown) return;

        this.isAnimating = true;

        const hideBackgroundPanel = this.backgroundPanel.close();
        const showAdPanel = this.adPanel.close();
        const showButtonPanel = this.buttonPanel.open();

        Promise.all([hideBackgroundPanel, showAdPanel, showButtonPanel]).then(() => {
            this.isBackgroundPanelOpen = false;
            this.isAdPanelOpen = false;
            this.isButtonPanelOpen = true;
            this.isAnimating = false;
            this.onOpenModalUI(this.wonPanel, this.isWonPanelOpen);
            this.startCooldown();
        });
    }

    toggleAdPanel() {
        if (this.isAnimating || this.isCooldown) return;

        if (this.isAdPanelOpen) {
            this.closeAdPanel();
        } else {
            this.openAdPanel();
        }
    }

    gameStatusHasChanged(currenStatusGame, previousStatusGame) {
        
        const isGameOver = currenStatusGame === constants.STATUS_GAME.COMPLETED
            && previousStatusGame === constants.STATUS_GAME.GAME_OVER;

        if (isGameOver) {
            this.openWonPanel(false);
        } else if (currenStatusGame === constants.STATUS_GAME.GAME_OVER) {
            this.buttonPanel.disableGameBtn();
            if (this.isButtonPanelOpen) {
                this.closeButtonPanel();
            }
        } else if (this.scene.isStatusGameRuning(currenStatusGame) && !this.scene.isStatusGameRuning(previousStatusGame)) {
            this.buttonPanel.activationGameBtn();
        }
    }

    resize() {
        this.notify('resize', undefined);
    }

    updateLocalization() {
        this.notify('updateLocalization', undefined);
    }

    setUndoButtonPanel(value) {
        this.buttonPanel.setUndo(value);
    }

    restartGame() {
        this.notify('restartGame', undefined);
    }

}