/**
 * 烟花系统
 * 实现烟花类和各种爆炸效果
 */

import { 
  random, 
  randomChoice, 
  createWatercolorGradient
} from '../utils/util.js'
import { 
  COLORS, 
  FIREWORK_TYPES, 
  FIREWORK_RISE_SPEED,
  FIREWORK_EXPLODE_PARTICLES,
  TEXT_FIREWORKS
} from './config.js'
import { Particle } from './particle.js'

/**
 * 烟花类
 */
export class Firework {
  constructor({ x, targetY, color, type, particlePool, width, height, tilt = 0 }) {
    this.x = x
    this.y = height
    this.targetY = targetY
    this.color = color || randomChoice(COLORS.dreamy)
    this.type = type || randomChoice(Object.values(FIREWORK_TYPES))
    this.particlePool = particlePool
    this.width = width
    this.height = height
    this.tilt = tilt // 重力感应倾斜影响
    
    // 上升阶段
    this.rising = true
    this.vy = -FIREWORK_RISE_SPEED - random(1, 2)
    this.vx = tilt * 0.5
    
    // 尾迹
    this.trail = []
    this.maxTrailLength = 15
    
    // 爆炸状态
    this.exploded = false
    this.explodeTime = 0
    
    // 回调
    this.onExplode = null
  }

  update() {
    if (this.rising) {
      // 保存尾迹
      this.trail.push({ x: this.x, y: this.y })
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift()
      }
      
      // 上升
      this.x += this.vx
      this.y += this.vy
      this.vy += 0.05 // 重力减速
      
      // 到达目标高度或速度为0时爆炸
      if (this.y <= this.targetY || this.vy >= 0) {
        this.explode()
      }
    }
  }

  render(ctx) {
    if (this.rising) {
      ctx.save()
      
      // 绘制尾迹
      if (this.trail.length > 1) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          const alpha = i / this.trail.length
          const size = 2 * alpha
          
          ctx.globalAlpha = alpha * 0.8
          ctx.fillStyle = this.color
          ctx.beginPath()
          ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      // 绘制烟花头部
      const gradient = createWatercolorGradient(ctx, this.x, this.y, 8, this.color, 1)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, 8, 0, Math.PI * 2)
      ctx.fill()
      
      // 发光效果
      ctx.globalAlpha = 0.5
      const glowGradient = createWatercolorGradient(ctx, this.x, this.y, 20, this.color, 0.5)
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, 20, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    }
  }

  /**
   * 爆炸
   */
  explode() {
    this.rising = false
    this.exploded = true
    
    // 触发回调
    if (this.onExplode) {
      this.onExplode(this.type)
    }
    
    // 根据类型创建爆炸粒子
    switch (this.type) {
      case FIREWORK_TYPES.HEART:
        this.explodeHeart()
        break
      case FIREWORK_TYPES.DOUBLE:
        this.explodeDouble()
        break
      case FIREWORK_TYPES.WATERCOLOR:
        this.explodeWatercolor()
        break
      case FIREWORK_TYPES.METEOR:
        this.explodeMeteor()
        break
      // VIP专属
      case FIREWORK_TYPES.BAOFU:
        this.explodeText('baofu')
        break
      case FIREWORK_TYPES.CHENGGONG:
        this.explodeText('chenggong')
        break
      case FIREWORK_TYPES.CUPID:
        this.explodeCupid()
        break
      case FIREWORK_TYPES.JINLI:
        this.explodeText('jinli')
        break
      default:
        this.explodeHeart()
    }
  }

  /**
   * 心形爆炸
   */
  explodeHeart() {
    const particleCount = 80
    const color = this.color
    
    for (let i = 0; i < particleCount; i++) {
      // 心形参数方程
      const t = (Math.PI * 2 / particleCount) * i
      const heartX = 16 * Math.pow(Math.sin(t), 3)
      const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
      
      const speed = random(0.15, 0.25)
      
      this.particlePool.get({
        x: this.x,
        y: this.y,
        vx: heartX * speed,
        vy: heartY * speed,
        color: color,
        size: random(2, 4),
        life: random(80, 120),
        gravity: 0.01,
        friction: 0.99,
        maxTrailLength: 4,
        watercolor: true
      })
    }
  }

  /**
   * 双重爆炸
   */
  explodeDouble() {
    // 第一次爆炸
    const firstCount = 40
    const firstColor = this.color
    
    for (let i = 0; i < firstCount; i++) {
      const angle = (Math.PI * 2 / firstCount) * i
      const speed = random(3, 5)
      
      this.particlePool.get({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: firstColor,
        size: random(2, 3),
        life: random(40, 60),
        gravity: 0.02,
        friction: 0.97,
        maxTrailLength: 2,
        watercolor: true
      })
    }
    
    // 延迟第二次爆炸 - 创建多个小爆炸点
    const secondColor = randomChoice(COLORS.dreamy)
    const subExplosions = 5
    
    for (let j = 0; j < subExplosions; j++) {
      const subAngle = (Math.PI * 2 / subExplosions) * j
      const subDistance = 30
      const subX = this.x + Math.cos(subAngle) * subDistance
      const subY = this.y + Math.sin(subAngle) * subDistance
      
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 / 15) * i
        const speed = random(1.5, 3)
        
        this.particlePool.get({
          x: subX,
          y: subY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: secondColor,
          size: random(1.5, 3),
          life: random(50, 80),
          gravity: 0.015,
          friction: 0.98,
          maxTrailLength: 2,
          watercolor: true
        })
      }
    }
  }

  /**
   * 水彩晕染爆炸
   */
  explodeWatercolor() {
    const particleCount = 60
    const colors = [this.color, randomChoice(COLORS.dreamy), randomChoice(COLORS.dreamy)]
    
    // 多层渐变效果
    for (let layer = 0; layer < 3; layer++) {
      const layerDelay = layer * 5
      const layerSpeed = 4 - layer * 0.8
      const layerSize = 4 + layer * 2
      
      for (let i = 0; i < particleCount / 3; i++) {
        const angle = random(0, Math.PI * 2)
        const speed = random(layerSpeed - 1, layerSpeed + 1)
        const color = colors[layer % colors.length]
        
        this.particlePool.get({
          x: this.x + random(-5, 5),
          y: this.y + random(-5, 5),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          size: random(layerSize - 1, layerSize + 1),
          life: random(80, 140),
          gravity: 0.01,
          friction: 0.99,
          maxTrailLength: 6,
          watercolor: true
        })
      }
    }
  }

  /**
   * 流星爆炸
   */
  explodeMeteor() {
    const colors = ['#FFFFFF', '#87CEEB', '#FFD700', '#FF69B4']
    
    // 主流星尾迹
    const mainAngle = random(-Math.PI / 4, Math.PI / 4) - Math.PI / 2
    const mainSpeed = 5
    
    for (let i = 0; i < 30; i++) {
      const spread = random(-0.3, 0.3)
      const speed = mainSpeed - random(0, 2)
      
      this.particlePool.get({
        x: this.x,
        y: this.y,
        vx: Math.cos(mainAngle + spread) * speed,
        vy: Math.sin(mainAngle + spread) * speed + 1,
        color: randomChoice(colors),
        size: random(2, 5),
        life: random(60, 100),
        gravity: 0.02,
        friction: 0.98,
        maxTrailLength: 8,
        watercolor: true
      })
    }
    
    // 星光闪烁
    for (let i = 0; i < 20; i++) {
      const angle = random(0, Math.PI * 2)
      const speed = random(1, 3)
      
      this.particlePool.get({
        x: this.x + random(-20, 20),
        y: this.y + random(-20, 20),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FFFFFF',
        size: random(1, 3),
        life: random(30, 60),
        gravity: 0.01,
        friction: 0.99,
        maxTrailLength: 2,
        watercolor: true
      })
    }
  }

  /**
   * 文字烟花爆炸 (暴富/成功/锦鲤)
   */
  explodeText(textType) {
    const config = TEXT_FIREWORKS[textType]
    if (!config) return
    
    const text = config.text
    const colors = COLORS.gold
    
    // 如果有文字，创建文字粒子
    if (text) {
      const chars = text.split('')
      const charCount = chars.length
      
      chars.forEach((char, i) => {
        const angle = (i / charCount) * Math.PI * 2 - Math.PI / 2
        const distance = 40
        
        this.particlePool.get({
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * distance * 0.05,
          vy: Math.sin(angle) * distance * 0.05 - 1,
          color: randomChoice(colors),
          size: 16,
          life: random(80, 120),
          gravity: 0.005,
          friction: 0.995,
          maxTrailLength: 0,
          watercolor: false,
          text: char // 文字内容
        })
      })
    }
    
    // 创建装饰粒子
    const decorCount = 15
    for (let i = 0; i < decorCount; i++) {
      const angle = (i / decorCount) * Math.PI * 2
      const distance = random(50, 70)
      
      this.particlePool.get({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * distance * 0.03,
        vy: Math.sin(angle) * distance * 0.03,
        color: randomChoice(colors),
        size: random(3, 5),
        life: random(60, 100),
        gravity: 0.01,
        friction: 0.99,
        maxTrailLength: 3,
        watercolor: true
      })
    }
    
    // 金色闪光粒子
    for (let i = 0; i < 20; i++) {
      const angle = random(0, Math.PI * 2)
      const speed = random(1, 3)
      
      this.particlePool.get({
        x: this.x + random(-10, 10),
        y: this.y + random(-10, 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FFD700',
        size: random(2, 4),
        life: random(40, 80),
        gravity: 0.02,
        friction: 0.98,
        maxTrailLength: 2,
        watercolor: true
      })
    }
  }

  /**
   * 丘比特烟花爆炸
   */
  explodeCupid() {
    const config = TEXT_FIREWORKS.cupid
    const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FF6B9D']
    
    // 主心形
    const heartCount = 60
    for (let i = 0; i < heartCount; i++) {
      const t = (Math.PI * 2 / heartCount) * i
      const heartX = 16 * Math.pow(Math.sin(t), 3)
      const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
      
      const speed = random(0.12, 0.22)
      
      this.particlePool.get({
        x: this.x,
        y: this.y,
        vx: heartX * speed,
        vy: heartY * speed,
        color: randomChoice(colors),
        size: random(3, 5),
        life: random(80, 120),
        gravity: 0.008,
        friction: 0.99,
        maxTrailLength: 5,
        watercolor: true
      })
    }
    
    // 小心心散落
    const miniHeartCount = 12
    for (let i = 0; i < miniHeartCount; i++) {
      const angle = (i / miniHeartCount) * Math.PI * 2
      const distance = random(60, 90)
      
      this.particlePool.get({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * distance * 0.04,
        vy: Math.sin(angle) * distance * 0.04 - 1,
        color: randomChoice(colors),
        size: random(4, 6),
        life: random(70, 110),
        gravity: 0.012,
        friction: 0.99,
        maxTrailLength: 4,
        watercolor: true
      })
    }
    
    // 爱心光点
    for (let i = 0; i < 25; i++) {
      const angle = random(0, Math.PI * 2)
      const speed = random(1, 2.5)
      
      this.particlePool.get({
        x: this.x + random(-15, 15),
        y: this.y + random(-15, 15),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FFB6C1',
        size: random(2, 4),
        life: random(40, 80),
        gravity: 0.015,
        friction: 0.98,
        maxTrailLength: 3,
        watercolor: true
      })
    }
  }
}

/**
 * 烟花管理器
 */
export default class FireworkManager {
  constructor({ width, height, particlePool }) {
    this.width = width
    this.height = height
    this.particlePool = particlePool
    this.fireworks = []
    this.onExplode = null
  }

  /**
   * 发射烟花
   */
  launch(options = {}) {
    const x = options.x || random(this.width * 0.2, this.width * 0.8)
    const targetY = options.targetY || random(this.height * 0.2, this.height * 0.5)
    const color = options.color
    const type = options.type
    const tilt = options.tilt || 0
    
    const firework = new Firework({
      x,
      targetY,
      color,
      type,
      particlePool: this.particlePool,
      width: this.width,
      height: this.height,
      tilt
    })
    
    firework.onExplode = (type) => {
      if (this.onExplode) {
        this.onExplode(type)
      }
    }
    
    this.fireworks.push(firework)
    
    return firework
  }

  update() {
    // 更新烟花
    this.fireworks.forEach(firework => {
      firework.update()
    })
    
    // 移除已爆炸的烟花
    this.fireworks = this.fireworks.filter(f => !f.exploded)
  }

  render(ctx) {
    this.fireworks.forEach(firework => {
      firework.render(ctx)
    })
  }
}
