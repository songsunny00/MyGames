// 角色实体
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class Character {
  constructor() {
    // 世界坐标（Y轴：向下为正，跳跃方向为负）
    this.worldX = CONFIG.W / 2         // 中心X
    this.worldY = 0                    // 脚底Y（设初始值，由PlatformManager校正）
    this.velX = 0
    this.velY = 0
    this.isGrounded = false
    this.isAlive = true

    // 当前所在楼层（落地时更新）
    this.currentFloor = 1
    // 正在跳跃中（防止多次起跳）
    this.isJumping = false

    // 班味惩罚状态
    this.isBanwei = false
    // 跳跃动画相位
    this._animT = 0

    // 历史最高楼层（用于掉楼后判断是否需要补偿）
    this.maxFloor = 1
  }

  // 每帧更新
  // allowJump: false 时不自动起跳（惩罚倒地阶段）
  update(dt, platformManager, inputSystem, gameState, allowJump = true) {

    // 水平移动（根据滑动输入）
    const swipe = inputSystem.getSwipeX()
    this.velX = swipe * CONFIG.MOVE_SPEED

    this.worldX += this.velX * dt
    // 限制在屏幕边界内（留一个半角色宽度的边距）
    const halfW = CONFIG.CHAR_W / 2
    this.worldX = Math.max(halfW + 10, Math.min(CONFIG.W - halfW - 10, this.worldX))

    // 垂直物理
    this.velY += CONFIG.GRAVITY * dt
    this.worldY += this.velY * dt

    // 落地检测
    this.isGrounded = false
    const landed = platformManager.checkLanding(this)
    if (landed) {
      this.worldY = landed.worldY     // 脚贴平台顶部
      this.velY = 0
      this.isGrounded = true
      this.isJumping = false
      // 自动跳跃（仅在allowJump时）
      if (allowJump) this._doJump()
      // 更新楼层
      if (landed.floor > this.currentFloor) {
        this.currentFloor = landed.floor
        if (this.currentFloor > this.maxFloor) {
          this.maxFloor = this.currentFloor
        }
      }
      // 返回落地的平台信息（供GameScene检测quiz触发等）
      return landed
    }

    // 动画计时
    this._animT += dt

    return null
  }

  _doJump() {
    this.velY = -CONFIG.JUMP_SPEED
    this.isJumping = true
  }

  // 强制跳跃（礼包奖励等）
  forceJump(floors) {
    this.currentFloor += floors
    if (this.currentFloor > this.maxFloor) this.maxFloor = this.currentFloor
    if (this.currentFloor > CONFIG.MAX_FLOOR) this.currentFloor = CONFIG.MAX_FLOOR
  }

  // 惩罚掉楼
  fallFloors(n) {
    this.currentFloor = Math.max(1, this.currentFloor - n)
    this.velY = 600  // 向下落
    this.isGrounded = false
  }

  // 绘制角色（在世界坐标转屏幕坐标后调用）
  render(ctx, screenX, screenY) {
    ctx.save()

    const R = CONFIG.CHAR_BODY_R
    const cx = screenX
    const cy = screenY - R  // 圆心Y（脚底往上一个R）

    // 班味状态特效（变灰暗）
    if (this.isBanwei) {
      ctx.filter = 'grayscale(0.7) brightness(0.85)'
    }

    // 跳跃压缩/拉伸动画
    let scaleX = 1, scaleY = 1
    if (this.isJumping) {
      const t = Math.min(1, (Date.now() % 900) / 900)
      scaleY = 1 + 0.06 * Math.sin(t * Math.PI)
      scaleX = 1 / scaleY
    } else {
      // 落地轻微压扁
      const t = Math.min(1, (Date.now() % 200) / 200)
      scaleY = 0.94 + 0.06 * t
      scaleX = 1 / scaleY
    }

    ctx.translate(cx, cy)
    ctx.scale(scaleX, scaleY)

    // ── 身体（白色圆） ──
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fillStyle = C.CHAR_BODY
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.shadowBlur = 0

    // 身体高光
    ctx.beginPath()
    ctx.arc(-R * 0.25, -R * 0.3, R * 0.35, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fill()

    // ── 帽子（窄圆筒帽） ──
    const hatW = R * 1.1
    const hatH = R * 0.7
    const hatX = -hatW / 2
    const hatY = -(R + hatH)

    // 帽身
    ctx.beginPath()
    this._roundRect(ctx, hatX, hatY, hatW, hatH, 10)
    ctx.fillStyle = C.CHAR_HAT
    ctx.fill()

    // 帽檐
    ctx.beginPath()
    ctx.ellipse(0, -(R + 4), hatW * 0.75, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = C.CHAR_HAT_BRIM
    ctx.fill()

    // ── 眼睛 ──
    ctx.fillStyle = C.CHAR_EYE
    ctx.beginPath()
    ctx.arc(-R * 0.28, R * 0.05, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(R * 0.28, R * 0.05, 5, 0, Math.PI * 2)
    ctx.fill()

    // ── 微笑 ──
    ctx.beginPath()
    ctx.moveTo(-R * 0.3, R * 0.3)
    ctx.quadraticCurveTo(0, R * 0.55, R * 0.3, R * 0.3)
    ctx.strokeStyle = C.CHAR_EYE
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.stroke()

    // ── 班味状态：领带 ──
    if (this.isBanwei) {
      // 领带
      ctx.beginPath()
      ctx.moveTo(-6, R * 0.5)
      ctx.lineTo(6, R * 0.5)
      ctx.lineTo(3, R * 0.9)
      ctx.lineTo(0, R * 0.85)
      ctx.lineTo(-3, R * 0.9)
      ctx.closePath()
      ctx.fillStyle = '#CC2222'
      ctx.fill()

      // 头顶标签"加班中"
      ctx.font = 'bold 22px sans-serif'
      ctx.fillStyle = '#FF3333'
      ctx.textAlign = 'center'
      ctx.fillText('加班中', 0, -(R + hatH + 18))
    }

    ctx.restore()
  }

  // 地面投影
  renderShadow(ctx, screenX, screenY) {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(screenX, screenY + 4, CONFIG.CHAR_BODY_R * 0.7, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fill()
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

module.exports = { Character }
