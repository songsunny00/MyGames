// HUD（游戏界面抬头显示）
// 绘制楼层计数、暂停按钮、收集入口等
// UI风格：暖色调、白底胶囊、橙色楼层文字
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class HUD {
  constructor() {
    this.pauseArea = { x: CONFIG.W - 100, y: 30, w: 70, h: 70, id: 'pause' }
    this.collectionArea = { x: CONFIG.W - 190, y: 30, w: 80, h: 70, id: 'collection' }
  }

  render(ctx, floor, maxFloor, collectionProgress) {
    ctx.save()

    this._drawFloorPill(ctx, floor, maxFloor)
    this._drawPauseButton(ctx)
    this._drawCollectionButton(ctx, collectionProgress)

    ctx.restore()
  }

  _drawFloorPill(ctx, floor, maxFloor) {
    const x = 30, y = 30, w = 260, h = 70

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.10)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 3
    this._roundRect(ctx, x, y, w, h, h / 2)
    ctx.fillStyle = C.HUD_BG
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    ctx.restore()

    ctx.save()
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = '#AAC4DC'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('楼层', x + 20, y + h / 2)
    ctx.restore()

    ctx.save()
    ctx.font = 'bold 42px sans-serif'
    ctx.fillStyle = C.TEXT_FLOOR
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(200,100,0,0.15)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 2
    ctx.fillText(`${floor}`, x + 75, y + h / 2)
    ctx.shadowBlur = 0
    ctx.restore()

    ctx.save()
    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#C8D8E8'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`/${CONFIG.MAX_FLOOR}`, x + 130, y + h / 2)
    ctx.restore()
  }

  _drawPauseButton(ctx) {
    const { x, y, w, h } = this.pauseArea
    const cx = x + w / 2
    const cy = y + h / 2
    const R = 32

    ctx.save()

    ctx.shadowColor = 'rgba(60,120,200,0.18)'
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 3
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fillStyle = C.HUD_BG
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    const barW = 8, barH = 24
    const gap = 10
    ctx.fillStyle = '#3A87D4'
    this._roundRect(ctx, cx - gap / 2 - barW, cy - barH / 2, barW, barH, 4)
    ctx.fill()
    this._roundRect(ctx, cx + gap / 2, cy - barH / 2, barW, barH, 4)
    ctx.fill()

    ctx.restore()
  }

  renderPauseOverlay(ctx) {
    ctx.save()
    ctx.fillStyle = 'rgba(61, 43, 31, 0.45)'
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H)

    const cardW = CONFIG.W * 0.7
    const cardH = 320
    const cardX = (CONFIG.W - cardW) / 2
    const cardY = (CONFIG.H - cardH) / 2

    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 30
    this._roundRect(ctx, cardX, cardY, cardW, cardH, 36)
    ctx.fillStyle = C.HUD_BG
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.font = 'bold 44px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⏸ 游戏暂停', CONFIG.W / 2, cardY + 70)

    this._drawActionButton(ctx, CONFIG.W / 2, cardY + 170, cardW - 60, 80, '继续游戏', C.YELLOW, C.YELLOW_DEEP)
    this._drawActionButton(ctx, CONFIG.W / 2, cardY + 265, cardW - 60, 70, '退出到主页', '#FFFFFF', C.CREAM_DARK, C.TEXT_SECONDARY)

    ctx.restore()
  }

  getPauseOverlayAreas() {
    const cardW = CONFIG.W * 0.7
    const cardH = 320
    const cardY = (CONFIG.H - cardH) / 2

    return [
      { x: (CONFIG.W - cardW + 60) / 2, y: cardY + 130, w: cardW - 60, h: 80, id: 'resume' },
      { x: (CONFIG.W - cardW + 60) / 2, y: cardY + 230, w: cardW - 60, h: 70, id: 'exit' },
    ]
  }

  _drawActionButton(ctx, cx, cy, w, h, text, bgColor, shadowColor, textColor = '#FFFFFF') {
    ctx.save()

    ctx.shadowColor = shadowColor || 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 4
    this._roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2)
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    ctx.font = `bold ${h * 0.4}px sans-serif`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, cx, cy)

    ctx.restore()
  }

  getClickAreas() {
    return [this.pauseArea, this.collectionArea]
  }

  _drawCollectionButton(ctx, progress) {
    const { x, y, w, h } = this.collectionArea
    const cx = x + w / 2
    const cy = y + h / 2

    ctx.save()

    ctx.shadowColor = 'rgba(200,140,0,0.14)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 3
    this._roundRect(ctx, x, y, w, h, h / 2)
    ctx.fillStyle = C.HUD_BG
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = '#D4870A'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`🎁 ${progress}`, cx, cy)

    ctx.restore()
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }
}

module.exports = { HUD }
