export default class LocalStorageSDK {
    
    init() {
        return new Promise((resolve) => {
            console.log('LocalStorage SDK initialized');
            resolve();
        });
    }

    gameIsLoaded() {
        
    }

    loadSDK() {
        return Promise.resolve();
    }

    showRewardedAd() {
        return new Promise((resolve) => {
            console.log('LocalStorage: Showed rewarded ad');
            resolve();
        });
    }

    showInterstitialAd() {
        return new Promise((resolve) => {
            console.log('LocalStorage: Showed interstitial ad');
            resolve();
        });
    }

    getPlayerStats() {
        return new Promise((resolve) => {
            const settings = {
                // language: 'en'
                language: 'ru'
            };
            const data = localStorage.getItem('userSettings');
            if (data) {
                Object.assign(settings, JSON.parse(data));
            }
            
            resolve(settings);
        });
    }

    setPlayerStats(data) {
        return new Promise((resolve) => {
            localStorage.setItem('userSettings', JSON.stringify(data));
            resolve();
        });
    }

    saveGameSession(dataSessionJSON) {
        return new Promise((resolve) => {
            localStorage.setItem('userSession', dataSessionJSON);
            resolve();
        });
    }

    getGameSession() {
        return new Promise((resolve) => {
            const dataSessionJSON = localStorage.getItem('userSession');
            resolve(dataSessionJSON ? dataSessionJSON : null);
        });
    }
}
