// 视觉特效系统
// 处理飘字、屏幕震动、粒子等效果
const { CONFIG } = require('../config.js')

class FeedbackFX {
  constructor() {
    this.floatTexts = []   // 飘字列表
    this.particles = []    // 粒子列表
    this.shakeAmount = 0   // 当前震动幅度
    this.shakeTimer = 0    // 震动剩余时间
    this._shakeX = 0
    this._shakeY = 0
  }

  // 添加飘字
  addFloatText(text, x, y, options = {}) {
    const {
      color = '#FFFFFF',
      fontSize = 44,
      duration = CONFIG.FX.FLOAT_TEXT_LIFE,
      riseSpeed = 120,
    } = options

    this.floatTexts.push({
      text,
      x, y,
      color,
      fontSize,
      duration,
      life: duration,
      riseSpeed,
    })
  }

  // 触发屏幕震动
  shake(intensity = 10, duration = CONFIG.FX.SHAKE_DURATION) {
    this.shakeAmount = intensity
    this.shakeTimer = duration
  }

  // 爆发粒子（礼包、答对等）
  burst(x, y, count = 12, color = '#FFD700') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5
      const speed = 200 + Math.random() * 300
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 200,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        r: 4 + Math.random() * 8,
        color,
      })
    }
  }

  // 彩纸粒子（终局用）
  confetti(count = 30) {
    const colors = ['#FF6B6B', '#FFD700', '#4CAF50', '#2196F3', '#FF9800', '#E91E63']
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * CONFIG.W,
        y: -20,
        vx: (Math.random() - 0.5) * 300,
        vy: 100 + Math.random() * 200,
        life: 2 + Math.random(),
        maxLife: 3,
        r: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        isRect: true,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
      })
    }
  }

  // 每帧更新
  update(dt) {
    // 更新飘字
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i]
      ft.life -= dt
      ft.y -= ft.riseSpeed * dt
      if (ft.life <= 0) this.floatTexts.splice(i, 1)
    }

    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 600 * dt  // 重力
      if (p.rotSpeed) p.rotation += p.rotSpeed * dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }

    // 更新震动
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt
      const progress = this.shakeTimer / CONFIG.FX.SHAKE_DURATION
      const amp = this.shakeAmount * progress
      this._shakeX = (Math.random() - 0.5) * amp * 2
      this._shakeY = (Math.random() - 0.5) * amp * 2
    } else {
      this._shakeX = 0
      this._shakeY = 0
    }
  }

  // 渲染（在save/restore内调用）
  render(ctx) {
    this._renderParticles(ctx)
    this._renderFloatTexts(ctx)
  }

  _renderParticles(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife)
      ctx.save()
      ctx.globalAlpha = alpha
      if (p.isRect) {
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation || 0)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }
      ctx.restore()
    }
  }

  _renderFloatTexts(ctx) {
    for (const ft of this.floatTexts) {
      const alpha = Math.min(1, ft.life / ft.duration * 2)  // 淡出
      ctx.save()
      ctx.globalAlpha = Math.max(0, alpha)
      ctx.font = `bold ${ft.fontSize}px sans-serif`
      ctx.fillStyle = ft.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      // 文字描边增加可读性
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 4
      ctx.strokeText(ft.text, ft.x, ft.y)
      ctx.fillText(ft.text, ft.x, ft.y)
      ctx.restore()
    }
  }

  // 应用震动偏移（在开始render时调用ctx.translate）
  applyShake(ctx) {
    if (this.shakeTimer > 0) {
      ctx.translate(this._shakeX, this._shakeY)
    }
  }
}

module.exports = { FeedbackFX }
