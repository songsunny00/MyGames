// 触摸输入系统
// 支持滑动方向检测、长按跳跃检测
const { CONFIG } = require('../config.js')

const isWechat = typeof wx !== 'undefined'

class InputSystem {
  constructor() {
    this.touches = {}
    this.swipeStartX = 0
    this.swipeStartY = 0
    this.swipeStartTime = 0
    this.isTouching = false
    this.touchHoldTime = 0
    this._pendingTaps = []
    this._swipeDirection = null
    this._swipeConsumed = false
    this.canvas = null

    this._bindEvents()
  }

  _bindEvents() {
    if (isWechat) {
      wx.onTouchStart((e) => this._onStart(e))
      wx.onTouchMove((e) => this._onMove(e))
      wx.onTouchEnd((e) => this._onEnd(e))
      wx.onTouchCancel((e) => this._onEnd(e))
    }
  }

  setCanvas(canvas) {
    this.canvas = canvas
    if (!isWechat && canvas && canvas.addEventListener) {
      canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this._onStart(e) }, { passive: false })
      canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this._onMove(e) }, { passive: false })
      canvas.addEventListener('touchend', (e) => this._onEnd(e))
      canvas.addEventListener('touchcancel', (e) => this._onEnd(e))
      canvas.addEventListener('mousedown', (e) => this._onMouseStart(e))
      canvas.addEventListener('mousemove', (e) => this._onMouseMove(e))
      canvas.addEventListener('mouseup', (e) => this._onMouseEnd(e))
      canvas.addEventListener('mouseleave', (e) => this._onMouseEnd(e))
    }
  }

  _toDesign(clientX, clientY) {
    if (this.canvas) {
      const scaleX = CONFIG.W / this.canvas.width
      const scaleY = CONFIG.H / this.canvas.height
      
      if (isWechat) {
        const dpr = this.canvas.width / CONFIG.W
        return { x: clientX * dpr, y: clientY * dpr }
      } else {
        const rect = this.canvas.getBoundingClientRect()
        const canvasX = (clientX - rect.left) * (this.canvas.width / rect.width)
        const canvasY = (clientY - rect.top) * (this.canvas.height / rect.height)
        return { x: canvasX * scaleX, y: canvasY * scaleY }
      }
    }
    return { x: clientX * 2, y: clientY * 2 }
  }

  _onStart(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0]
    if (!touch) return
    const pos = this._toDesign(touch.clientX, touch.clientY)
    this.swipeStartX = pos.x
    this.swipeStartY = pos.y
    this.swipeStartTime = Date.now()
    this.isTouching = true
    this.touchHoldTime = 0
    this._swipeDirection = null
    this._swipeConsumed = false
    this.touches[touch.identifier || 0] = pos
  }

  _onMove(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0]
    if (!touch || !this.isTouching) return
    const pos = this._toDesign(touch.clientX, touch.clientY)
    this.touches[touch.identifier || 0] = pos

    if (!this._swipeConsumed) {
      const dx = pos.x - this.swipeStartX
      const dy = pos.y - this.swipeStartY
      const threshold = 30

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this._swipeDirection = dx > 0 ? 'right' : 'left'
        } else {
          this._swipeDirection = dy > 0 ? 'down' : 'up'
        }
      }
    }
  }

  _onEnd(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0]
    if (!touch) return
    const pos = this._toDesign(touch.clientX, touch.clientY)

    const dx = pos.x - this.swipeStartX
    const dy = pos.y - this.swipeStartY
    const elapsed = Date.now() - this.swipeStartTime

    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
      if (elapsed < 200) {
        this._pendingTaps.push({ x: pos.x, y: pos.y, type: 'tap' })
      } else {
        this._pendingTaps.push({ x: pos.x, y: pos.y, type: 'longPress' })
      }
    }

    this.isTouching = false
    this.touchHoldTime = 0
    this._swipeDirection = null
    delete this.touches[touch.identifier || 0]
  }

  _mouseDown = false
  _onMouseStart(e) {
    this._mouseDown = true
    const pos = this._toDesign(e.clientX, e.clientY)
    this.swipeStartX = pos.x
    this.swipeStartY = pos.y
    this.swipeStartTime = Date.now()
    this.isTouching = true
    this.touchHoldTime = 0
    this._swipeDirection = null
    this._swipeConsumed = false
  }

  _onMouseMove(e) {
    if (!this._mouseDown || this._swipeConsumed) return
    const pos = this._toDesign(e.clientX, e.clientY)

    const dx = pos.x - this.swipeStartX
    const dy = pos.y - this.swipeStartY
    const threshold = 30

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this._swipeDirection = dx > 0 ? 'right' : 'left'
      } else {
        this._swipeDirection = dy > 0 ? 'down' : 'up'
      }
    }
  }

  _onMouseEnd(e) {
    if (!this._mouseDown) return
    this._mouseDown = false
    const pos = this._toDesign(e.clientX, e.clientY)

    const dx = pos.x - this.swipeStartX
    const dy = pos.y - this.swipeStartY
    const elapsed = Date.now() - this.swipeStartTime

    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
      if (elapsed < 200) {
        this._pendingTaps.push({ x: pos.x, y: pos.y, type: 'tap' })
      } else {
        this._pendingTaps.push({ x: pos.x, y: pos.y, type: 'longPress' })
      }
    }

    this.isTouching = false
    this.touchHoldTime = 0
    this._swipeDirection = null
  }

  update(dt) {
    if (this.isTouching) {
      this.touchHoldTime += dt
    }
  }

  consumeSwipeDirection() {
    if (this._swipeDirection && !this._swipeConsumed) {
      this._swipeConsumed = true
      return this._swipeDirection
    }
    return null
  }

  isLongPress() {
    return this.isTouching && this.touchHoldTime >= CONFIG.JUMP_CHARGE_TIME
  }

  getHoldTime() {
    return this.touchHoldTime
  }

  consumeTaps(areaList) {
    const hits = []
    for (const tap of this._pendingTaps) {
      for (const area of areaList) {
        if (
          tap.x >= area.x && tap.x <= area.x + area.w &&
          tap.y >= area.y && tap.y <= area.y + area.h
        ) {
          hits.push(area.id)
        }
      }
    }
    this._pendingTaps = []
    return hits
  }

  consumeAllTaps() {
    const taps = [...this._pendingTaps]
    this._pendingTaps = []
    return taps
  }

  clear() {
    this.touches = {}
    this.isTouching = false
    this.touchHoldTime = 0
    this._pendingTaps = []
    this._swipeDirection = null
    this._swipeConsumed = false
  }
}

module.exports = { InputSystem }
