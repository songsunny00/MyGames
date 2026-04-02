// 炸弹惩罚弹窗
const { CONFIG } = require('../config.js')

class BombModal {
  constructor() {
    this._animT = 0
    this._slideY = CONFIG.H
    this.type = 'share'      // 'share' | 'restart' | 'pardon'
    this.countdown = 10      // 倒计时（秒）
    this.currentFloor = 1
    // 按钮区域
    this.shareBtn = { x: 40, y: 0, w: CONFIG.W - 80, h: 100, id: 'share' }
    this.restartBtn = { x: 40, y: 0, w: CONFIG.W - 80, h: 100, id: 'restart' }
  }

  show(type, floor) {
    this.type = type
    this.currentFloor = floor
    this.countdown = 10
    this._animT = 0
    this._slideY = CONFIG.H
  }

  update(dt) {
    this._animT += dt
    const diff = -this._slideY
    this._slideY += diff * Math.min(1, dt * 8)
    if (this.type === 'share') {
      this.countdown = Math.max(0, this.countdown - dt)
    }
  }

  render(ctx) {
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H)
    ctx.translate(0, this._slideY)

    const pw = CONFIG.W - 60
    const ph = this.type === 'share' ? 680 : 500
    const px = 30
    const py = (CONFIG.H - ph) / 2

    // 弹窗背景
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 30
    this._roundRect(ctx, px, py, pw, ph, 28)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.shadowBlur = 0

    // 炸弹图标
    this._drawBombIcon(ctx, CONFIG.W / 2, py + 90)

    // 标题
    ctx.font = 'bold 52px sans-serif'
    ctx.fillStyle = '#E74C3C'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('💥 被炸飞了！', CONFIG.W / 2, py + 200)

    if (this.type === 'pardon') {
      // 保底免死
      ctx.font = '34px sans-serif'
      ctx.fillStyle = '#555555'
      ctx.fillText('感谢你的尝试！', CONFIG.W / 2, py + 280)
      ctx.fillText('已为你自动免除本次惩罚 🎉', CONFIG.W / 2, py + 330)
      // 继续按钮
      const btnY = py + 420
      this.shareBtn.y = btnY
      this._drawActionBtn(ctx, CONFIG.W / 2, btnY + 50, CONFIG.W - 160, 100, '继续爬楼！', '#4CAF50')
    } else if (this.type === 'share') {
      // 分享免死
      ctx.font = '34px sans-serif'
      ctx.fillStyle = '#555555'
      ctx.fillText('分享给朋友，免除这次惩罚！', CONFIG.W / 2, py + 278)
      ctx.font = '28px sans-serif'
      ctx.fillStyle = '#999999'
      ctx.fillText(`已到达第 ${this.currentFloor} 层`, CONFIG.W / 2, py + 328)

      // 倒计时
      const timerColor = this.countdown < 4 ? '#E74C3C' : '#F59500'
      ctx.font = 'bold 38px sans-serif'
      ctx.fillStyle = timerColor
      ctx.fillText(`${Math.ceil(this.countdown)}s 后自动重新开始`, CONFIG.W / 2, py + 380)

      // 按钮
      const shareY = py + ph - 220
      const restartY = py + ph - 100
      this.shareBtn.y = shareY - 50
      this.restartBtn.y = restartY - 50

      this._drawActionBtn(ctx, CONFIG.W / 2, shareY, CONFIG.W - 160, 100, '分享给朋友 继续游戏', '#F59500')
      this._drawActionBtn(ctx, CONFIG.W / 2, restartY, CONFIG.W - 160, 90, '重新开始', '#CCCCCC', '#333333')
    } else {
      // restart
      ctx.font = '34px sans-serif'
      ctx.fillStyle = '#555555'
      ctx.fillText('太遗憾了...', CONFIG.W / 2, py + 280)
      ctx.font = '28px sans-serif'
      ctx.fillStyle = '#999999'
      ctx.fillText(`已到达第 ${this.currentFloor} 层`, CONFIG.W / 2, py + 336)

      const btnY = py + ph - 130
      this.restartBtn.y = btnY - 50
      this._drawActionBtn(ctx, CONFIG.W / 2, btnY, CONFIG.W - 160, 100, '重新开始', '#E74C3C')
    }

    ctx.restore()
  }

  _drawBombIcon(ctx, cx, cy) {
    const R = 36
    ctx.save()
    ctx.translate(cx, cy)
    const t = this._animT
    ctx.scale(1 + 0.06 * Math.sin(t * 4), 1 + 0.06 * Math.sin(t * 4))

    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fillStyle = '#2A2A2A'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(-R * 0.3, -R * 0.3, R * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(0, -R)
    ctx.bezierCurveTo(14, -R - 16, 26, -R - 8, 30, -R + 4)
    ctx.strokeStyle = '#8B6914'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    // 火花
    const sparkAlpha = 0.6 + 0.4 * Math.abs(Math.sin(t * 12))
    ctx.save()
    ctx.globalAlpha = sparkAlpha
    ctx.beginPath()
    ctx.arc(30, -R + 4, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#FFD700'
    ctx.fill()
    ctx.restore()

    ctx.restore()
  }

  _drawActionBtn(ctx, cx, cy, w, h, text, bgColor, textColor = '#FFFFFF') {
    ctx.save()
    ctx.shadowColor = `${bgColor}88`
    ctx.shadowBlur = 14
    this._roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2)
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.font = 'bold 36px sans-serif'
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, cx, cy)
    ctx.restore()
  }

  getClickAreas() {
    if (this.type === 'pardon') {
      return [{ ...this.shareBtn, id: 'continue' }]
    }
    if (this.type === 'share') {
      return [this.shareBtn, this.restartBtn]
    }
    return [this.restartBtn]
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

module.exports = { BombModal }
