import Form from "./Form.js"
import BaseButton from "./BaseButton.js"

export default class AdPanel extends Form {

    constructor(scene, isOpen) {
        
        const localization = scene.cache.json.get('localization');

        const isDesktop = scene.settingsResize.settingDesk.type === 'DESKTOP';

        const scaleGame = isDesktop ? 1.5 : 0.8;

        let width = 600 / scaleGame;
        let height = 670 / scaleGame;

        super(scene, width, height, isOpen, {fillStyle: { color: 0x000000, alpha: 0.95 }});
        
        const color = 0xffb300;
        
        this.title = this.scene.add.text(width / 2, 50 / scaleGame, `${localization.label_magic}`)
            .setColor('#ffb300')
            .setFontSize(60 / scaleGame)
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5);
        this.add(this.title);

        this.label = this.scene.add.text(width / 2, (height / 2) * 0.9, `${localization.label_magic_update}`, {lineSpacing: 10 / scaleGame})
            .setColor('#ffb300')
            .setFontSize(55 / scaleGame)
            .setFontFamily('Arial')
            .setAlpha(0.8)
            .setOrigin(0.5, 0.5);
        this.add(this.label);

        this.btn = new BaseButton(
            width / 2,
            height - 100 / scaleGame,
            300 / scaleGame,
            100 / scaleGame,
            color,
            this,
            {name: 'ShowRewardedAd', text: `${localization.btn_show_ad}`, fontSize: 30 / scaleGame},
            this.onButtondown
        );
        
    }

    onButtondown(btn, event) {
        const dataEvent = {name: 'adPanel'};
        if (btn.name === 'ShowRewardedAd' && event === 'onClick') {
            this.notify('onClickShowRewardedAd', dataEvent);
        }
    }
    
}