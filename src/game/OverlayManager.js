// @ts-check

export default class OverlayManager {
  constructor(scene) {
    this.scene = scene;

    this.overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.6)
      .setOrigin(0)
      .setScrollFactor(0)
    //   .setDepth(9999)
      .setVisible(false);

    // Подписка на resize
    // scene.scale.on('resize', this.handleResize, this);
  }

  show(duration = 300) {
    this.overlay.setVisible(true).setAlpha(0);
    this.scene.children.bringToTop(this.overlay);

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0.4,
      duration,
      ease: 'Linear'
    });
  }

  hide(duration = 300) {
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.overlay.setVisible(false);
      }
    });
  }

  handleResize() {
    this.overlay.setSize(this.scene.scale.width, this.scene.scale.height);
  }

  destroy() {
    this.overlay.destroy();
    // this.scene.scale.off('resize', this.handleResize, this);
  }
}
