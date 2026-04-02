// 终局界面
// UI风格：暖色调（渐变背景、直升机动画、彩纸特效)
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class EndScene {
  constructor() {
    this._animT = 0
    this._helicopterX = -200
    this._helicopterY = CONFIG.H * 0.2
    this._showContent = false
    this.blessText = ''
    this.floor = 365
    this._confettiDone = false
    this._charY = CONFIG.H * 0.55

    this.replayBtn = { x: CONFIG.W / 2 - 170, y: 0, w: 340, h: 100, id: 'replay' }
    this.shareBtn = { x: CONFIG.W / 2 - 170, y: 0, w: 340, h: 100, id: 'share' }
  }

  show(floor, blessText, onConfetti) {
    this.floor = floor
    this.blessText = blessText
    this._animT = 0
    this._helicopterX = -200
    this._showContent = false
    this._confettiDone = false
    this._charY = CONFIG.H * 0.7
    this._onConfetti = onConfetti
  }

  update(dt) {
    this._animT += dt

    if (this._animT < 1.5) {
      this._helicopterX += (CONFIG.W / 2 - this._helicopterX) * dt * 3
      this._helicopterY = CONFIG.H * 0.2 + Math.sin(this._animT * 2) * 10
    } else {
      this._helicopterX = CONFIG.W / 2
      this._helicopterY = CONFIG.H * 0.2 + Math.sin(this._animT * 2) * 10

      if (this._charY > CONFIG.H * 0.26) {
        this._charY -= (this._charY - CONFIG.H * 0.26) * dt * 2
      }
    }

    if (this._animT > 1.8 && !this._showContent) {
      this._showContent = true
    }

    if (this._animT > 1.2 && !this._confettiDone) {
      this._confettiDone = true
      if (this._onConfetti) this._onConfetti()
    }
  }

  render(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.H)
    bgGrad.addColorStop(0, '#FFF0C8')
    bgGrad.addColorStop(0.4, '#FFE4A3')
    bgGrad.addColorStop(0.8, '#FFD4C2')
    bgGrad.addColorStop(1, '#FFBCCC')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H)

    this._drawStars(ctx)
    this._drawHelicopter(ctx)
    this._drawCharacter(ctx)

    if (this._showContent) {
      this._drawContent(ctx)
    }
  }

  _drawStars(ctx) {
    const t = this._animT
    ctx.save()
    ctx.fillStyle = '#FFFFFF'
    const starData = [
      [60, 80, 2], [200, 40, 1.5], [380, 90, 2.5], [560, 50, 1.5],
      [680, 120, 2], [120, 180, 1], [300, 200, 2], [500, 160, 1.5],
      [700, 200, 1], [80, 280, 2], [420, 250, 1.5], [600, 280, 2],
    ]
    for (const [x, y, r] of starData) {
      const twinkle = 0.5 + 0.5 * Math.sin(t * 3 + x * 0.1)
      ctx.globalAlpha = twinkle
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  _drawHelicopter(ctx) {
    const x = this._helicopterX
    const y = this._helicopterY
    const t = this._animT

    ctx.save()
    ctx.translate(x, y)
    ctx.scale(2.5, 2.5)

    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 6

    ctx.fillStyle = '#4A90D4'
    ctx.beginPath()
    ctx.ellipse(0, 0, 50, 25, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#2E5A8C'
    ctx.beginPath()
    ctx.ellipse(0, -15, 40, 15, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(0, 0, 15, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    const bladeAngle = t * 15
    ctx.save()
    ctx.translate(0, -25)
    ctx.rotate(bladeAngle)
    ctx.fillStyle = '#666'
    ctx.fillRect(-4, -30, 8, 60)
    ctx.restore()

    ctx.restore()
    ctx.restore()
  }

  _drawCharacter(ctx) {
    const x = CONFIG.W / 2
    const y = this._charY
    const R = 40

    ctx.save()
    ctx.translate(x, y)

    ctx.beginPath()
    ctx.ellipse(0, R + 10, R * 0.6, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#2A1A0E'
    ctx.beginPath(); ctx.arc(-R * 0.28, R * 0.05, 5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(R * 0.28, R * 0.05, 5, 0, Math.PI * 2); ctx.fill()

    ctx.beginPath()
    ctx.moveTo(-R * 0.3, R * 0.25)
    ctx.quadraticCurveTo(0, R * 0.45, R * 0.3, R * 0.25)
    ctx.strokeStyle = '#2A1A0E'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.restore()
  }

  _drawContent(ctx) {
    const t = this._animT

    ctx.save()

    const cardW = CONFIG.W - 100
    const cardH = 280
    const cardX = 50
    const cardY = CONFIG.H * 0.55

    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 20
    this._roundRect(ctx, cardX, cardY, cardW, cardH, 36)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = C.TEXT_SECONDARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('YOU REACHED', CONFIG.W / 2, cardY + 30)

    ctx.font = 'bold 100px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    ctx.fillText(`${this.floor}`, CONFIG.W / 2, cardY + 100)

    ctx.font = 'bold 32px sans-serif'
    ctx.fillStyle = C.TEXT_SECONDARY
    ctx.fillText('F', CONFIG.W / 2 + 70, cardY + 160)

    ctx.restore()

    ctx.save()
    ctx.font = 'bold 36px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    this._wrapText(ctx, this.blessText, 50, CONFIG.H * 0.78, CONFIG.W - 100, 48)
    ctx.restore()

    const btn1Y = CONFIG.H * 0.82
    const btn2Y = CONFIG.H * 0.82 + 120

    this.replayBtn.y = btn1Y - 50
    this.shareBtn.y = btn2Y - 50

    this._drawActionBtn(ctx, CONFIG.W / 2, btn1Y, 340, 100, '🔄 再玩一次', C.YELLOW, C.YELLOW_DEEP)
    this._drawActionBtn(ctx, CONFIG.W / 2, btn2Y, 340, 90, '📸 分享到朋友圈', '#FFFFFF', C.CREAM_DARK, C.TEXT_PRIMARY)
  }

  _drawActionBtn(ctx, cx, cy, w, h, text, bgColor, shadowColor, textColor = '#FFFFFF') {
    ctx.save()

    ctx.shadowColor = shadowColor
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 4
    this._roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2)
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    ctx.font = 'bold 38px sans-serif'
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, cx, cy)

    ctx.restore()
  }

  getClickAreas() {
    if (!this._showContent) return []
    return [this.replayBtn, this.shareBtn]
  }

  _wrapText(ctx, text, x, y, maxW, lineH) {
    if (!text) return
    const words = text.split('')
    let line = '', lineY = y
    for (const ch of words) {
      const test = line + ch
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, CONFIG.W / 2, lineY)
        line = ch
        lineY += lineH
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, CONFIG.W / 2, lineY)
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

module.exports = { EndScene }
