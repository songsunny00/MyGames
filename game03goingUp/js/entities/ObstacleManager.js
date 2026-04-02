// 障碍物管理器（炸弹 + 礼包）
// 负责生成和管理从屏幕顶部掉落的炸弹和礼包
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class ObstacleManager {
  constructor() {
    this.bombs = []     // 活跃炸弹列表
    this.gifts = []     // 活跃礼包列表
    this._bombTimer = this._nextBombInterval()
    this._giftTimer = this._nextGiftInterval()
    this._completionRound = 0  // 当前周目（0/1/2）
  }

  setRound(round) {
    this._completionRound = round
  }

  _nextBombInterval() {
    return CONFIG.BOMB_INTERVAL_MIN +
      Math.random() * (CONFIG.BOMB_INTERVAL_MAX - CONFIG.BOMB_INTERVAL_MIN)
  }

  _nextGiftInterval() {
    return CONFIG.GIFT_INTERVAL_MIN +
      Math.random() * (CONFIG.GIFT_INTERVAL_MAX - CONFIG.GIFT_INTERVAL_MIN)
  }

  _bombChance(floor) {
    if (floor > 250) return CONFIG.BOMB_CHANCE_HIGH
    if (floor > 100) return CONFIG.BOMB_CHANCE_MID
    return CONFIG.BOMB_CHANCE_LOW
  }

  _giftChance() {
    if (this._completionRound >= 2) return CONFIG.GIFT_CHANCE_ROUND3
    if (this._completionRound >= 1) return CONFIG.GIFT_CHANCE_ROUND2
    return CONFIG.GIFT_CHANCE_ROUND1
  }

  _giftTier() {
    const r = Math.random()
    if (r < CONFIG.GIFT_BRONZE_CHANCE) return 'bronze'
    if (r < CONFIG.GIFT_BRONZE_CHANCE + CONFIG.GIFT_SILVER_CHANCE) return 'silver'
    return 'gold'
  }

  // 每帧更新
  update(dt, floor) {
    // 计时器递减
    this._bombTimer -= dt
    this._giftTimer -= dt

    // 尝试生成炸弹
    if (this._bombTimer <= 0) {
      this._bombTimer = this._nextBombInterval()
      if (Math.random() < this._bombChance(floor)) {
        this._spawnBomb()
      }
    }

    // 尝试生成礼包
    if (this._giftTimer <= 0) {
      this._giftTimer = this._nextGiftInterval()
      if (Math.random() < this._giftChance()) {
        this._spawnGift()
      }
    }

    // 更新炸弹位置
    for (const bomb of this.bombs) {
      bomb.warnTimer -= dt
      if (bomb.warnTimer <= 0) {
        bomb.y += CONFIG.BOMB_FALL_SPEED * dt
      }
    }

    // 更新礼包位置
    for (const gift of this.gifts) {
      gift.y += CONFIG.GIFT_FALL_SPEED * dt
    }

    // 清理飞出屏幕的物体
    this.bombs = this.bombs.filter(b => b.y < CONFIG.H + 100)
    this.gifts = this.gifts.filter(g => g.y < CONFIG.H + 100)
  }

  _spawnBomb() {
    const x = 80 + Math.random() * (CONFIG.W - 160)
    this.bombs.push({
      x,
      y: -CONFIG.BOMB_H,
      w: CONFIG.BOMB_W,
      h: CONFIG.BOMB_H,
      warnTimer: CONFIG.BOMB_WARN_TIME,
      warnX: x,  // 闪烁预警位置（X固定）
    })
  }

  _spawnGift() {
    const x = 80 + Math.random() * (CONFIG.W - 160)
    this.gifts.push({
      x,
      y: -CONFIG.GIFT_H,
      w: CONFIG.GIFT_W,
      h: CONFIG.GIFT_H,
      tier: this._giftTier(),
    })
  }

  // 碰撞检测：返回命中的炸弹或null
  checkBombHit(char) {
    const charLeft = char.worldX - CONFIG.CHAR_W / 2
    const charRight = char.worldX + CONFIG.CHAR_W / 2
    const charTop = char.worldY - CONFIG.CHAR_H
    const charBottom = char.worldY

    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i]
      if (b.warnTimer > 0) continue  // 预警中不碰撞

      if (
        charRight > b.x - b.w / 2 && charLeft < b.x + b.w / 2 &&
        charBottom > b.y - b.h / 2 && charTop < b.y + b.h / 2
      ) {
        this.bombs.splice(i, 1)
        return b
      }
    }
    return null
  }

  // 碰撞检测：返回命中的礼包或null
  checkGiftHit(char) {
    const charLeft = char.worldX - CONFIG.CHAR_W / 2
    const charRight = char.worldX + CONFIG.CHAR_W / 2
    const charTop = char.worldY - CONFIG.CHAR_H
    const charBottom = char.worldY

    for (let i = this.gifts.length - 1; i >= 0; i--) {
      const g = this.gifts[i]
      if (
        charRight > g.x - g.w / 2 && charLeft < g.x + g.w / 2 &&
        charBottom > g.y - g.h / 2 && charTop < g.y + g.h / 2
      ) {
        this.gifts.splice(i, 1)
        return g
      }
    }
    return null
  }

  // 注意：炸弹和礼包使用屏幕坐标（不受世界滚动影响）
  // 在GameScene中，炸弹/礼包直接用屏幕Y绘制

  renderBombs(ctx) {
    const now = Date.now() / 1000
    for (const bomb of this.bombs) {
      if (bomb.warnTimer > 0) {
        // 预警闪烁：在爆炸位置显示红色闪烁光标
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(now * 10))
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#FF3333'
        ctx.beginPath()
        ctx.arc(bomb.warnX, 60, 20, 0, Math.PI * 2)
        ctx.fill()
        // 箭头指示
        ctx.fillStyle = '#FF3333'
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('↓', bomb.warnX, 100)
        ctx.restore()
      } else {
        this._drawBomb(ctx, bomb.x, bomb.y)
      }
    }
  }

  renderGifts(ctx) {
    for (const gift of this.gifts) {
      this._drawGift(ctx, gift.x, gift.y, gift.tier)
    }
  }

  _drawBomb(ctx, cx, cy) {
    const R = 34
    ctx.save()

    // 阴影
    ctx.beginPath()
    ctx.ellipse(cx + 4, cy + R + 4, R * 0.6, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fill()

    // 炸弹主体
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fillStyle = C.BOMB_BODY
    ctx.fill()

    // 炸弹高光
    ctx.beginPath()
    ctx.arc(cx - R * 0.3, cy - R * 0.3, R * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fill()

    // 引信（弯曲线）
    ctx.beginPath()
    ctx.moveTo(cx, cy - R)
    ctx.bezierCurveTo(cx + 14, cy - R - 16, cx + 26, cy - R - 8, cx + 30, cy - R + 4)
    ctx.strokeStyle = C.BOMB_FUSE
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    // 火花
    const t = Date.now() / 1000
    const sparkAlpha = 0.6 + 0.4 * Math.sin(t * 12)
    ctx.save()
    ctx.globalAlpha = sparkAlpha
    ctx.beginPath()
    ctx.arc(cx + 30, cy - R + 4, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#FF8C00'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + 30, cy - R + 4, 6, 0, Math.PI * 2)
    ctx.fillStyle = C.BOMB_SPARK
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + 30, cy - R + 4, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.restore()

    ctx.restore()
  }

  _drawGift(ctx, cx, cy, tier) {
    const W = 68, H = 68
    const x = cx - W / 2, y = cy - H / 2

    const tierColor = tier === 'gold' ? '#FFD700' : tier === 'silver' ? '#C0C0C0' : '#CD7F32'
    const tierDark = tier === 'gold' ? '#C8A000' : tier === 'silver' ? '#909090' : '#A05020'

    ctx.save()

    // 跳动动画
    const t = Date.now() / 1000
    const bounceY = Math.abs(Math.sin(t * 2.5)) * 6
    ctx.translate(cx, cy - bounceY)

    // 光晕
    const grd = ctx.createRadialGradient(0, 0, 10, 0, 0, 50)
    grd.addColorStop(0, `${tierColor}40`)
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.fillRect(-50, -50, 100, 100)

    // 盒体阴影
    ctx.shadowColor = tierDark
    ctx.shadowBlur = 10

    // 盒体下半
    ctx.beginPath()
    this._roundRect(ctx, -W / 2, 0, W, H / 2, 6)
    ctx.fillStyle = tierColor
    ctx.fill()

    // 盒盖
    ctx.beginPath()
    this._roundRect(ctx, -W / 2 - 4, -H / 2 - 8, W + 8, H / 2 + 8, 8)
    ctx.fillStyle = tierColor
    ctx.fill()
    ctx.shadowBlur = 0

    // 丝带竖线
    ctx.fillStyle = tierDark
    ctx.fillRect(-6, -H / 2 - 8, 12, H)

    // 丝带横线
    ctx.fillRect(-W / 2 - 4, -8, W + 8, 12)

    // 蝴蝶结
    ctx.fillStyle = tierDark
    ctx.beginPath()
    ctx.ellipse(-16, -H / 2 - 8, 16, 10, -0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(16, -H / 2 - 8, 16, 10, 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, -H / 2 - 8, 8, 0, Math.PI * 2)
    ctx.fillStyle = tierColor
    ctx.fill()

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(-W / 2 + 8, -H / 2 - 2, W / 3, 8)

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

  reset() {
    this.bombs = []
    this.gifts = []
    this._bombTimer = this._nextBombInterval()
    this._giftTimer = this._nextGiftInterval()
  }
}

module.exports = { ObstacleManager }
