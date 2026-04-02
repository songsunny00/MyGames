// 平台管理器
// 负责生成、滚动和回收Z形楼梯平台
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class PlatformManager {
  constructor() {
    this.platforms = []       // 活跃平台列表
    this.nextFloor = 1        // 下一个待生成的楼层号
    this.quizTrigger = null   // 当前帧触发的quiz平台

    // 下一个quiz出现的楼层
    this._nextQuizFloor = this._randomQuizFloor(1)
  }

  // 初始化：生成初始若干平台
  init(cameraWorldY) {
    // 生成画面上方到画面下方所有需要的平台
    this.platforms = []
    this.nextFloor = 1
    this._nextQuizFloor = this._randomQuizFloor(1)
    this._generate(cameraWorldY)
  }

  // 返回指定楼层的世界Y坐标（平台顶面）
  floorToWorldY(floor) {
    return -(floor - 1) * CONFIG.FLOOR_HEIGHT
  }

  // 返回指定楼层的X坐标和宽度
  floorToX(floor) {
    const w = this._platformWidth(floor)
    const isRight = (floor % 2 === 1)  // 奇数层在右，偶数层在左
    const x = isRight ? CONFIG.PLATFORM_RIGHT_X : CONFIG.PLATFORM_LEFT_X
    return { x, w }
  }

  // 计算平台宽度（随楼层缩小）
  _platformWidth(floor) {
    const reduced = Math.floor((floor - 1) * CONFIG.PLATFORM_W_SHRINK)
    return Math.max(CONFIG.PLATFORM_W_MIN, CONFIG.PLATFORM_W_START - reduced)
  }

  // 生成缺失的平台（确保cameraWorldY上方200px到下方H+200px都有平台）
  _generate(cameraWorldY) {
    // 需要生成到的最顶（最小worldY）
    const topWorldY = cameraWorldY - 200
    while (true) {
      const nextWorldY = this.floorToWorldY(this.nextFloor)
      if (nextWorldY < topWorldY) break
      if (this.nextFloor > CONFIG.MAX_FLOOR + 5) break
      this._createPlatform(this.nextFloor)
      this.nextFloor++
    }
  }

  _createPlatform(floor) {
    const worldY = this.floorToWorldY(floor)
    const { x, w } = this.floorToX(floor)
    const hasQuiz = floor === this._nextQuizFloor
    if (hasQuiz) {
      this._nextQuizFloor = this._randomQuizFloor(floor + 1)
    }
    this.platforms.push({
      floor,
      worldY,
      x,
      w,
      h: CONFIG.PLATFORM_H,
      hasQuiz,
      quizConsumed: false,  // 是否已触发过quiz
    })
  }

  _randomQuizFloor(fromFloor) {
    const interval = CONFIG.QUIZ_INTERVAL_MIN +
      Math.floor(Math.random() * (CONFIG.QUIZ_INTERVAL_MAX - CONFIG.QUIZ_INTERVAL_MIN + 1))
    return fromFloor + interval
  }

  // 每帧更新：cameraWorldY = 摄像机顶部世界Y
  update(cameraWorldY) {
    this.quizTrigger = null
    // 生成新平台
    this._generate(cameraWorldY)
    // 回收远离画面的平台（在摄像机底部下方500px以上）
    const bottomWorldY = cameraWorldY + CONFIG.H + 500
    this.platforms = this.platforms.filter(p => p.worldY <= bottomWorldY)
  }

  // 落地检测：判断角色是否落在某个平台上
  // 返回平台信息 {worldY, floor, hasQuiz, ...} 或 null
  checkLanding(char) {
    if (char.velY <= 0) return null  // 向上跳跃时不检测

    const feetY = char.worldY
    const halfW = CONFIG.CHAR_W / 2

    for (const plat of this.platforms) {
      // 垂直：脚底在平台顶面附近
      const dy = feetY - plat.worldY
      if (dy < 0 || dy > CONFIG.LAND_TOLERANCE) continue

      // 水平：有重叠
      const charLeft = char.worldX - halfW
      const charRight = char.worldX + halfW
      const platRight = plat.x + plat.w

      if (charRight < plat.x + 10 || charLeft > platRight - 10) continue

      // 落地！
      return plat
    }
    return null
  }

  // 给定cameraWorldY，将世界Y转为屏幕Y
  worldToScreenY(worldY, cameraWorldY) {
    return worldY - cameraWorldY
  }

  // 渲染所有可见平台
  render(ctx, cameraWorldY) {
    const viewTop = cameraWorldY
    const viewBottom = cameraWorldY + CONFIG.H

    for (const plat of this.platforms) {
      const screenY = plat.worldY - cameraWorldY
      // 视野裁剪
      if (screenY > viewBottom + 60 || screenY < viewTop - 60) continue

      this._drawPlatform(ctx, plat, screenY)
    }
  }

  _drawPlatform(ctx, plat, screenY) {
    const { x, w, h, hasQuiz, quizConsumed } = plat
    const DEPTH = 14  // 3D厚度感

    ctx.save()

    // ── 投影阴影 ──
    ctx.beginPath()
    ctx.ellipse(x + w / 2, screenY + h + DEPTH + 6, w * 0.45, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.10)'
    ctx.fill()

    // ── 侧面（底部暗色） ──
    ctx.beginPath()
    ctx.moveTo(x, screenY + h)
    ctx.lineTo(x + w, screenY + h)
    ctx.lineTo(x + w, screenY + h + DEPTH)
    ctx.lineTo(x, screenY + h + DEPTH)
    ctx.closePath()
    ctx.fillStyle = C.PLATFORM_FRONT
    ctx.fill()

    // ── 顶面（主色渐变） ──
    const grad = ctx.createLinearGradient(x, screenY, x + w, screenY)
    grad.addColorStop(0, '#C4DC3A')
    grad.addColorStop(0.4, C.PLATFORM_TOP)
    grad.addColorStop(1, '#D8A000')
    ctx.beginPath()
    this._roundRect(ctx, x, screenY, w, h, 8)
    ctx.fillStyle = grad
    ctx.fill()

    // ── 顶面高光 ──
    ctx.beginPath()
    this._roundRect(ctx, x + 4, screenY + 4, w - 8, h * 0.4, 4)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fill()

    // ── Quiz方块（❓）──
    if (hasQuiz && !quizConsumed) {
      this._drawQuizBlock(ctx, x + w / 2, screenY - 30, plat.floor)
    }

    ctx.restore()
  }

  _drawQuizBlock(ctx, cx, cy, floor) {
    const t = Date.now() / 1000
    const floatY = Math.sin(t * 2.5) * 8  // 上下浮动
    const y = cy + floatY

    const SIZE = 64
    const half = SIZE / 2

    ctx.save()

    // 阴影
    ctx.beginPath()
    ctx.ellipse(cx, y + half + 6, half * 0.7, 6, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fill()

    // 方块背景
    ctx.shadowColor = 'rgba(255,50,50,0.4)'
    ctx.shadowBlur = 12
    this._roundRect(ctx, cx - half, y - half, SIZE, SIZE, 12)
    ctx.fillStyle = C.OBSTACLE_BG
    ctx.fill()
    ctx.shadowBlur = 0

    // 方块高光（左上角）
    ctx.beginPath()
    ctx.ellipse(cx - half * 0.3, y - half * 0.35, half * 0.3, half * 0.18, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fill()

    // ❓文字
    ctx.font = `bold 40px sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', cx, y + 2)

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
