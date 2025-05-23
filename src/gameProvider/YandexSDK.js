// @ts-check

import GameSDK from "./GameSDK.js"

// yandex-sdk.js

export default class YandexSDK extends GameSDK {

    constructor() {
        super();
        this.sdk = null;

        this.lastSubmitTime = 0;
        this.SUBMIT_DELAY = 1000;

        this.requestCounters = {
            getPlayerStats: { count: 0, limit: 60, interval: 60000, timer: null, lastRequestTime: 0 },
            setPlayerStats: { count: 0, limit: 60, interval: 60000, timer: null, lastRequestTime: 0 },

            getPlayerData: { count: 0, limit: 100, interval: 300000, timer: null, lastRequestTime: 0 },
            setPlayerData: { count: 0, limit: 100, interval: 300000, timer: null, lastRequestTime: 0 },

            showRewardedAd: { count: 0, limit: 10, interval: 60000, timer: null, lastRequestTime: 0 },
            showInterstitialAd: { count: 0, limit: 1, interval: 1 * 60000, timer: null, lastRequestTime: 0 },
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
            script.src = "/sdk.js";
            script.async = true;
            
            script.onload = () => {
                resolve(YandexSDK || true); // Возвращаем SDK или флаг успеха
            };
            
            script.onerror = () => {
                document.head.removeChild(script); // Чистим DOM в случае ошибки
                reject(new Error('Failed to load Yandex SDK script'));
            };
            
            document.head.appendChild(script);
        });
    }

    init() {
        return new Promise((resolve, reject) => {
            YaGames.init()
                .then(sdk => {
                    this.sdk = sdk;

                    return sdk.getStorage().then(safeStorage => {

                        Object.defineProperty(window, 'localStorage', { get: () => safeStorage });
                        localStorage.setItem('key', 'safe storage is working');

                        resolve();
                    });
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    gameIsLoaded() {
        if (this.sdk) this.sdk.features.LoadingAPI?.ready();
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
                let wasShown = false;
                this.sdk.adv.showRewardedVideo({
                    callbacks: {
                        onOpen: () => console.log('Rewarded video ad opened'),
                        onRewarded: () => {
                            console.log('User rewarded');
                            wasShown = true;
                        },
                        onClose: () => {
                            console.log('Rewarded video ad closed');
                            resolve(wasShown);
                        },
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

    showInterstitialAd(onOpenFunc, onCloseFunc) {
        return new Promise((resolve, reject) => {
            if (this.sdk) {
                this.sdk.adv.showFullscreenAdv({
                    callbacks: {
                        onOpen: () => {
                            console.log('Interstitial ad opened');
                            if (onOpenFunc) onOpenFunc();
                        },
                        onClose: (wasShown) => {
                            console.log('Interstitial ad closed');
                            if (onCloseFunc) onCloseFunc(wasShown);
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
    }

    getPlayerStats() {
        return this._throttleRequest('getPlayerStats', () => {
            return new Promise((resolve, reject) => {
                if (this.sdk) {
                    this.sdk.getPlayer().then(player => {
                        player.getStats()
                            .then(data => {
                            
                                const settings = {};

                                if (data) {
                                    Object.assign(settings, data);
                                    if (settings.language && settings.isLanguageSaved) {
                                        settings.language = this.numberToLangCode(settings.language);
                                    } else {
                                        settings.language = '';
                                    }
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

    tryUpdateLeaderboardScore(newScoreToAdd) {

        // const now = Date.now();
        
        // if (now - this.lastSubmitTime < this.SUBMIT_DELAY) {
        //     console.warn("⚠️ Слишком частая отправка очков. Подожди немного.");
        //     return;
        // }
        
        // this.lastSubmitTime = now;
        
        // this.sdk.getLeaderboards().then(lb => {

        //     return new Promise((resolve, reject) => {
        //         lb.getLeaderboardPlayerEntry('leaderboard2021')
        //     });
        // });

        // .then(lb => {
        //     lb.setLeaderboardScore('lbBestScore', score).then(() => {
        //         console.log('✅ Очки отправлены в лидерборд');
        //     }).catch(err => {
        //         console.error('❌ Ошибка при отправке очков:', err);
        //     });
        // }).catch(err => {
        //     console.error('❌ Ошибка при получении лидерборда:', err);
        // });

        const leaderboardName = 'lbBestScore'; // Замени на своё имя лидерборда
        
        this.sdk.getLeaderboards()
          .then(lb => {
            return lb.getLeaderboardPlayerEntry(leaderboardName)
              .then(entry => {
                const currentScore = entry.score || 0;
                const updatedScore = currentScore + newScoreToAdd;
                return lb.setLeaderboardScore(leaderboardName, updatedScore);
              })
              .catch(err => {
                if (err.code === 'LEADERBOARD_PLAYER_NOT_PRESENT') {
                  // У пользователя ещё нет записи — установим новый результат
                  return lb.setLeaderboardScore(leaderboardName, newScoreToAdd);
                } else {
                  throw err;
                }
              });
          })
          .then(() => {
            console.log('Score updated successfully');
          })
          .catch(err => {
            console.error('Failed to update score:', err);
          }); 

    }

    lang() {
        return this.sdk.environment.i18n.lang;
    }

    numberToLangCode(num) {
        const hex = num.toString(16);
        const chars = hex.match(/.{1,2}/g); // каждые 2 символа (1 байт)
        return chars.map(h => String.fromCharCode(parseInt(h, 16))).join('');
    }
}
