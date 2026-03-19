/**
 * 交互控制器
 * 处理触摸和重力感应
 */

import { random } from '../utils/util.js'
import { LONG_PRESS_INTERVAL, SHAKE_THRESHOLD } from './config.js'

export default class Controller {
  constructor({ width, height, onLaunch }) {
    this.width = width
    this.height = height
    this.onLaunch = onLaunch
    
    // 触摸状态
    this.touching = false
    this.touchStartX = 0
    this.touchStartY = 0
    this.touchX = 0
    this.touchY = 0
    this.lastLaunchTime = 0
    
    // 重力感应
    this.tiltX = 0
    this.tiltY = 0
    this.lastAccelX = 0
    this.lastAccelY = 0
    this.lastAccelZ = 0
    this.shakeDetected = false
    
    // 初始化事件监听
    this.initTouchEvents()
    this.initMotionEvents()
  }

  /**
   * 初始化触摸事件
   */
  initTouchEvents() {
    wx.onTouchStart((e) => {
      const touch = e.touches[0]
      this.touching = true
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
      this.touchX = touch.clientX
      this.touchY = touch.clientY
      
      // 立即发射一颗烟花
      this.launchFirework(this.touchX, this.touchY)
    })
    
    wx.onTouchMove((e) => {
      if (!this.touching) return
      const touch = e.touches[0]
      this.touchX = touch.clientX
      this.touchY = touch.clientY
    })
    
    wx.onTouchEnd((e) => {
      this.touching = false
    })
    
    wx.onTouchCancel((e) => {
      this.touching = false
    })
  }

  /**
   * 初始化重力感应事件
   */
  initMotionEvents() {
    // 检查是否支持重力感应
    try {
      wx.onDeviceMotionChange((res) => {
        // 获取倾斜角度
        this.tiltX = res.beta  // 前后倾斜 (-180 to 180)
        this.tiltY = res.gamma // 左右倾斜 (-90 to 90)
        
        // 限制范围
        this.tiltX = Math.max(-45, Math.min(45, this.tiltX))
        this.tiltY = Math.max(-45, Math.min(45, this.tiltY))
        
        // 检测晃动
        const accelX = res.alpha
        const accelY = res.beta
        const accelZ = res.gamma
        
        const deltaX = Math.abs(accelX - this.lastAccelX)
        const deltaY = Math.abs(accelY - this.lastAccelY)
        const deltaZ = Math.abs(accelZ - this.lastAccelZ)
        
        if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
          this.shakeDetected = true
        }
        
        this.lastAccelX = accelX
        this.lastAccelY = accelY
        this.lastAccelZ = accelZ
      })
    } catch (e) {
      console.log('重力感应不可用')
    }
  }

  /**
   * 发射烟花
   */
  launchFirework(x, y) {
    if (this.onLaunch) {
      // 计算目标高度（触摸点上方）
      const targetY = Math.max(50, y - random(50, 150))
      
      this.onLaunch({
        x: x,
        targetY: targetY,
        tilt: this.tiltY / 45 // 归一化倾斜值
      })
    }
  }

  /**
   * 更新（处理长按连续发射）
   */
  update(time) {
    // 长按连续发射
    if (this.touching && time - this.lastLaunchTime > LONG_PRESS_INTERVAL) {
      this.launchFirework(this.touchX, this.touchY)
      this.lastLaunchTime = time
    }
    
    // 处理晃动
    if (this.shakeDetected) {
      this.shakeDetected = false
      // 晃动时随机发射烟花
      if (this.onLaunch) {
        this.onLaunch({
          x: random(this.width * 0.2, this.width * 0.8),
          targetY: random(this.height * 0.15, this.height * 0.4),
          tilt: this.tiltY / 45
        })
      }
    }
  }

  /**
   * 获取当前倾斜值
   */
  getTilt() {
    return {
      x: this.tiltX,
      y: this.tiltY
    }
  }

  /**
   * 销毁
   */
  destroy() {
    // 微信小游戏没有移除事件监听的 API
    // 这里只是标记状态
    this.touching = false
  }
}
