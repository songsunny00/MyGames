// 答题面板（Quiz Panel）
// 叠加在GameScene之上的答题弹窗
// UI风格：暖色调（米色背景、白色选项卡片、粉色标签）
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class QuizPanel {
  constructor() {
    this.question = null
    this.selectedIndex = null
    this.resultState = null
    this.resultTimer = 0
    this._animT = 0
    this._slideY = CONFIG.H
    this._targetY = 0
    this._floorNum = 1
  }

  show(question, floorNum = 1) {
    this.question = question
    this.selectedIndex = null
    this.resultState = null
    this.resultTimer = 0
    this._animT = 0
    this._slideY = CONFIG.H
    this._targetY = 0
    this._floorNum = floorNum
  }

  update(dt) {
    this._animT += dt
    const diff = this._targetY - this._slideY
    this._slideY += diff * Math.min(1, dt * 8)

    if (this.resultState !== null && this.resultTimer > 0) {
      this.resultTimer -= dt
    }
  }

  getResult() {
    if (this.resultState !== null && this.resultTimer <= 0) {
      return this.resultState
    }
    return null
  }

  render(ctx) {
    if (!this.question) return

    ctx.save()
    ctx.fillStyle = 'rgba(61, 43, 31, 0.45)'
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H)

    ctx.translate(0, this._slideY)

    const pw = CONFIG.W - 80
    const ph = 900
    const px = 40
    const py = CONFIG.H - ph - 80

    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 30
    this._roundRect(ctx, px, py, pw, ph, 36)
    ctx.fillStyle = C.CREAM
    ctx.fill()
    ctx.shadowBlur = 0

    this._drawFloorBadge(ctx, px + 30, py + 30)

    ctx.font = 'bold 36px sans-serif'
    ctx.fillStyle = C.TEXT_PRIMARY
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    this._wrapText(ctx, this.question.question, px + 30, py + 100, pw - 60, 52)

    const optionStartY = py + 280
    const optionH = 110
    const optionGap = 20
    const labels = ['A', 'B', 'C', 'D']

    for (let i = 0; i < this.question.options.length; i++) {
      const oy = optionStartY + i * (optionH + optionGap)
      this._drawOption(ctx, px + 20, oy, pw - 40, optionH, labels[i], this.question.options[i], i)
    }

    if (this.resultState !== null) {
      this._drawResultBanner(ctx, px + 20, py + ph - 120, pw - 40)
    }

    ctx.restore()
  }

  _drawFloorBadge(ctx, x, y) {
    ctx.save()
    ctx.fillStyle = C.PINK_DEEP
    this._roundRect(ctx, x, y, 200, 50, 25)
    ctx.fill()

    ctx.font = 'bold 26px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`❓ 第 ${this._floorNum} 层挑战`, x + 16, y + 25)
    ctx.restore()
  }

  _drawOption(ctx, x, y, w, h, label, text, index) {
    let bgColor = '#FFFFFF'
    let borderColor = C.CREAM_DARK
    let labelBg = C.CREAM_DARK
    let textColor = C.TEXT_PRIMARY

    if (this.selectedIndex === index) {
      if (this.resultState === 'correct' && index === this.question.answer) {
        bgColor = C.GREEN_LIGHT
        borderColor = C.GREEN
        labelBg = C.GREEN
        textColor = C.TEXT_PRIMARY
      } else if (this.resultState === 'wrong') {
        bgColor = C.RED_LIGHT
        borderColor = C.RED
        labelBg = C.RED
        textColor = C.TEXT_PRIMARY
      } else {
        borderColor = C.YELLOW
        labelBg = C.YELLOW
      }
    } else if (this.resultState === 'wrong' && index === this.question.answer) {
      bgColor = C.GREEN_LIGHT
      borderColor = C.GREEN
      labelBg = C.GREEN
    }

    ctx.save()

    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 2
    this._roundRect(ctx, x, y, w, h, 20)
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    this._roundRect(ctx, x, y, w, h, 20)
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 3
    ctx.stroke()

    const labelSize = 48
    this._roundRect(ctx, x + 16, y + (h - labelSize) / 2, labelSize, labelSize, 16)
    ctx.fillStyle = labelBg
    ctx.fill()

    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x + 16 + labelSize / 2, y + h / 2)

    ctx.font = '30px sans-serif'
    ctx.fillStyle = textColor
    ctx.textAlign = 'left'
    this._wrapText(ctx, text, x + 80, y + 20, w - 100, 38, 2)

    ctx.restore()
  }

  _drawResultBanner(ctx, x, y, w) {
    ctx.save()
    const h = 80
    const isCorrect = this.resultState === 'correct'

    this._roundRect(ctx, x, y, w, h, 20)
    ctx.fillStyle = isCorrect ? '#E8F9F0' : '#FFE8E8'
    ctx.fill()

    ctx.font = 'bold 32px sans-serif'
    ctx.fillStyle = isCorrect ? '#1A8A4A' : '#CC2222'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      isCorrect ? '✅ 去班味成功！继续爬楼！' : '❌ 班味太重了！受到惩罚！',
      x + w / 2,
      y + h / 2
    )
    ctx.restore()
  }

  getOptionAreas() {
    if (this.resultState !== null || !this.question) return []
    const pw = CONFIG.W - 80
    const ph = 900
    const px = 40
    const py = CONFIG.H - ph - 80 + this._slideY
    const optionStartY = py + 280
    const optionH = 110
    const optionGap = 20

    return this.question.options.map((_, i) => ({
      x: px + 20,
      y: optionStartY + i * (optionH + optionGap),
      w: pw - 40,
      h: optionH,
      id: `option_${i}`,
    }))
  }

  selectOption(index) {
    if (this.resultState !== null) return
    this.selectedIndex = index
    const correct = index === this.question.answer
    this.resultState = correct ? 'correct' : 'wrong'
    this.resultTimer = CONFIG.FX.ANSWER_FEEDBACK
  }

  _wrapText(ctx, text, x, y, maxW, lineH, maxLines = 4) {
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

module.exports = { QuizPanel }
