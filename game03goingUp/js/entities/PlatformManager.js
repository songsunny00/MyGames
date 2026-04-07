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

    // Z字型楼梯：将每层分成多个台阶，形成连续斜坡
    const stepsPerFloor = CONFIG.STEPS_PER_FLOOR
    const stepHeight = CONFIG.STEP_HEIGHT
    const stepWidth = width / stepsPerFloor

    // 创建斜坡段（包含多个台阶）
    const slopeSegment = {
      type: 'slope',
      floor,
      startX,
      endX,
      worldY: floorY,  // 楼层基准Y坐标
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
      // 新增：台阶数据
      steps: [],
    }

    // 生成每个台阶的数据
    // Z字型楼梯：台阶紧密连接，形成连续斜坡
    for (let i = 0; i < stepsPerFloor; i++) {
      const stepStartX = startX + direction * (stepWidth * i)
      const stepEndX = startX + direction * (stepWidth * (i + 1))
      // 台阶Y坐标：从楼层基准Y开始，每个台阶向上偏移
      // 关键：台阶之间紧密连接，无间隙
      const stepY = floorY - stepHeight * i

      slopeSegment.steps.push({
        startX: Math.min(stepStartX, stepEndX),
        endX: Math.max(stepStartX, stepEndX),
        worldY: stepY,
        index: i,
      })
    }

    if (slopeSegment.hasQuiz) {
      this._nextQuizFloor = this._randomQuizFloor(floor)
    }
    if (slopeSegment.hasGift) {
      this._nextGiftFloor = this._randomGiftFloor(floor)
    }

    this.segments.push(slopeSegment)

    // 拐角：在楼梯末端，连接下一层
    const cornerY = floorY - CONFIG.FLOOR_HEIGHT + stepHeight * 0.5
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
    const { startX, endX, direction, width, hasGap, gapX, gapWidth, hasQuiz, quizConsumed, hasGift, giftConsumed, giftX, floor, steps } = seg
    const h = CONFIG.PLATFORM_H

    ctx.save()

    // 楼梯颜色渐变（随楼层变化）
    const colorPhase = (floor % 4) / 4
    let topColor1, topColor2, frontColor, sideColor, strokeColor
    if (colorPhase < 0.25) {
      topColor1 = '#C4DC3A'; topColor2 = '#D8EE50'
      frontColor = '#F5A000'; sideColor = '#D07800'; strokeColor = '#C86800'
    } else if (colorPhase < 0.5) {
      topColor1 = '#D8EE50'; topColor2 = '#EEFF66'
      frontColor = '#F7A200'; sideColor = '#D27A00'; strokeColor = '#CC7800'
    } else if (colorPhase < 0.75) {
      topColor1 = '#F0FF70'; topColor2 = '#FFFF88'
      frontColor = '#F9A400'; sideColor = '#D47C00'; strokeColor = '#D48C00'
    } else {
      topColor1 = '#FFFF90'; topColor2 = '#FFFFAA'
      frontColor = '#FBA600'; sideColor = '#D68000'; strokeColor = '#DCA000'
    }

    // 绘制Z字型楼梯（每个台阶独立绘制，紧密连接）
    const depth = 15  // 侧面深度（2.5D效果）
    const stepHeight = CONFIG.STEP_HEIGHT

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const stepScreenY = step.worldY - (seg.worldY - screenY)
      
      // 计算台阶的四个角点（2.5D等轴风格）
      const x1 = step.startX
      const x2 = step.endX
      const y = stepScreenY
      
      // 检查缺口
      if (hasGap) {
        const gapMin = Math.min(gapX, gapX + direction * gapWidth)
        const gapMax = Math.max(gapX, gapX + direction * gapWidth)
        
        // 如果台阶完全在缺口内，跳过
        if (x2 <= gapMax && x1 >= gapMin) {
          continue
        }
      }

      // 绘制单个台阶（2.5D等轴风格，三个面）
      this._drawStairStep(ctx, x1, x2, y, h, depth, direction, topColor1, topColor2, frontColor, sideColor, strokeColor, i, steps.length)
    }

    // Quiz方块
    if (hasQuiz && !quizConsumed) {
      const quizX = startX + direction * (width * 0.5)
      const quizStepIndex = Math.floor(steps.length * 0.5)
      const quizStep = steps[quizStepIndex]
      const quizScreenY = quizStep.worldY - (seg.worldY - screenY)
      this._drawQuizBlock(ctx, quizX, quizScreenY - 30)
    }

    // 礼包
    if (hasGift && !giftConsumed) {
      const giftStepIndex = Math.floor(steps.length * 0.3)
      const giftStep = steps[giftStepIndex]
      const giftScreenY = giftStep.worldY - (seg.worldY - screenY)
      this._drawGiftOnStair(ctx, giftX, giftScreenY - 40)
    }

    ctx.restore()
  }

  // 绘制单个台阶（2.5D等轴风格，三个面）
  _drawStairStep(ctx, x1, x2, y, h, depth, direction, topColor1, topColor2, frontColor, sideColor, strokeColor, stepIndex, totalSteps) {
    const w = x2 - x1
    if (w <= 0) return

    // 顶面渐变
    const topGrad = ctx.createLinearGradient(x1, y, x2, y)
    topGrad.addColorStop(0, topColor1)
    topGrad.addColorStop(1, topColor2)

    // 2.5D等轴风格：顶面是平行四边形
    // 关键改进：顶面与下一个台阶紧密连接
    // 顶面四个点：左下、右下、右上、左上
    const isoOffset = depth * 0.25  // 等轴偏移量
    const topPoints = [
      { x: x1, y: y },                          // 左下
      { x: x2, y: y },                          // 右下
      { x: x2 + isoOffset, y: y - isoOffset * 0.5 },  // 右上（偏移）
      { x: x1 + isoOffset, y: y - isoOffset * 0.5 },  // 左上（偏移）
    ]

    // 正面四个点：左上、右上、右下、左下
    const frontPoints = [
      { x: x1, y: y },
      { x: x2, y: y },
      { x: x2, y: y + h },
      { x: x1, y: y + h },
    ]

    // 侧面四个点（根据方向决定显示哪一侧）
    let sidePoints
    if (direction === -1) {
      // 奇数层：从右往左，显示右侧侧面
      sidePoints = [
        { x: x2, y: y },
        { x: x2 + isoOffset, y: y - isoOffset * 0.5 },
        { x: x2 + isoOffset, y: y + h - isoOffset * 0.5 },
        { x: x2, y: y + h },
      ]
    } else {
      // 偶数层：从左往右，显示左侧侧面
      sidePoints = [
        { x: x1, y: y },
        { x: x1 + isoOffset, y: y - isoOffset * 0.5 },
        { x: x1 + isoOffset, y: y + h - isoOffset * 0.5 },
        { x: x1, y: y + h },
      ]
    }

    // 绘制顺序：先正面，再侧面，最后顶面（确保正确的遮挡关系）
    
    // 1. 绘制正面（前面）- 橙色
    ctx.fillStyle = frontColor
    ctx.beginPath()
    ctx.moveTo(frontPoints[0].x, frontPoints[0].y)
    for (let i = 1; i < frontPoints.length; i++) {
      ctx.lineTo(frontPoints[i].x, frontPoints[i].y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.2
    ctx.stroke()

    // 2. 绘制侧面 - 深橙色
    ctx.fillStyle = sideColor
    ctx.beginPath()
    ctx.moveTo(sidePoints[0].x, sidePoints[0].y)
    for (let i = 1; i < sidePoints.length; i++) {
      ctx.lineTo(sidePoints[i].x, sidePoints[i].y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.2
    ctx.stroke()

    // 3. 绘制顶面 - 黄绿渐变
    ctx.fillStyle = topGrad
    ctx.beginPath()
    ctx.moveTo(topPoints[0].x, topPoints[0].y)
    for (let i = 1; i < topPoints.length; i++) {
      ctx.lineTo(topPoints[i].x, topPoints[i].y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.2
    ctx.stroke()

    // 4. 顶面高光
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fillRect(x1 + 3, y + 2, w * 0.35, 3)
  }

  // 绘制单个台阶（旧方法，保留用于缺口分段绘制）
  _drawZStairStep(ctx, x1, x2, y, h, depth, direction, topColor1, topColor2, frontColor, sideColor, stepIndex) {
    const w = x2 - x1
    if (w <= 0) return

    // 顶面渐变
    const topGrad = ctx.createLinearGradient(x1, y, x2, y)
    topGrad.addColorStop(0, topColor1)
    topGrad.addColorStop(1, topColor2)

    // 1. 正面（前面）- 橙色
    ctx.fillStyle = frontColor
    ctx.beginPath()
    ctx.moveTo(x1, y + h)
    ctx.lineTo(x2, y + h)
    ctx.lineTo(x2, y + h + depth)
    ctx.lineTo(x1, y + h + depth)
    ctx.closePath()
    ctx.fill()

    // 2. 侧面 - 深橙色
    if (direction === -1) {
      // 奇数层：从右往左，显示右侧侧面
      ctx.fillStyle = sideColor
      ctx.beginPath()
      ctx.moveTo(x2, y)
      ctx.lineTo(x2 + depth * 0.4, y - depth * 0.2)
      ctx.lineTo(x2 + depth * 0.4, y + h - depth * 0.2)
      ctx.lineTo(x2, y + h)
      ctx.closePath()
      ctx.fill()
    } else {
      // 偶数层：从左往右，显示左侧侧面
      ctx.fillStyle = sideColor
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x1 - depth * 0.4, y - depth * 0.2)
      ctx.lineTo(x1 - depth * 0.4, y + h - depth * 0.2)
      ctx.lineTo(x1, y + h)
      ctx.closePath()
      ctx.fill()
    }

    // 3. 顶面 - 黄绿渐变
    ctx.beginPath()
    this._roundRect(ctx, x1, y, w, h, 4)
    ctx.fillStyle = topGrad
    ctx.fill()

    // 4. 顶面高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(x1 + 4, y + 2, w * 0.3, 4)

    // 5. 边缘描边
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    this._roundRect(ctx, x1, y, w, h, 4)
    ctx.stroke()
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
    // Z字型拐角：连接两段楼梯的转角
    const r = 35

    ctx.save()

    // 拐角连接段（带立体效果）
    // 外圈阴影
    ctx.beginPath()
    ctx.arc(x, screenY + 6, r + 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fill()

    // 主圆（渐变填充）
    ctx.beginPath()
    ctx.arc(x, screenY, r, 0, Math.PI * 2)
    const cornerGrad = ctx.createRadialGradient(x - 10, screenY - 10, 0, x, screenY, r)
    cornerGrad.addColorStop(0, '#FFE566')
    cornerGrad.addColorStop(0.7, '#F5D020')
    cornerGrad.addColorStop(1, '#E8B800')
    ctx.fillStyle = cornerGrad
    ctx.fill()

    // 内圈高光
    ctx.beginPath()
    ctx.arc(x - 8, screenY - 8, r * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()

    // 边框
    ctx.strokeStyle = '#C0A020'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, screenY, r, 0, Math.PI * 2)
    ctx.stroke()

    // 方向箭头（指示Z字型转向）
    ctx.fillStyle = '#A08000'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // 根据方向显示不同的箭头
    const arrow = direction === -1 ? '↰' : '↱'
    ctx.fillText(arrow, x, screenY + 2)

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
