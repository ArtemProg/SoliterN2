// @ts-check

import SpotGO from "./SpotGO.js";

export default class WasteSpotGO extends SpotGO {

    getSizeShadow(length) {
        const size = super.getSizeShadow(length);
        if (size.length === 2) {
            size.width += size.cardGeometry.offsetOpenCardX;
        } else if (size.length > 2) {
            size.width += size.cardGeometry.offsetOpenCardX * 2;
        }
        return size;
    }
}