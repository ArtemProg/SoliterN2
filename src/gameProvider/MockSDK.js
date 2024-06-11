// @ts-check

import GameSDK from "./GameSDK.js"

export default class MockSDK extends GameSDK {

  init() {
    return new Promise((resolve) => {
      console.log('Mock SDK initialized');
      resolve();
    });
  }

  showRewardedAd() {
    return new Promise((resolve) => {
      console.log('Mock: Showed rewarded ad');
      resolve();
    });
  }

  showInterstitialAd() {
    return new Promise((resolve) => {
      console.log('Mock: Showed interstitial ad');
      resolve();
    });
  }

  getPlayerStats() {
    return new Promise((resolve) => {
      const mockData = {
        sound: 2,
        bestScore: 5678,
        bestMoves: 121,
        bestTime: 3765,
        numberOfGamesCompleted: 15,
        isSaved: 1,
        language: 'ru'
      };
      resolve(mockData);
    });
  }

  loadSDK() {
    return Promise.resolve();
  }
  setPlayerStats(data) {
    return new Promise((resolve) => {
      console.log('Mock: Saved player data', data);
      resolve();
    });
  }

  saveGameSession(dataSessionJSON) {
    return new Promise((resolve) => {
      console.log('Mock: Saved game session', dataSessionJSON);
        resolve();
    });
  }

  getGameSession() {
    return new Promise((resolve) => {
        const dataSessionJSON = this.dataSessionJSON();
        resolve(dataSessionJSON ? dataSessionJSON : null);
    });
  }

  dataSessionJSON() {
    return "{\"spots\":{\"Stok\":[[[\"clubs\",\"Ace\",false],[\"hearts\",\"Queen\",false],[\"clubs\",\"3\",false],[\"clubs\",\"King\",false],[\"spades\",\"9\",false],[\"diamonds\",\"4\",false],[\"diamonds\",\"5\",false],[\"clubs\",\"4\",false],[\"spades\",\"King\",false],[\"hearts\",\"6\",false],[\"diamonds\",\"8\",false],[\"hearts\",\"5\",false],[\"diamonds\",\"King\",false],[\"hearts\",\"Jack\",false],[\"clubs\",\"9\",false],[\"clubs\",\"8\",false],[\"clubs\",\"10\",false],[\"clubs\",\"7\",false],[\"spades\",\"Ace\",false]]],\"Waste\":[[[\"spades\",\"Queen\",true],[\"diamonds\",\"7\",true],[\"clubs\",\"Jack\",true]]],\"Pile\":[[[\"clubs\",\"2\",true]],[[\"spades\",\"3\",false],[\"clubs\",\"5\",true],[\"hearts\",\"4\",true]],[[\"hearts\",\"King\",false],[\"spades\",\"8\",false],[\"spades\",\"2\",true]],[[\"hearts\",\"2\",false],[\"diamonds\",\"3\",false],[\"diamonds\",\"10\",true]],[[\"spades\",\"5\",false],[\"spades\",\"10\",false],[\"hearts\",\"7\",false],[\"diamonds\",\"Queen\",true],[\"spades\",\"Jack\",true],[\"hearts\",\"10\",true]],[[\"clubs\",\"Queen\",false],[\"clubs\",\"6\",false],[\"diamonds\",\"Jack\",false],[\"diamonds\",\"2\",false],[\"diamonds\",\"6\",false],[\"diamonds\",\"9\",true]],[[\"hearts\",\"9\",false],[\"spades\",\"4\",false],[\"spades\",\"7\",false],[\"hearts\",\"3\",false],[\"spades\",\"6\",false],[\"hearts\",\"8\",true]]],\"Foundations\":[[[\"diamonds\",\"Ace\",true]],[],[[\"hearts\",\"Ace\",true]],[]]},\"score\":30,\"time\":368755.1,\"moves\":264,\"history\":[[\"Step 1\",15,[[\"moveCard\",\"Pile7\",\"Foundations1\",[\"diamondsAce\"]],[\"openCard\",\"Pile7\",\"Pile7\",[\"hearts8\"]]]],[\"Step 2\",5,[[\"moveCard\",\"Pile4\",\"Pile5\",[\"spadesJack\"]],[\"openCard\",\"Pile4\",\"Pile4\",[\"diamonds10\"]]]],[\"Step 3\",0,[[\"magicMoveCardLastCard\",\"Pile5\",\"Foundations3\",[\"heartsAce\",null,\"hearts7\"]]]],[\"Step 4\",0,[[\"moveCardFromStokToWaste\",\"Stok\",\"Waste\",[\"spadesQueen\"]]]],[\"Step 5\",0,[[\"moveCardFromStokToWaste\",\"Stok\",\"Waste\",[\"diamonds7\"]]]],[\"Step 6\",0,[[\"moveCardFromStokToWaste\",\"Stok\",\"Waste\",[\"clubsJack\"]]]],[\"Step 7\",0,[[\"moveCardFromStokToWaste\",\"Stok\",\"Waste\",[\"hearts10\"]]]],[\"Step 8\",5,[[\"moveCard\",\"Waste\",\"Pile5\",[\"hearts10\"]]]],[\"Step 9\",0,[[\"moveCardFromStokToWaste\",\"Stok\",\"Waste\",[\"hearts4\"]]]],[\"Step 10\",5,[[\"moveCard\",\"Waste\",\"Pile2\",[\"hearts4\"]]]]]}";
  }

}