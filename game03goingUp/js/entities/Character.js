// 角色实体
// 自动沿楼梯移动，支持跳跃和左右滑动
const { CONFIG } = require('../config.js')

const C = CONFIG.COLOR

class Character {
  constructor() {
    this.worldX = CONFIG.W / 2
    this.worldY = 0
    this.velY = 0
    this.isGrounded = false
    this.isAlive = true
    this.isJumping = false
    this.isBanwei = false
    this.currentFloor = 1
    this.maxFloor = 1
    this._animT = 0
    this._moveDirection = 0
    this._currentSegment = null
  }

  update(dt, platformMgr, input, gameState, allowControl = true) {
    this._animT += dt
    this._currentSegment = platformMgr.getCurrentSegment(this)

    if (allowControl) {
      this._handleHorizontalMove(dt, input)
    }

    if (this.isGrounded && this._currentSegment && allowControl) {
      this._autoClimb(dt, this._currentSegment)
    }

    if (allowControl) {
      this._handleJump(input)
    }

    if (!this.isGrounded) {
      this.velY += CONFIG.GRAVITY * dt
      this.worldY += this.velY * dt
    }

    const halfW = CONFIG.CHAR_W / 2
    this.worldX = Math.max(halfW + 10, Math.min(CONFIG.W - halfW - 10, this.worldX))

    this.isGrounded = false
    const landed = platformMgr.checkLanding(this)
    if (landed && this.velY >= 0) {
      this.worldY = landed.worldY
      this.velY = 0
      this.isGrounded = true
      this.isJumping = false

      if (landed.floor > this.currentFloor) {
        this.currentFloor = landed.floor
        if (this.currentFloor > this.maxFloor) {
          this.maxFloor = this.currentFloor
        }
      }
      return landed
    }

    if (this.isGrounded && platformMgr.isOnGap(this)) {
      this.isGrounded = false
      this.velY = 200
    }

    return null
  }

  _handleHorizontalMove(dt, input) {
    const swipeDir = input.consumeSwipeDirection()
    
    if (swipeDir === 'left') {
      this._moveDirection = -1
    } else if (swipeDir === 'right') {
      this._moveDirection = 1
    }

    if (this._moveDirection !== 0) {
      this.worldX += this._moveDirection * CONFIG.MOVE_SPEED * dt
    }
  }

  _autoClimb(dt, segment) {
    // Z字型楼梯：角色沿斜坡自动向上移动
    // 根据当前X位置计算对应的Y位置
    const moveSpeed = CONFIG.CLIMB_SPEED * dt
    
    // 水平移动
    this.worldX += segment.direction * moveSpeed
    
    // 根据X位置计算Y位置（斜坡）
    if (segment.steps && segment.steps.length > 0) {
      // 找到当前所在的台阶
      const progress = (this.worldX - segment.startX) / (segment.endX - segment.startX)
      const stepIndex = Math.floor(progress * segment.steps.length)
      const clampedIndex = Math.max(0, Math.min(segment.steps.length - 1, stepIndex))
      const currentStep = segment.steps[clampedIndex]
      
      // 平滑过渡到台阶Y位置
      if (currentStep) {
        const targetY = currentStep.worldY
        const yDiff = targetY - this.worldY
        // 平滑跟随台阶高度
        this.worldY += yDiff * 0.3
      }
    }
  }

  _handleJump(input) {
    const taps = input.consumeAllTaps()
    
    for (const tap of taps) {
      if (tap.type === 'tap' && this.isGrounded) {
        this._doJump(false)
      } else if (tap.type === 'longPress' && this.isGrounded) {
        this._doJump(true)
      }
    }

    const swipeDir = input.consumeSwipeDirection()
    if (swipeDir === 'up' && this.isGrounded) {
      const isBigJump = input.isLongPress()
      this._doJump(isBigJump)
    }
  }

  _doJump(isBigJump) {
    const speed = isBigJump ? CONFIG.JUMP_BIG_SPEED : CONFIG.JUMP_SMALL_SPEED
    this.velY = -speed
    this.isGrounded = false
    this.isJumping = true
  }

  forceJump(floors) {
    this.currentFloor += floors
    if (this.currentFloor > this.maxFloor) this.maxFloor = this.currentFloor
    if (this.currentFloor > CONFIG.MAX_FLOOR) this.currentFloor = CONFIG.MAX_FLOOR
  }

  fallFloors(n) {
    this.currentFloor = Math.max(1, this.currentFloor - n)
    this.velY = 600
    this.isGrounded = false
  }

  render(ctx, screenX, screenY) {
    ctx.save()

    const R = CONFIG.CHAR_BODY_R
    const cx = screenX
    const cy = screenY - R

    if (this.isBanwei) {
      ctx.filter = 'grayscale(0.7) brightness(0.85)'
    }

    let scaleX = 1, scaleY = 1
    if (this.isJumping) {
      const t = Math.min(1, (Date.now() % 900) / 900)
      scaleY = 1 + 0.06 * Math.sin(t * Math.PI)
      scaleX = 1 / scaleY
    } else {
      const t = Math.min(1, (Date.now() % 200) / 200)
      scaleY = 0.94 + 0.06 * t
      scaleX = 1 / scaleY
    }

    ctx.translate(cx, cy)
    ctx.scale(scaleX, scaleY)

    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fillStyle = C.CHAR_BODY
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.beginPath()
    ctx.arc(-R * 0.25, -R * 0.3, R * 0.35, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fill()

    const hatW = R * 1.1
    const hatH = R * 0.7
    const hatX = -hatW / 2
    const hatY = -(R + hatH)

    ctx.beginPath()
    this._roundRect(ctx, hatX, hatY, hatW, hatH, 10)
    ctx.fillStyle = C.CHAR_HAT
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(0, -(R + 4), hatW * 0.75, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = C.CHAR_HAT_BRIM
    ctx.fill()

    ctx.fillStyle = C.CHAR_EYE
    ctx.beginPath()
    ctx.arc(-R * 0.28, R * 0.05, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(R * 0.28, R * 0.05, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(-R * 0.3, R * 0.3)
    ctx.quadraticCurveTo(0, R * 0.55, R * 0.3, R * 0.3)
    ctx.strokeStyle = C.CHAR_EYE
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.stroke()

    if (this.isBanwei) {
      ctx.beginPath()
      ctx.moveTo(-6, R * 0.5)
      ctx.lineTo(6, R * 0.5)
      ctx.lineTo(3, R * 0.9)
      ctx.lineTo(0, R * 0.85)
      ctx.lineTo(-3, R * 0.9)
      ctx.closePath()
      ctx.fillStyle = '#CC2222'
      ctx.fill()

      ctx.font = 'bold 22px sans-serif'
      ctx.fillStyle = '#FF3333'
      ctx.textAlign = 'center'
      ctx.fillText('加班中', 0, -(R + hatH + 18))
    }

    ctx.restore()
  }

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
