// @ts-check

import GameSDK from "./GameSDK.js"

// yandex-sdk.js

export default class YandexSDK extends GameSDK {

    constructor() {
        super();
        this.sdk = null;
        this.requestCounters = {
            getPlayerStats: { count: 0, limit: 60, interval: 60000, timer: null, lastRequestTime: 0 },
            setPlayerStats: { count: 0, limit: 60, interval: 60000, timer: null, lastRequestTime: 0 },

            getPlayerData: { count: 0, limit: 100, interval: 300000, timer: null, lastRequestTime: 0 },
            setPlayerData: { count: 0, limit: 100, interval: 300000, timer: null, lastRequestTime: 0 },

            showRewardedAd: { count: 0, limit: 5, interval: 60000, timer: null, lastRequestTime: 0 },
            showInterstitialAd: { count: 0, limit: 1, interval: 61000, timer: null, lastRequestTime: 0 },
        };
        this.loadRequestCounters();
    }

    loadRequestCounters() {
        const savedCounters = localStorage.getItem('requestCounters');
        if (savedCounters) {
            this.requestCounters = JSON.parse(savedCounters);
        }
    }

    saveRequestCounters() {
        localStorage.setItem('requestCounters', JSON.stringify(this.requestCounters));
    }

    loadSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://yandex.ru/games/sdk/v2';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Yandex SDK script'));
            document.head.appendChild(script);
        });
    }

    init() {
        return new Promise((resolve, reject) => {
            YaGames.init()
                .then(sdk => {
                    this.sdk = sdk;
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    _throttleRequest(type, requestFunc) {
        const counter = this.requestCounters[type];
        const now = Date.now();
        const timeSinceLastRequest = now - counter.lastRequestTime;

        return new Promise((resolve, reject) => {
            if (timeSinceLastRequest >= counter.interval) {
                counter.count = 0;
            }

            if (counter.count < counter.limit) {
                counter.count++;
                requestFunc()
                    .then(result => {
                        counter.lastRequestTime = now; // Обновление только при успешном запросе
                        this.saveRequestCounters(); // Сохранение состояния после успешного запроса
                        resolve(result);
                    })
                    .catch(error => {
                        this.saveRequestCounters(); // Сохранение состояния после ошибки
                        reject(error);
                    });
            } else {
                reject(new Error('Request limit exceeded.'));
            }
        }).catch(error => {
            console.error('Ошибка запроса:', error);
            // Возможные дополнительные действия по обработке ошибки
        });
    }

  showRewardedAd() {
    return this._throttleRequest('showRewardedAd', () => {
        return new Promise((resolve, reject) => {
            if (this.sdk) {
                this.sdk.adv.showRewardedVideo({
                    callbacks: {
                        onOpen: () => console.log('Rewarded video ad opened'),
                        onRewarded: () => {
                            console.log('User rewarded');
                            resolve();
                        },
                        onClose: () => console.log('Rewarded video ad closed'),
                        onError: err => {
                            console.error('Error showing rewarded video ad:', err);
                            reject(err);
                        }
                    }
                });
            } else {
                reject(new Error('SDK not initialized'));
            }
        });
    }).catch(error => {
        console.error('Ошибка при показе вознаграждаемой рекламы:', error.message);
        throw error;
    });
  }

    showInterstitialAd() {
        return this._throttleRequest('showInterstitialAd', () => {
            return new Promise((resolve, reject) => {
                if (this.sdk) {
                    this.sdk.adv.showFullscreenAdv({
                        callbacks: {
                            onOpen: () => console.log('Interstitial ad opened'),
                            onClose: () => {
                                console.log('Interstitial ad closed');
                                resolve();
                            },
                            onError: err => {
                                console.error('Error showing interstitial ad:', err);
                                reject(err);
                            }
                        }
                    });
                } else {
                    reject(new Error('SDK not initialized'));
                }
            });
        });
    }

    getPlayerStats() {
        return this._throttleRequest('getPlayerStats', () => {
            return new Promise((resolve, reject) => {
                if (this.sdk) {
                    this.sdk.getPlayer().then(player => {
                        player.getStats()
                            .then(data => {
                            const settings = {
                                language: this.lang()
                            };
                            if (data) {
                                Object.assign(settings, data);
                            }
                            resolve(settings);
                            })
                            .catch(err => reject(err));
                    }).catch(err => reject(err));
                } else {
                    reject(new Error('SDK not initialized'));
                }
            });
        });
    }

    setPlayerStats(data) {
        return this._throttleRequest('setPlayerStats', () => {
            return new Promise((resolve, reject) => {
                if (this.sdk) {
                    this.sdk.getPlayer().then(player => {
                        player.setStats(data)
                            .then(() => resolve())
                            .catch(err => reject(err));
                    }).catch(err => reject(err));
                } else {
                    reject(new Error('SDK not initialized'));
                }
            });
        });
    }


    saveGameSession(dataSessionJSON) {
    return this._throttleRequest('setPlayerData', () => {
        return new Promise((resolve, reject) => {
            if (this.sdk) {
                this.sdk.getPlayer().then(player => {
                    player.setData({ dataSessionJSON: dataSessionJSON })
                        .then(() => resolve())
                        .catch(err => reject(err));
                }).catch(err => reject(err));
            } else {
                reject(new Error('SDK not initialized'));
            }
        });
    });
    }

    getGameSession() {
        return this._throttleRequest('getPlayerData', () => {
            return new Promise((resolve, reject) => {
                if (this.sdk) {
                    this.sdk.getPlayer().then(player => {
                        player.getData()
                            .then(data => {
                                const dataSessionJSON = data?.dataSessionJSON;
                                resolve(dataSessionJSON ? dataSessionJSON : null);
                            }).catch(err => reject(err));
                    }).catch(err => reject(err));

                } else {
                    reject(new Error('SDK not initialized'));
                }
            });
        });
    }

    lang() {
        return this.sdk.environment.i18n.lang;
    }
}
