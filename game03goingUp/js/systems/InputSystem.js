// 触摸输入系统
// 统一处理微信小游戏和浏览器两种环境的触摸事件

const isWechat = typeof wx !== 'undefined'

class InputSystem {
  constructor() {
    this.touches = {}          // 当前活跃触摸点
    this.swipeDeltaX = 0       // 当前帧横向滑动量
    this.swipeStartX = 0       // 滑动起始X
    this.swipeStartY = 0       // 滑动起始Y
    this.isTouching = false    // 是否有触摸进行中
    this.tapCallbacks = []     // 点击回调列表 [{x,y,fn}] → 用于按钮检测
    this._pendingTaps = []     // 等待处理的点击 [{x,y}]
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
    // 浏览器环境在 setCanvas() 后绑定
  }

  // 为浏览器环境绑定canvas
  setCanvas(canvas) {
    this.canvas = canvas
    if (!isWechat && canvas && canvas.addEventListener) {
      canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this._onStart(e) }, { passive: false })
      canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this._onMove(e) }, { passive: false })
      canvas.addEventListener('touchend', (e) => this._onEnd(e))
      canvas.addEventListener('touchcancel', (e) => this._onEnd(e))
      // 鼠标支持（桌面测试用）
      canvas.addEventListener('mousedown', (e) => this._onMouseStart(e))
      canvas.addEventListener('mousemove', (e) => this._onMouseMove(e))
      canvas.addEventListener('mouseup', (e) => this._onMouseEnd(e))
    }
  }

  // 坐标转换：将屏幕坐标转为设计坐标（750×1334）
  _toDesign(clientX, clientY) {
    if (this.canvas) {
      const scaleX = 750 / (this.canvas.width / (isWechat ? 1 : 1))
      const scaleY = 1334 / (this.canvas.height / (isWechat ? 1 : 1))
      // 微信canvas宽高已是物理像素
      const dpr = isWechat ? (this.canvas.width / 375) : 1
      return {
        x: clientX * dpr * scaleX,
        y: clientY * dpr * scaleY,
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
    this.swipeDeltaX = 0
    this.isTouching = true
    this.touches[touch.identifier || 0] = pos
  }

  _onMove(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0]
    if (!touch) return
    const pos = this._toDesign(touch.clientX, touch.clientY)
    this.swipeDeltaX = pos.x - this.swipeStartX
    this.touches[touch.identifier || 0] = pos
  }

  _onEnd(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0]
    if (!touch) return
    const pos = this._toDesign(touch.clientX, touch.clientY)
    // 判断是否为点击（位移很小）
    const dx = pos.x - this.swipeStartX
    const dy = pos.y - this.swipeStartY
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      this._pendingTaps.push({ x: pos.x, y: pos.y })
    }
    this.isTouching = false
    this.swipeDeltaX = 0
    delete this.touches[touch.identifier || 0]
  }

  // 鼠标事件（桌面测试）
  _mouseDown = false
  _onMouseStart(e) {
    this._mouseDown = true
    const rect = this.canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height)
    this.swipeStartX = x
    this.swipeStartY = y
    this.swipeDeltaX = 0
    this.isTouching = true
  }

  _onMouseMove(e) {
    if (!this._mouseDown) return
    const rect = this.canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width)
    this.swipeDeltaX = x - this.swipeStartX
  }

  _onMouseEnd(e) {
    if (!this._mouseDown) return
    this._mouseDown = false
    const rect = this.canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height)
    const dx = x - this.swipeStartX
    const dy = y - this.swipeStartY
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      this._pendingTaps.push({ x, y })
    }
    this.isTouching = false
    this.swipeDeltaX = 0
  }

  // 获取当前横向滑动方向和强度（-1~1，每帧）
  // 返回 -1（左滑）/ 0（无滑动）/ 1（右滑），强度按距离缩放
  getSwipeX() {
    if (!this.isTouching) return 0
    const MAX_SWIPE = 150  // 超过此距离即为最大速度
    return Math.max(-1, Math.min(1, this.swipeDeltaX / MAX_SWIPE))
  }

  // 消费所有待处理点击，检测是否命中某区域
  // areaList: [{x, y, w, h, id}]
  // 返回命中的id列表
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

  // 清空所有输入状态
  clear() {
    this.touches = {}
    this.swipeDeltaX = 0
    this.isTouching = false
    this._pendingTaps = []
  }
}

module.exports = { InputSystem }
