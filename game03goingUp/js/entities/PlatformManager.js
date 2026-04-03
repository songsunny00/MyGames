// 平台管理器
// 负责生成连续的Z型楼梯，支持缺口和障碍物放置
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class PlatformManager {
  constructor() {
    this.segments = []         // 楼梯段列表（斜坡+拐角）
    this.nextFloor = 1         // 下一个待生成的楼层
    this.quizTriggers = []     // 触发的quiz楼层
    this._nextQuizFloor = this._randomQuizFloor(0)
    this._nextGiftFloor = this._randomGiftFloor(0)
    this._round = 0            // 当前周目
  }

  init(cameraWorldY, round = 0) {
    this.segments = []
    this.nextFloor = 1
    this._round = round
    this._nextQuizFloor = this._randomQuizFloor(0)
    this._nextGiftFloor = this._randomGiftFloor(0)
    this.quizTriggers = []
    this._generate(cameraWorldY)
  }

  setRound(round) {
    this._round = round
  }

  // 楼层世界Y坐标
  floorToWorldY(floor) {
    return -(floor - 1) * CONFIG.FLOOR_HEIGHT
  }

  // 楼层X范围
  floorToXRange(floor) {
    const width = this._floorWidth(floor)
    const isRightToLeft = floor % 2 === 1
    if (isRightToLeft) {
      return { startX: CONFIG.W - CONFIG.PLATFORM_MARGIN, endX: CONFIG.PLATFORM_MARGIN, width, direction: -1 }
    } else {
      return { startX: CONFIG.PLATFORM_MARGIN, endX: CONFIG.W - CONFIG.PLATFORM_MARGIN, width, direction: 1 }
    }
  }

  _floorWidth(floor) {
    const shrink = Math.floor((floor - 1) * CONFIG.PLATFORM_W_SHRINK)
    return Math.max(CONFIG.PLATFORM_W_MIN, CONFIG.PLATFORM_W_START - shrink)
  }

  _generate(cameraWorldY) {
    const topY = cameraWorldY - CONFIG.H - CONFIG.FLOOR_HEIGHT
    const maxFloor = CONFIG.MAX_FLOOR + 5

    while (this.nextFloor <= maxFloor) {
      const floorY = this.floorToWorldY(this.nextFloor)
      if (floorY < topY) break

      this._createFloor(this.nextFloor)
      this.nextFloor++
    }
  }

  _createFloor(floor) {
    const { startX, endX, width, direction } = this.floorToXRange(floor)
    const floorY = this.floorToWorldY(floor)
    const hasGap = this._round > 0 && floor > 5 && Math.random() < 0.15

    const segment = {
      type: 'slope',
      floor,
      startX,
      endX,
      worldY: floorY,
      width,
      direction,
      hasGap,
      gapX: hasGap ? startX + direction * (width * 0.4 + Math.random() * width * 0.2) : 0,
      gapWidth: hasGap ? 60 + Math.random() * 40 : 0,
      hasQuiz: floor === this._nextQuizFloor,
      quizConsumed: false,
      hasGift: floor === this._nextGiftFloor,
      giftConsumed: false,
      giftX: startX + direction * (width * 0.3 + Math.random() * width * 0.4),
    }

    if (segment.hasQuiz) {
      this._nextQuizFloor = this._randomQuizFloor(floor)
    }
    if (segment.hasGift) {
      this._nextGiftFloor = this._randomGiftFloor(floor)
    }

    this.segments.push(segment)

    const cornerY = floorY - CONFIG.FLOOR_HEIGHT * 0.1
    this.segments.push({
      type: 'corner',
      floor,
      x: endX,
      worldY: cornerY,
      direction,
    })
  }

  _randomQuizFloor(fromFloor) {
    return fromFloor + CONFIG.QUIZ_INTERVAL_MIN + 
      Math.floor(Math.random() * (CONFIG.QUIZ_INTERVAL_MAX - CONFIG.QUIZ_INTERVAL_MIN + 1))
  }

  _randomGiftFloor(fromFloor) {
    return fromFloor + 8 + Math.floor(Math.random() * 10)
  }

  update(cameraWorldY) {
    this._generate(cameraWorldY)
    const bottomY = cameraWorldY + CONFIG.H + 500
    this.segments = this.segments.filter(s => s.worldY >= bottomY === false)
  }

  // 获取角色当前所在的楼梯段
  getCurrentSegment(char) {
    const charY = char.worldY
    const charX = char.worldX

    for (const seg of this.segments) {
      if (seg.type !== 'slope') continue
      
      const yDiff = Math.abs(charY - seg.worldY)
      if (yDiff > 30) continue

      const minX = Math.min(seg.startX, seg.endX)
      const maxX = Math.max(seg.startX, seg.endX)
      if (charX >= minX - 20 && charX <= maxX + 20) {
        return seg
      }
    }
    return null
  }

  // 检测是否在缺口上
  isOnGap(char) {
    const seg = this.getCurrentSegment(char)
    if (!seg || !seg.hasGap) return false

    const gapMin = Math.min(seg.gapX, seg.gapX + seg.direction * seg.gapWidth)
    const gapMax = Math.max(seg.gapX, seg.gapX + seg.direction * seg.gapWidth)
    return char.worldX >= gapMin && char.worldX <= gapMax
  }

  // 落地检测
  checkLanding(char) {
    if (char.velY <= 0) return null

    const feetY = char.worldY
    const charX = char.worldX

    for (const seg of this.segments) {
      if (seg.type !== 'slope') continue

      const dy = feetY - seg.worldY
      if (dy < 0 || dy > CONFIG.LAND_TOLERANCE) continue

      const minX = Math.min(seg.startX, seg.endX)
      const maxX = Math.max(seg.startX, seg.endX)
      if (charX < minX - 10 || charX > maxX + 10) continue

      if (seg.hasGap) {
        const gapMin = Math.min(seg.gapX, seg.gapX + seg.direction * seg.gapWidth)
        const gapMax = Math.max(seg.gapX, seg.gapX + seg.direction * seg.gapWidth)
        if (charX >= gapMin - 5 && charX <= gapMax + 5) continue
      }

      return seg
    }
    return null
  }

  // 检测答题触发
  checkQuizTrigger(char) {
    for (const seg of this.segments) {
      if (!seg.hasQuiz || seg.quizConsumed) continue
      if (seg.type !== 'slope') continue

      const yDiff = Math.abs(char.worldY - seg.worldY)
      if (yDiff > 40) continue

      const minX = Math.min(seg.startX, seg.endX)
      const maxX = Math.max(seg.startX, seg.endX)
      if (char.worldX < minX || char.worldX > maxX) continue

      seg.quizConsumed = true
      return seg.floor
    }
    return null
  }

  // 检测礼包收集
  checkGiftCollect(char) {
    for (const seg of this.segments) {
      if (!seg.hasGift || seg.giftConsumed) continue
      if (seg.type !== 'slope') continue

      const yDiff = Math.abs(char.worldY - seg.worldY)
      if (yDiff > 40) continue

      const dist = Math.abs(char.worldX - seg.giftX)
      if (dist < 50) {
        seg.giftConsumed = true
        return { floor: seg.floor, x: seg.giftX, y: seg.worldY }
      }
    }
    return null
  }

  render(ctx, cameraWorldY) {
    for (const seg of this.segments) {
      const screenY = seg.worldY - cameraWorldY
      if (screenY > CONFIG.H + 100 || screenY < -100) continue

      if (seg.type === 'slope') {
        this._drawSlope(ctx, seg, screenY)
      } else {
        this._drawCorner(ctx, seg, screenY)
      }
    }
  }

  _drawSlope(ctx, seg, screenY) {
    const { startX, endX, direction, width, hasGap, gapX, gapWidth, hasQuiz, quizConsumed, hasGift, giftConsumed, giftX, floor } = seg
    const h = CONFIG.PLATFORM_H
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)

    ctx.save()

    // 楼梯斜坡背景
    const grad = ctx.createLinearGradient(minX, screenY, maxX, screenY)
    const colorPhase = (floor % 4) / 4
    if (colorPhase < 0.25) {
      grad.addColorStop(0, '#C4DC3A')
      grad.addColorStop(1, '#D8EE50')
    } else if (colorPhase < 0.5) {
      grad.addColorStop(0, '#D8EE50')
      grad.addColorStop(1, '#EEFF66')
    } else if (colorPhase < 0.75) {
      grad.addColorStop(0, '#F0FF70')
      grad.addColorStop(1, '#FFFF88')
    } else {
      grad.addColorStop(0, '#FFFF90')
      grad.addColorStop(1, '#FFFFAA')
    }

    // 绘制斜坡（如果有缺口则分段绘制）
    if (hasGap) {
      const gapMin = Math.min(gapX, gapX + direction * gapWidth)
      const gapMax = Math.max(gapX, gapX + direction * gapWidth)

      this._drawSlopeSection(ctx, minX, gapMin, screenY, h, grad)
      this._drawSlopeSection(ctx, gapMax, maxX, screenY, h, grad)

      // 缺口警示
      ctx.fillStyle = 'rgba(255,0,0,0.3)'
      ctx.fillRect(gapMin, screenY - 5, gapMax - gapMin, 3)
    } else {
      this._drawSlopeSection(ctx, minX, maxX, screenY, h, grad)
    }

    // Quiz方块
    if (hasQuiz && !quizConsumed) {
      const quizX = startX + direction * (width * 0.5)
      this._drawQuizBlock(ctx, quizX, screenY - 30)
    }

    // 礼包
    if (hasGift && !giftConsumed) {
      this._drawGiftOnStair(ctx, giftX, screenY - 40)
    }

    ctx.restore()
  }

  _drawSlopeSection(ctx, x1, x2, y, h, grad) {
    const depth = 10

    // 侧面
    ctx.fillStyle = C.PLATFORM_FRONT
    ctx.beginPath()
    ctx.moveTo(x1, y + h)
    ctx.lineTo(x2, y + h)
    ctx.lineTo(x2, y + h + depth)
    ctx.lineTo(x1, y + h + depth)
    ctx.closePath()
    ctx.fill()

    // 顶面
    ctx.beginPath()
    this._roundRect(ctx, x1, y, x2 - x1, h, 6)
    ctx.fillStyle = grad
    ctx.fill()

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(x1 + 10, y + 4, (x2 - x1) * 0.3, 6)
  }

  _drawCorner(ctx, seg, screenY) {
    const { x, direction } = seg
    const r = 25

    ctx.save()
    ctx.beginPath()
    ctx.arc(x, screenY, r, 0, Math.PI * 2)
    ctx.fillStyle = '#E8D040'
    ctx.fill()
    ctx.strokeStyle = '#C0A020'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()
  }

  _drawQuizBlock(ctx, cx, cy) {
    const t = Date.now() / 1000
    const floatY = Math.sin(t * 2.5) * 6
    const y = cy + floatY
    const size = 50

    ctx.save()
    ctx.shadowColor = 'rgba(255,50,50,0.35)'
    ctx.shadowBlur = 10
    this._roundRect(ctx, cx - size/2, y - size/2, size, size, 10)
    ctx.fillStyle = C.OBSTACLE_BG
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.font = 'bold 32px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', cx, y + 2)
    ctx.restore()
  }

  _drawGiftOnStair(ctx, cx, cy) {
    const t = Date.now() / 1000
    const floatY = Math.abs(Math.sin(t * 2.5)) * 6
    const y = cy - floatY

    ctx.save()
    ctx.translate(cx, y)

    // 光晕
    const grd = ctx.createRadialGradient(0, 0, 5, 0, 0, 30)
    grd.addColorStop(0, 'rgba(255,215,0,0.4)')
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.fillRect(-35, -35, 70, 70)

    // 礼包盒
    ctx.shadowColor = 'rgba(200,150,0,0.3)'
    ctx.shadowBlur = 8
    this._roundRect(ctx, -20, -15, 40, 35, 6)
    ctx.fillStyle = '#FFD700'
    ctx.fill()
    ctx.shadowBlur = 0

    // 丝带
    ctx.fillStyle = '#FF6B6B'
    ctx.fillRect(-4, -15, 8, 35)
    ctx.fillRect(-20, -2, 40, 8)

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

module.exports = { PlatformManager }
