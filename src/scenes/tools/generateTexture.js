const textures = new Map();
let dynamicTextureGradient;
let dynamicTextureCanvas;

export function generateTexture(scene, width, height, radius, color) {

    if (!scene.dynamicTexture) {
        scene.dynamicTexture = new Map();
    }
    if (!scene.dynamicTexture[color]) {
        scene.dynamicTexture[color] = scene.make.graphics({fillStyle: { color: color }});
    }

    let graphics = scene.dynamicTexture[color];

    const _width = Math.round(width);
    const _height = Math.round(height);

    const nameTexture = `dynamicTexture_${color}_${_width}x${_height}`;

    if (!textures.has(nameTexture)) {
        //style && scene.dynamicTexture.fillStyle(style);
        drawBackground(graphics, 0, 0, _width, _height, radius);
        graphics.generateTexture(nameTexture, _width, _height);
        textures.set(nameTexture, true);
    }

    return nameTexture;
}

// Создание градиентного изображения с помощью HTML5 Canvas
export function createGradientTexture(width, height, colorTop, colorBottom) {
    
    const _width = Math.round(width);
    const _height = Math.round(height);

    const nameTexture = `dynamicGradientTexture${_width}x${_height}Top${colorTop}Bottom${colorTop}`;

    if (!dynamicTextureGradient) {
        dynamicTextureGradient = document.createElement('canvas');
    }

    if (!textures.has(nameTexture)) {
        dynamicTextureGradient.width = width;
        dynamicTextureGradient.height = height;
        let context = dynamicTextureGradient.getContext('2d');
        
        var gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, colorTop);
        gradient.addColorStop(1, colorBottom);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        textures.set(nameTexture, true);
    }

    return dynamicTextureGradient;
}

export function createRadialGradientCircleTexture(scene, diameter, colorCenter, colorEdge) {
    const nameTexture = `dynamicRadialCircle_${diameter}_${colorCenter}_${colorEdge}`;

    if (!dynamicTextureCanvas) {
        dynamicTextureCanvas = document.createElement('canvas');
    }

    if (!textures.has(nameTexture)) {
        dynamicTextureCanvas.width = diameter;
        dynamicTextureCanvas.height = diameter;

        let context = dynamicTextureCanvas.getContext('2d');
        const cx = diameter / 2;
        const cy = diameter / 2;
        const radius = diameter / 2;

        // Очищаем канву
        context.clearRect(0, 0, diameter, diameter);

        // Создаём радиальный градиент
        let gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, colorCenter);
        gradient.addColorStop(1, colorEdge);

        // Создаем круг
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        // Сохраняем в Phaser как текстуру
        scene.textures.addCanvas(nameTexture, dynamicTextureCanvas);

        textures.set(nameTexture, true);
    }

    return nameTexture;
}

function drawBackground(graphics, x, y, width, height, radius = 20) {
    

    graphics.clear()

    graphics.beginPath();

    // Start from the top-left corner
    // Move to the start of the top arc
    graphics.moveTo(x + radius, y);

    // Top right corner
    graphics.lineTo(x + width - radius, y);
    graphics.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);

    // Bottom right corner
    graphics.lineTo(x + width, y + height - radius);
    graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);

    // Bottom left corner
    graphics.lineTo(x + radius, y + height);
    graphics.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);

    // Top left corner
    graphics.lineTo(x, y + radius);
    graphics.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);

    graphics.closePath();
    graphics.fillPath();

}