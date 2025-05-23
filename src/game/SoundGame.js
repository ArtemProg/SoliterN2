// @ts-check

export default class SoundGame {
    
    #scene;
    #manager;

    #isLoaded = false;

    #slide;
    #indexSlide;
    
    #undo;
    #deal;
    #shake;
    #magic;
    #wandSwing;
    #recovery;

    #guitarStrings;
    #indexGuitarStrings;
    #volume;

    get volumeValue() {
        return this.#manager.userSettingsManager.settings.sound;
    }

    /** @param {Phaser.Scene} scene */
    constructor(scene, manager) {

        this.#scene = scene;
        this.#manager = manager;

        this.#isLoaded = false;

        this.#volume = {
            slide: [0, 0.3, 0.1],
            undo: [0, 0.3, 0.1],
            shake: [0, 0.3, 0.1],
            deal : [0, 0.3, 0.1],
            magic : [0, 0.3, 0.1],
            wandSwing : [0, 0.3, 0.1],
            recovery : [0, 0.3, 0.1],
            guitarStrings : [0, 0.3, 0.1],
        };

        this.loadAssets();
    }


    slide() {

        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            return;
        }

        if (this.#manager.isGameRuning()) {

            // Получаем основную громкость для shake
            const baseVolume = this.#volume.slide[this.volumeValue]; // Основная громкость (например, 0.3)

            // Генерируем случайное отклонение от основной громкости (±20%)
            const variation = Phaser.Math.FloatBetween(-0.2, 0.2); // Отклонение от основного значения

            // Итоговая громкость будет в пределах 80-120% от основной громкости
            const finalVolume = Phaser.Math.Clamp(baseVolume + variation, 0, 1); // Ограничиваем громкость от 0 до 1

            this.#indexSlide++;
            if (this.#indexSlide >= this.#slide.length) {
                this.#indexSlide = 0;
            }

            // Устанавливаем итоговую громкость
            this.#slide[this.#indexSlide].setVolume(finalVolume);

            this.#slide[this.#indexSlide].play();
            
        }

    }

    magic() {

        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            return;
        }

        if (this.#manager.isGameRuning()) {

            this.#magic.play();
            
        }

    }

    deal() {

        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            return;
        }

        this.#deal.play();
    }

    wandSwing() {
        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            return;
        }
        this.#wandSwing.play();
    }

    recovery() {
        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            return;
        }
        this.#recovery.play();
    }

    undo() {

        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            return;
        }

        // Получаем основную громкость для shake
        const baseVolume = this.#volume.undo[this.volumeValue]; // Основная громкость (например, 0.3)

        // Генерируем случайное отклонение от основной громкости (±20%)
        const variation = Phaser.Math.FloatBetween(-0.2, 0.2); // Отклонение от основного значения

        // Итоговая громкость будет в пределах 80-120% от основной громкости
        const finalVolume = Phaser.Math.Clamp(baseVolume + variation, 0, 1); // Ограничиваем громкость от 0 до 1

        // Устанавливаем итоговую громкость
        this.#undo.setVolume(finalVolume);

        this.#undo.play();
    }

    shake() {

        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            console.log(this.#scene.sound.locked, this.#isLoaded);
            return;
        }

        // Получаем основную громкость для shake (например, 0.3)
        const baseVolume = this.#volume.shake[this.volumeValue];

        // Генерируем случайное отклонение от основной громкости (±20%)
        const variation = Phaser.Math.FloatBetween(-0.2, 0.2) * baseVolume; // 20% от baseVolume

        // Итоговая громкость будет в пределах 80-120% от основной громкости
        const finalVolume = Phaser.Math.Clamp(baseVolume + variation, 0, 1); // Ограничиваем от 0 до 1

        // Устанавливаем итоговую громкость
        this.#shake.setVolume(finalVolume);

        this.#shake.play();
    }

    guitarStrings(fromTheStart = false) {

        if (this.#scene.sound.locked || !this.#isLoaded || !this.volumeValue) {
            return;
        }
        
        if (fromTheStart) {
            this.#indexGuitarStrings = -1;
        }

        this.#indexGuitarStrings++;
        if (this.#indexGuitarStrings >= this.#guitarStrings.length) {
            this.#indexGuitarStrings = 0;
        }
        this.#guitarStrings[this.#indexGuitarStrings].play();
    }

    updateVolume() {

        if (!this.#isLoaded) return;
        
        const sound = this.volumeValue;
        
        for (const music of this.#slide) {
            music.setVolume(this.#volume.slide[sound]);
        }

        this.#undo.setVolume(this.#volume.undo[sound]);
        this.#shake.setVolume(this.#volume.shake[sound]);
        this.#deal.setVolume(this.#volume.deal[sound]);
        this.#magic.setVolume(this.#volume.magic[sound]);
        this.#wandSwing.setVolume(this.#volume.wandSwing[sound]);
         this.#recovery.setVolume(this.#volume.recovery[sound]);
        
        for (const music of this.#guitarStrings) {
            music.setVolume(this.#volume.guitarStrings[sound]);
        }
    }

    loadAssets() {

        const scene = this.#scene;

        scene.load.audio('cardSlide1', [ 'assets/sound/cardSlide1.ogg', 'assets/sound/cardSlide1.mp3' ]);
        scene.load.audio('cardSlide2', [ 'assets/sound/cardSlide2.ogg', 'assets/sound/cardSlide2.mp3' ]);
        scene.load.audio('cardSlide3', [ 'assets/sound/cardSlide3.ogg', 'assets/sound/cardSlide3.mp3' ]);
        scene.load.audio('cardSlide6', [ 'assets/sound/cardSlide6.ogg', 'assets/sound/cardSlide6.mp3' ]);

        scene.load.audio('magic', ['assets/sound/magic.ogg', 'assets/sound/magic.mp3']);
        scene.load.audio('wandSwing', ['assets/sound/wandSwing.ogg', 'assets/sound/wandSwing.mp3']);
        scene.load.audio('recovery', ['assets/sound/recovery.ogg', 'assets/sound/recovery.mp3']);

        scene.load.audio('cardPlace1', [ 'assets/sound/cardPlace1.ogg', 'assets/sound/cardPlace1.mp3' ]);
        scene.load.audio('25_shake_card', [ 'assets/sound/25_shake_card.ogg', 'assets/sound/25_shake_card.mp3' ]);

        scene.load.audio('cardFan1', [ 'assets/sound/cardFan1.ogg', 'assets/sound/cardFan1.mp3' ]);


        for (let i = 1; i <= 7; i++) {
            scene.load.audio(`30_collect_score${i}`, [`assets/sound/melody/30_collect_score${i}.ogg`, `assets/sound/melody/30_collect_score${i}.mp3`]);
        }
        
        scene.load.on('complete', this.onLoadComplete, this);

        scene.load.start();
    }

    onLoadComplete() {

        const scene = this.#scene;

        this.#indexSlide = -1;
        this.#slide = [
            scene.sound.add('cardSlide1'),
            scene.sound.add('cardSlide2'),
            scene.sound.add('cardSlide3'),
        ];

        this.#undo = scene.sound.add('cardPlace1');
        this.#shake = scene.sound.add('25_shake_card');
        this.#deal = scene.sound.add('cardFan1');
        this.#magic = scene.sound.add('magic');
        this.#wandSwing = scene.sound.add('wandSwing');
        this.#recovery = scene.sound.add('recovery');

        this.#indexGuitarStrings = -1;
        this.#guitarStrings = [];
        for (let i = 1; i <= 7; i++) {
            this.#guitarStrings.push(scene.sound.add(`30_collect_score${i}`));
        }

        this.#isLoaded = true;
        
        this.updateVolume();
        
    }
}