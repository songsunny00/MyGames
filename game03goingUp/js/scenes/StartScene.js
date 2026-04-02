// 开始界面
// UI风格：暖色调（米色背景、渐变按钮、装饰楼梯）
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class StartScene {
  constructor() {
    this._animT = 0
    this.startBtnArea = { x: CONFIG.W / 2 - 180, y: CONFIG.H * 0.62, w: 360, h: 110, id: 'start' }
    this.tutorialBtnArea = { x: CONFIG.W / 2 - 140, y: CONFIG.H * 0.62 + 140, w: 280, h: 80, id: 'tutorial' }
    this._showTutorial = false
  }

  update(dt) {
    this._animT += dt
  }

  render(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.H)
    bgGrad.addColorStop(0, C.CREAM)
    bgGrad.addColorStop(1, C.CREAM_DARK)
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H)

    this._drawDecoStairs(ctx)
    this._drawCloud(ctx, 100, 160, 0.9)
    this._drawCloud(ctx, 560, 240, 0.7)
    this._drawCloud(ctx, 320, 100, 1.0)
    this._drawTitle(ctx)
    this._drawCharacter(ctx)
    this._drawStartButton(ctx)
    this._drawTutorialButton(ctx)
    this._drawStats(ctx)

    if (this._showTutorial) {
      this._drawTutorial(ctx)
    }
  }

  _drawDecoStairs(ctx) {
    const t = this._animT
    const stepW = 280, stepH = 30, gap = 140
    const baseY = CONFIG.H * 0.72

    for (let i = 0; i < 5; i++) {
      const isRight = i % 2 === 0
      const x = isRight ? 80 : CONFIG.W - 80 - stepW
      const y = baseY - i * gap + Math.sin(t * 0.8 + i) * 6

      ctx.save()
      ctx.globalAlpha = 0.35 - i * 0.04

      ctx.beginPath()
      ctx.moveTo(x, y + stepH)
      ctx.lineTo(x + stepW, y + stepH)
      ctx.lineTo(x + stepW, y + stepH + 12)
      ctx.lineTo(x, y + stepH + 12)
      ctx.closePath()
      ctx.fillStyle = '#E09000'
      ctx.fill()

      const grad = ctx.createLinearGradient(x, y, x + stepW, y)
      grad.addColorStop(0, '#C4DC3A')
      grad.addColorStop(1, '#F5A000')
      ctx.beginPath()
      this._roundRect(ctx, x, y, stepW, stepH, 8)
      ctx.fillStyle = grad
      ctx.fill()

      ctx.restore()
    }
  }

  _drawCloud(ctx, x, y, scale) {
    const t = this._animT
    const floatX = Math.sin(t * 0.4) * 12 * scale
    ctx.save()
    ctx.globalAlpha = 0.88
    ctx.translate(x + floatX, y)
    ctx.scale(scale, scale)
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(120,180,220,0.25)'
    ctx.shadowBlur = 12

    const rx = [0, -50, 50, -80, 80, -30, 30]
    const ry = [0, -10, -10, 12, 12, -26, -26]
    const rr = [40, 32, 32, 24, 24, 28, 28]
    for (let i = 0; i < rx.length; i++) {
      ctx.beginPath()
      ctx.arc(rx[i], ry[i], rr[i], 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
    ctx.restore()
  }

  _drawTitle(ctx) {
    const t = this._animT
    const cx = CONFIG.W / 2
    const cy = CONFIG.H * 0.28

    const pulse = 1 + 0.03 * Math.sin(t * 2)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(pulse, pulse)

    ctx.font = `bold 110px sans-serif`
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('爬楼', 4, 4)

    const titleGrad = ctx.createLinearGradient(-120, -50, 120, 50)
    titleGrad.addColorStop(0, C.YELLOW)
    titleGrad.addColorStop(0.5, C.PEACH)
    titleGrad.addColorStop(1, C.PINK_DEEP)
    ctx.fillStyle = titleGrad
    ctx.fillText('爬楼', 0, 0)

    ctx.font = `32px sans-serif`
    ctx.fillStyle = 'rgba(61,43,31,0.7)'
    ctx.fillText('Going Up · 逃离班味', 0, 80)

    ctx.restore()
  }

  _drawCharacter(ctx) {
    const t = this._animT
    const cx = CONFIG.W / 2
    const cy = CONFIG.H * 0.47
    const bobY = Math.sin(t * 2.5) * 10
    const R = 48

    ctx.save()
    ctx.translate(cx, cy + bobY)

    ctx.beginPath()
    ctx.ellipse(0, R + 10, R * 0.6, 10, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.beginPath()
    ctx.arc(-R * 0.25, -R * 0.3, R * 0.35, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fill()

    const hatW = R * 1.1, hatH = R * 0.7
    this._roundRect(ctx, -hatW / 2, -(R + hatH), hatW, hatH, 10)
    ctx.fillStyle = '#8B6340'
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(0, -(R + 4), hatW * 0.75, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#6B4820'
    ctx.fill()

    ctx.fillStyle = '#2A1A0E'
    ctx.beginPath(); ctx.arc(-R * 0.28, R * 0.05, 6, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(R * 0.28, R * 0.05, 6, 0, Math.PI * 2); ctx.fill()

    ctx.beginPath()
    ctx.moveTo(-R * 0.3, R * 0.3)
    ctx.quadraticCurveTo(0, R * 0.55, R * 0.3, R * 0.3)
    ctx.strokeStyle = '#2A1A0E'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.restore()
  }

  _drawStats(ctx) {
    const stats = [
      { icon: '🎯', text: '365 层' },
      { icon: '❓', text: '100 题' },
      { icon: '⏱', text: '3–5 分钟' },
    ]

    const startX = CONFIG.W / 2 - 200
    const y = CONFIG.H * 0.58

    ctx.save()
    for (let i = 0; i < stats.length; i++) {
      const x = startX + i * 140

      ctx.shadowColor = 'rgba(0,0,0,0.08)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 2
      this._roundRect(ctx, x, y, 130, 50, 25)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      ctx.font = '26px sans-serif'
      ctx.fillStyle = C.TEXT_SECONDARY
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${stats[i].icon} ${stats[i].text}`, x + 65, y + 25)
    }
    ctx.restore()
  }

  _drawStartButton(ctx) {
    const btn = this.startBtnArea
    const cx = btn.x + btn.w / 2
    const cy = btn.y + btn.h / 2

    const t = this._animT
    const pulse = 1 + 0.04 * Math.sin(t * 3)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(pulse, pulse)

    ctx.shadowColor = 'rgba(255,200,50,0.4)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 6
    this._roundRect(ctx, -btn.w / 2, -btn.h / 2, btn.w, btn.h, btn.h / 2)
    ctx.fillStyle = '#E8B020'
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    const btnGrad = ctx.createLinearGradient(0, -btn.h / 2, 0, btn.h / 2)
    btnGrad.addColorStop(0, C.YELLOW)
    btnGrad.addColorStop(1, C.PEACH)
    this._roundRect(ctx, -btn.w / 2, -btn.h / 2, btn.w, btn.h, btn.h / 2)
    ctx.fillStyle = btnGrad
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(0, -btn.h * 0.2, btn.w * 0.4, btn.h * 0.2, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fill()

    ctx.font = 'bold 48px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('开始爬楼 🚀', 0, 0)

    ctx.restore()
  }

  _drawTutorialButton(ctx) {
    const btn = this.tutorialBtnArea
    const cx = btn.x + btn.w / 2
    const cy = btn.y + btn.h / 2

    ctx.save()

    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 2
    this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.h / 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    ctx.font = '32px sans-serif'
    ctx.fillStyle = C.TEXT_SECONDARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('? 游戏说明', cx, cy)
    ctx.restore()
  }

  _drawTutorial(ctx) {
    ctx.save()
    ctx.fillStyle = 'rgba(61, 43, 31, 0.65)'
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H)

    const pw = CONFIG.W - 80, ph = 900
    const px = 40, py = (CONFIG.H - ph) / 2

    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 20
    this._roundRect(ctx, px, py, pw, ph, 24)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.font = 'bold 44px sans-serif'
    ctx.fillStyle = C.PINK_DEEP
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('游戏说明', CONFIG.W / 2, py + 40)

    const lines = [
      '👈 左滑 / 右滑 👉',
      '控制角色左右移动',
      '',
      '❓ 遇到问号方块',
      '需要答题才能继续！',
      '',
      '💣 躲避炸弹',
      '被炸了可以分享救命',
      '',
      '🎁 收集礼包',
      '可以跳跃+5/+10层！',
      '',
      '🎯 目标：爬到第365层',
      '逃离职场！',
    ]
    ctx.font = '32px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    let lineY = py + 110
    for (const line of lines) {
      if (line) {
        ctx.fillText(line, CONFIG.W / 2, lineY)
      }
      lineY += 46
    }

    this._roundRect(ctx, CONFIG.W / 2 - 140, py + ph - 90, 280, 70, 35)
    ctx.fillStyle = C.PINK_DEEP
    ctx.fill()
    ctx.font = 'bold 34px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('知道了！', CONFIG.W / 2, py + ph - 55)

    ctx.restore()
  }

  getClickAreas() {
    if (this._showTutorial) {
      const ph = 900, py = (CONFIG.H - 900) / 2
      return [
        { x: CONFIG.W / 2 - 140, y: py + 900 - 90, w: 280, h: 70, id: 'closeTutorial' }
      ]
    }
    return [this.startBtnArea, this.tutorialBtnArea]
  }

  handleTap(id) {
    if (id === 'tutorial') this._showTutorial = true
    if (id === 'closeTutorial') this._showTutorial = false
    if (id === 'start') return 'start'
    return null
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

module.exports = { StartScene }
