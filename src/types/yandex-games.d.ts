declare namespace YaGames {
    interface AdvCallbacks {
        onOpen: () => void;
        onClose: (wasShown: boolean) => void;
        onError: (error: Error) => void;
    }

    interface Adv {
        showFullscreenAdv: (options: { callbacks: AdvCallbacks }) => Promise<void>;
    }

    interface Player {
        setData: (data: { [key: string]: any }) => Promise<void>;
        getData: () => Promise<{ [key: string]: any }>;
    }

    interface YSDK {
        adv: Adv;
        getPlayer: () => Promise<Player>;
    }

    function init(): Promise<YSDK>;
}

interface Window {
    ysdk: YaGames.YSDK;
}
