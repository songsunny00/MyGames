/**
 * 粒子系统
 * 实现粒子类和粒子池
 */

import { random, clamp, createWatercolorGradient } from '../utils/util.js'
import { GRAVITY, FRICTION } from './config.js'

/**
 * 单个粒子
 */
export class Particle {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.ax = 0
    this.ay = 0
    this.color = '#FFFFFF'
    this.size = 3
    this.alpha = 1
    this.life = 100
    this.maxLife = 100
    this.gravity = GRAVITY
    this.friction = FRICTION
    this.active = false
    this.trail = [] // 拖尾轨迹
    this.maxTrailLength = 5
    this.watercolor = true // 水彩效果
    this.text = null // 文字内容（用于文字烟花）
  }

  /**
   * 初始化粒子
   */
  init(options) {
    this.x = options.x || 0
    this.y = options.y || 0
    this.vx = options.vx || 0
    this.vy = options.vy || 0
    this.ax = options.ax || 0
    this.ay = options.ay || GRAVITY
    this.color = options.color || '#FFFFFF'
    this.size = options.size || 3
    this.life = options.life || 100
    this.maxLife = this.life
    this.alpha = 1
    this.gravity = options.gravity !== undefined ? options.gravity : GRAVITY
    this.friction = options.friction !== undefined ? options.friction : FRICTION
    this.active = true
    this.trail = []
    this.maxTrailLength = options.maxTrailLength || 5
    this.watercolor = options.watercolor !== undefined ? options.watercolor : true
    this.text = options.text || null
  }

  update() {
    if (!this.active) return
    
    // 保存轨迹点
    if (this.maxTrailLength > 0) {
      this.trail.push({ x: this.x, y: this.y, alpha: this.alpha })
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift()
      }
    }
    
    // 更新速度
    this.vx += this.ax
    this.vy += this.ay + this.gravity
    
    // 应用摩擦力
    this.vx *= this.friction
    this.vy *= this.friction
    
    // 更新位置
    this.x += this.vx
    this.y += this.vy
    
    // 更新生命周期
    this.life--
    
    // 计算透明度
    this.alpha = clamp(this.life / this.maxLife, 0, 1)
    
    // 生命周期结束
    if (this.life <= 0) {
      this.active = false
    }
  }

  render(ctx) {
    if (!this.active || this.alpha <= 0) return
    
    ctx.save()
    
    // 绘制拖尾
    if (this.trail.length > 1) {
      this.trail.forEach((point, index) => {
        const trailAlpha = (index / this.trail.length) * this.alpha * 0.5
        const trailSize = this.size * (index / this.trail.length)
        
        ctx.globalAlpha = trailAlpha
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    
    // 绘制粒子主体
    if (this.text) {
      // 文字粒子
      ctx.globalAlpha = this.alpha
      ctx.fillStyle = this.color
      ctx.font = `bold ${this.size}px "PingFang SC", "Microsoft YaHei", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 发光效果
      ctx.shadowColor = this.color
      ctx.shadowBlur = 15
      ctx.fillText(this.text, this.x, this.y)
    } else if (this.watercolor) {
      // 水彩效果 - 径向渐变
      const gradient = createWatercolorGradient(ctx, this.x, this.y, this.size * 2, this.color, this.alpha * 0.8)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // 普通粒子
      ctx.globalAlpha = this.alpha
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
  }
}

/**
 * 粒子池 - 对象池模式
 */
export class ParticlePool {
  constructor(maxSize) {
    this.maxSize = maxSize
    this.pool = []
    this.activeCount = 0
    
    // 预创建粒子
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(new Particle())
    }
  }

  /**
   * 获取一个粒子
   */
  get(options) {
    // 查找未激活的粒子
    const particle = this.pool.find(p => !p.active)
    
    if (particle) {
      particle.init(options)
      this.activeCount++
      return particle
    }
    
    // 池已满，返回 null
    return null
  }

  /**
   * 批量获取粒子
   */
  getMultiple(count, optionsFn) {
    const particles = []
    for (let i = 0; i < count; i++) {
      const particle = this.get(optionsFn(i))
      if (particle) {
        particles.push(particle)
      }
    }
    return particles
  }

  /**
   * 更新所有粒子
   */
  update() {
    this.activeCount = 0
    this.pool.forEach(particle => {
      if (particle.active) {
        particle.update()
        if (particle.active) {
          this.activeCount++
        }
      }
    })
  }

  /**
   * 渲染所有粒子
   */
  render(ctx) {
    this.pool.forEach(particle => {
      if (particle.active) {
        particle.render(ctx)
      }
    })
  }

  /**
   * 清空所有粒子
   */
  clear() {
    this.pool.forEach(particle => {
      particle.active = false
    })
    this.activeCount = 0
  }
}

export default ParticlePool
