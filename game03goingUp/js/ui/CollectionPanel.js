// 收集面板（Collection Panel）
// 展示玩家收集的徽章、宣言、目的地
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

const COLLECTION_DATA = [
  { id: 'badge', name: '摸鱼徽章', items: ['准时下班', '摸鱼大师', '绩效摆烂王', '365天零加班'] },
  { id: 'declaration', name: '离职宣言', items: ['老子不干了！', '感谢公司培养，但我更感谢自己的勇气', 'KPI永远差一点，人已到海南了'] },
  { id: 'destination', name: '旅游目的地', items: ['大理', '三亚', '日本', '欧洲'] },
]

class CollectionPanel {
  constructor() {
    this.visible = false
    this.progress = [0, 0, 0]
    this._animT = 0
  }

  show(progress) {
    this.visible = true
    this.progress = progress || [0, 0, 0]
    this._animT = 0
  }

  hide() {
    this.visible = false
  }

  update(dt) {
    if (this.visible) {
      this._animT += dt
    }
  }

  render(ctx) {
    if (!this.visible) return

    ctx.save()
    ctx.fillStyle = 'rgba(61, 43, 31, 0.45)'
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H)

    const pw = CONFIG.W - 80
    const ph = 700
    const px = 40
    const py = (CONFIG.H - ph) / 2

    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 20
    this._roundRect(ctx, px, py, pw, ph, 36)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.font = 'bold 40px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('🏅 我的收集', CONFIG.W / 2, py + 30)

    const closeBtn = { x: px + pw - 70, y: py + 15, w: 55, h: 55, id: 'close' }
    ctx.fillStyle = C.CREAM
    this._roundRect(ctx, closeBtn.x, closeBtn.y, closeBtn.w, closeBtn.h, 14)
    ctx.fill()
    ctx.font = 'bold 32px sans-serif'
    ctx.fillStyle = C.TEXT_SECONDARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✕', closeBtn.x + closeBtn.w / 2, closeBtn.y + closeBtn.h / 2)

    const gridY = py + 90
    const slotW = (pw - 40) / 3
    const slotH = 160
    const gap = 20

    for (let i = 0; i < 3; i++) {
      const slotX = px + 20 + i * (slotW + gap)
      const unlocked = this.progress[i] > 0

      ctx.save()
      if (unlocked) {
        const grad = ctx.createLinearGradient(slotX, gridY, slotX + slotW, gridY + slotH)
        grad.addColorStop(0, '#E8F9F0')
        grad.addColorStop(1, '#D0F4E4')
        ctx.fillStyle = grad
        this._roundRect(ctx, slotX, gridY, slotW, slotH, 20)
        ctx.fill()
        ctx.strokeStyle = C.GREEN_LIGHT
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        ctx.fillStyle = C.CREAM_DARK
        this._roundRect(ctx, slotX, gridY, slotW, slotH, 20)
        ctx.fill()
        ctx.globalAlpha = 0.7
      }

      ctx.font = 'bold 22px sans-serif'
      ctx.fillStyle = C.TEXT_PRIMARY
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      const category = COLLECTION_DATA[i]
      ctx.fillText(category.name, slotX + slotW / 2, gridY + 15)

      if (unlocked) {
        const itemIndex = this.progress[i] - 1
        const item = category.items[itemIndex] || category.items[0]

        ctx.font = '48px sans-serif'
        const emoji = i === 0 ? '🏆' : i === 1 ? '📝' : '✈️'
        ctx.fillText(emoji, slotX + slotW / 2, gridY + 60)

        ctx.font = '20px sans-serif'
        ctx.fillStyle = C.TEXT_SECONDARY
        this._wrapText(ctx, item, slotX + 15, gridY + 115, slotW - 30, 26, 2)

        ctx.fillStyle = C.GREEN
        this._roundRect(ctx, slotX + slotW - 55, gridY + 10, 45, 22, 11)
        ctx.fill()
        ctx.font = 'bold 14px sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('已获得', slotX + slotW - 32, gridY + 21)
      } else {
        ctx.font = '48px sans-serif'
        ctx.fillText('🔒', slotX + slotW / 2, gridY + 60)

        ctx.font = '18px sans-serif'
        ctx.fillStyle = C.TEXT_SECONDARY
        ctx.fillText('再玩一次解锁', slotX + slotW / 2, gridY + 120)
      }

      ctx.restore()
    }

    const totalCollected = this.progress.filter(p => p > 0).length
    const progressText = `收集进度 ${totalCollected}/3`
    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = C.TEXT_SECONDARY
    ctx.textAlign = 'right'
    ctx.fillText(progressText, px + pw - 20, py + ph - 80)

    const barY = py + ph - 70
    const barW = pw - 40
    const barH = 16
    ctx.fillStyle = C.CREAM
    this._roundRect(ctx, px + 20, barY, barW, barH, 8)
    ctx.fill()

    const fillW = barW * (totalCollected / 3)
    if (fillW > 0) {
      const progGrad = ctx.createLinearGradient(px + 20, barY, px + 20 + fillW, barY + barH)
      progGrad.addColorStop(0, C.GREEN)
      progGrad.addColorStop(1, '#30D484')
      ctx.fillStyle = progGrad
      this._roundRect(ctx, px + 20, barY, fillW, barH, 8)
      ctx.fill()
    }

    const btnY = py + ph - 50
    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 2
    this._roundRect(ctx, px + 20, btnY, pw - 40, 60, 30)
    ctx.fillStyle = C.YELLOW
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    ctx.font = 'bold 28px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('关闭', CONFIG.W / 2, btnY + 30)

    ctx.restore()
  }

  getClickAreas() {
    if (!this.visible) return []
    const pw = CONFIG.W - 80
    const ph = 700
    const px = 40
    const py = (CONFIG.H - ph) / 2
    const btnY = py + ph - 50

    return [
      { x: px + 20, y: btnY, w: pw - 40, h: 60, id: 'closeCollection' },
      { x: px + pw - 70, y: py + 15, w: 55, h: 55, id: 'closeCollection' },
    ]
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

  _wrapText(ctx, text, x, y, maxW, lineH, maxLines = 2) {
    if (!text) return
    const chars = text.split('')
    let line = ''
    let lineCount = 0
    for (const ch of chars) {
      const test = line + ch
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y + lineCount * lineH)
        line = ch
        lineCount++
        if (maxLines > 0 && lineCount >= maxLines) break
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, x, y + lineCount * lineH)
  }
}

module.exports = { CollectionPanel }
