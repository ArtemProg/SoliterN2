// @ts-check

export default class UserSettingsManager {

    #observers;

    constructor(sdkProvider) {
        this.sdkProvider = sdkProvider;
        this.settings = {
            sound: 2,
            autoHints: 1,
            autoComplite: 1,
            bestScore: 0,
            bestMoves: 0,
            bestTime: 0,
            numberOfGamesCompleted: 0,
            isSaved: 0
        };
        this.pendingChanges = {};
        this.language = 'en';

        this.#observers = [];
    }

    loadSettings() {
        return this.sdkProvider.getPlayerStats()
            .then(data => {
                if (data) {
                    const { language, ...settings } = data;
                    Object.assign(this.settings, settings);
                    this.language = language;
                }
                console.log('Settings loaded:', this.settings);
                return true;
            })
            .catch(err => {
                console.error('Failed to load settings:', err);
                return false;
            });
    }

    saveSettings() {
        Object.assign(this.settings, this.pendingChanges);
        this.pendingChanges = {};

        this.notify('saveSettings', this);

        return this.sdkProvider.setPlayerStats(this.settings)
            .then(() => {
                console.log('Settings saved:', this.settings);
            })
            .catch(err => {
                console.error('Failed to save settings:', err);
            });
    }

    setSound(level) {
        if ([0, 1, 2].includes(level)) {
            this.pendingChanges.sound = level;
        } else {
            throw new Error('Invalid sound level');
        }
    }

    setAutoHints(level) {
        if ([0, 1].includes(level)) {
            this.pendingChanges.autoHints = level;
        } else {
            throw new Error('Invalid setAutoHints level');
        }
    }

    setAutoComplite(level) {
        if ([0, 1].includes(level)) {
            this.pendingChanges.autoComplite = level;
        } else {
            throw new Error('Invalid autoComplite level');
        }
    }

    updateBestScore(score) {
        if (score > (this.pendingChanges.bestScore || this.settings.bestScore)) {
            this.pendingChanges.bestScore = score;
        }
    }

    updateBestMoves(moves) {
        if (moves < (this.pendingChanges.bestMoves || this.settings.bestMoves) || this.settings.bestMoves === 0) {
            this.pendingChanges.bestMoves = moves;
        }
    }

    updateBestTime(time) {
        if (time < (this.pendingChanges.bestTime || this.settings.bestTime) || this.settings.bestTime === 0) {
            this.pendingChanges.bestTime = time;
        }
    }

    incrementGamesCompleted() {
        this.pendingChanges.numberOfGamesCompleted = (this.pendingChanges.numberOfGamesCompleted || this.settings.numberOfGamesCompleted) + 1;
    }

    setSaveState(state) {
        if ([0, 1].includes(state)) {
            this.pendingChanges.isSaved = state;
        } else {
            throw new Error('Invalid save state');
        }
    }

    getSettings() {
        return { ...this.settings, ...this.pendingChanges, language: this.language };
    }

    saveGameSession(dataSessionJSON) {
        return this.sdkProvider.saveGameSession(dataSessionJSON);
    }

    getGameSession() {
        return this.sdkProvider.getGameSession();
    }

    addObserver(observer) {
        const isExist = this.#observers.includes(observer);
        if (isExist) {
            return;
        }
        this.#observers.push(observer);
    }

    notify(event, data) {
        for (const observer of this.#observers) {
            observer.onEvent(event, data);
        }
    }
}
