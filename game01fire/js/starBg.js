/**
 * 星空背景模块
 * 包含：静态星空、极光、流星
 */

import { random, randomChoice, randomInt } from '../utils/util.js'
import { COLORS, STAR_COUNT, METEOR_INTERVAL } from './config.js'

/**
 * 单颗星星
 */
class Star {
  constructor(width, height) {
    this.reset(width, height)
  }

  reset(width, height) {
    this.x = random(0, width)
    this.y = random(0, height)
    this.size = random(0.5, 2)
    this.alpha = random(0.3, 1)
    this.alphaSpeed = random(0.005, 0.02)
    this.alphaDirection = 1
    this.color = randomChoice(COLORS.star)
  }

  update() {
    // 闪烁效果
    this.alpha += this.alphaSpeed * this.alphaDirection
    if (this.alpha >= 1) {
      this.alpha = 1
      this.alphaDirection = -1
    } else if (this.alpha <= 0.3) {
      this.alpha = 0.3
      this.alphaDirection = 1
    }
  }

  render(ctx) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

/**
 * 极光带
 */
class Aurora {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.reset()
  }

  reset() {
    this.points = []
    const pointCount = 5
    for (let i = 0; i <= pointCount; i++) {
      this.points.push({
        x: (this.width / pointCount) * i,
        y: random(this.height * 0.1, this.height * 0.4),
        baseY: random(this.height * 0.1, this.height * 0.4),
        speed: random(0.002, 0.005),
        phase: random(0, Math.PI * 2)
      })
    }
    this.colorIndex = randomInt(0, COLORS.aurora.length - 1)
    this.alpha = random(0.15, 0.3)
  }

  update(time) {
    this.points.forEach(point => {
      point.y = point.baseY + Math.sin(time * point.speed + point.phase) * 30
    })
  }

  render(ctx) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    
    // 绘制极光带
    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    
    // 使用贝塞尔曲线绘制平滑曲线
    for (let i = 1; i < this.points.length - 1; i++) {
      const xc = (this.points[i].x + this.points[i + 1].x) / 2
      const yc = (this.points[i].y + this.points[i + 1].y) / 2
      ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc)
    }
    
    // 连接到画布底部形成封闭区域
    ctx.lineTo(this.width, this.height)
    ctx.lineTo(0, this.height)
    ctx.closePath()
    
    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, COLORS.aurora[this.colorIndex])
    gradient.addColorStop(0.5, COLORS.aurora[(this.colorIndex + 1) % COLORS.aurora.length])
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.restore()
  }
}

/**
 * 流星
 */
class Meteor {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.active = false
    this.reset()
  }

  reset() {
    this.x = random(0, this.width)
    this.y = random(-50, this.height * 0.3)
    this.length = random(50, 150)
    this.speed = random(8, 15)
    this.angle = random(0.6, 0.9) // 倾斜角度
    this.alpha = 1
    this.active = true
  }

  update() {
    if (!this.active) return
    
    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed
    
    // 渐隐效果
    if (this.y > this.height * 0.5) {
      this.alpha -= 0.05
    }
    
    // 超出屏幕则失效
    if (this.x > this.width || this.y > this.height || this.alpha <= 0) {
      this.active = false
    }
  }

  render(ctx) {
    if (!this.active) return
    
    ctx.save()
    ctx.globalAlpha = this.alpha
    
    // 绘制流星尾迹
    const tailX = this.x - Math.cos(this.angle) * this.length
    const tailY = this.y - Math.sin(this.angle) * this.length
    
    const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)')
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    
    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(this.x, this.y)
    ctx.stroke()
    
    // 流星头部光晕
    ctx.beginPath()
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fill()
    
    ctx.restore()
  }
}

/**
 * 星空背景管理器
 */
export default class StarBackground {
  constructor({ width, height }) {
    this.width = width
    this.height = height
    this.time = 0
    this.lastMeteorTime = 0
    
    // 创建星星
    this.stars = []
    for (let i = 0; i < STAR_COUNT; i++) {
      this.stars.push(new Star(width, height))
    }
    
    // 创建极光
    this.auroras = [
      new Aurora(width, height),
      new Aurora(width, height)
    ]
    
    // 流星池
    this.meteors = []
    for (let i = 0; i < 3; i++) {
      const meteor = new Meteor(width, height)
      meteor.active = false
      this.meteors.push(meteor)
    }
  }

  update(deltaTime) {
    this.time += deltaTime
    
    // 更新星星
    this.stars.forEach(star => star.update())
    
    // 更新极光
    this.auroras.forEach(aurora => aurora.update(this.time))
    
    // 更新流星
    this.meteors.forEach(meteor => meteor.update())
    
    // 随机生成新流星
    if (this.time - this.lastMeteorTime > METEOR_INTERVAL) {
      const inactiveMeteor = this.meteors.find(m => !m.active)
      if (inactiveMeteor) {
        inactiveMeteor.reset()
        this.lastMeteorTime = this.time
      }
    }
  }

  render(ctx) {
    // 绘制深色背景渐变
    const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height)
    bgGradient.addColorStop(0, '#0a0a1a')
    bgGradient.addColorStop(0.5, '#0f0f2a')
    bgGradient.addColorStop(1, '#1a1a3a')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, this.width, this.height)
    
    // 绘制极光
    this.auroras.forEach(aurora => aurora.render(ctx))
    
    // 绘制星星
    this.stars.forEach(star => star.render(ctx))
    
    // 绘制流星
    this.meteors.forEach(meteor => meteor.render(ctx))
  }
}
