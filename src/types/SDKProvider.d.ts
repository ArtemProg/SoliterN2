interface SDKProvider {
    init(): Promise<void>;
    showRewardedAd(): Promise<void>;
    showInterstitialAd(): Promise<void>;
    getPlayerStats(): Promise<any>;
    setPlayerStats(data: any): Promise<void>;
    loadSDK(): Promise<void>;
}

interface Window {
    sdkProvider: SDKProvider;
}