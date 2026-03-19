// 纪念系统
const { GAME_CONFIG } = require('./config.js')

class KongmingLantern {
  constructor(game, x, y, message) {
    this.game = game
    this.x = x
    this.y = y
    this.size = GAME_CONFIG.KONGMING.BASE_SIZE
    this.speed = GAME_CONFIG.KONGMING.RISE_SPEED
    this.floatSpeed = GAME_CONFIG.KONGMING.FLOAT_SPEED
    this.lifetime = GAME_CONFIG.KONGMING.LIFETIME
    this.message = message
    this.createdAt = Date.now()
    this.alpha = 1
  }
  
  update(deltaTime) {
    this.y -= this.speed * deltaTime
    this.x += Math.sin(Date.now() * 0.001) * this.floatSpeed * deltaTime
    
    // 计算生命周期
    const elapsed = Date.now() - this.createdAt
    this.alpha = 1 - (elapsed / this.lifetime)
    
    if (elapsed > this.lifetime) {
      return false // 生命周期结束
    }
    return true
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    
    // 绘制孔明灯主体
    const gradient = ctx.createLinearGradient(this.x - this.size / 2, this.y - this.size / 2, this.x + this.size / 2, this.y + this.size / 4)
    gradient.addColorStop(0, '#ffd700')
    gradient.addColorStop(1, '#ff9800')
    
    // 绘制孔明灯轮廓
    ctx.beginPath()
    ctx.moveTo(this.x, this.y - this.size / 2)
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 4)
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 4)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
    
    // 添加水墨效果
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 绘制灯芯
    ctx.beginPath()
    ctx.arc(this.x, this.y + this.size / 4 + 5, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#ff6b6b'
    ctx.fill()
    
    // 绘制文字
    if (this.message) {
      ctx.fillStyle = '#000000'
      ctx.font = '14px "Ma Shan Zheng", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
      ctx.shadowBlur = 2
      ctx.fillText(this.message, this.x, this.y)
      ctx.shadowBlur = 0
    }
    
    // 添加光晕效果
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    const glowGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)')
    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
    ctx.fillStyle = glowGradient
    ctx.fill()
    
    ctx.restore()
  }
}

class RiverLantern {
  constructor(game, x, y, message) {
    this.game = game
    this.x = x
    this.y = y
    this.size = GAME_CONFIG.RIVER.BASE_SIZE
    this.speed = GAME_CONFIG.RIVER.FLOW_SPEED
    this.waveSpeed = GAME_CONFIG.RIVER.WAVE_SPEED
    this.lifetime = GAME_CONFIG.RIVER.LIFETIME
    this.message = message
    this.createdAt = Date.now()
    this.alpha = 1
  }
  
  update(deltaTime) {
    this.x += this.speed * deltaTime
    this.y += Math.sin(Date.now() * 0.002) * this.waveSpeed * deltaTime
    
    // 计算生命周期
    const elapsed = Date.now() - this.createdAt
    this.alpha = 1 - (elapsed / this.lifetime)
    
    if (elapsed > this.lifetime || this.x > this.game.width + this.size) {
      return false // 生命周期结束
    }
    return true
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    
    // 绘制河灯主体
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size / 2)
    gradient.addColorStop(0, '#ffff99')
    gradient.addColorStop(1, '#ffd700')
    
    // 绘制河灯轮廓
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    
    // 添加水墨效果
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 绘制河灯底座
    ctx.beginPath()
    ctx.arc(this.x, this.y + this.size / 2 - 5, this.size / 4, 0, Math.PI)
    ctx.fillStyle = '#8b4513'
    ctx.fill()
    
    // 绘制文字
    if (this.message) {
      ctx.fillStyle = '#000000'
      ctx.font = '14px "Ma Shan Zheng", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
      ctx.shadowBlur = 2
      ctx.fillText(this.message, this.x, this.y)
      ctx.shadowBlur = 0
    }
    
    // 添加光晕效果
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    const glowGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
    glowGradient.addColorStop(0, 'rgba(255, 255, 153, 0.5)')
    glowGradient.addColorStop(1, 'rgba(255, 255, 153, 0)')
    ctx.fillStyle = glowGradient
    ctx.fill()
    
    // 添加水波效果
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 2 + 5, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 153, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 2 + 10, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 153, 0.2)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    ctx.restore()
  }
}

class Flower {
  constructor(game, x, y, type) {
    this.game = game
    this.x = x
    this.y = y
    this.size = GAME_CONFIG.FLOWER.BASE_SIZE
    this.type = type
    this.animationDuration = GAME_CONFIG.FLOWER.ANIMATION_DURATION
    this.createdAt = Date.now()
    this.alpha = 0
  }
  
  update(deltaTime) {
    const elapsed = Date.now() - this.createdAt
    if (elapsed < this.animationDuration) {
      this.alpha = elapsed / this.animationDuration
    }
    return true
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    
    // 花朵颜色配置
    const colors = {
      '菊花': {
        petals: '#ffd700',
        center: '#ffcc00',
        stroke: 'rgba(255, 215, 0, 0.8)'
      },
      '百合': {
        petals: '#ffffff',
        center: '#ffcc00',
        stroke: 'rgba(255, 255, 255, 0.8)'
      },
      '玫瑰': {
        petals: '#ff6b6b',
        center: '#ff9ff3',
        stroke: 'rgba(255, 107, 107, 0.8)'
      },
      '康乃馨': {
        petals: '#ff9ff3',
        center: '#ff6b6b',
        stroke: 'rgba(255, 159, 243, 0.8)'
      }
    }
    
    const color = colors[this.type] || colors['菊花']
    
    // 绘制花瓣
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const petalX = this.x + Math.cos(angle) * this.size / 2
      const petalY = this.y + Math.sin(angle) * this.size / 2
      
      // 绘制花瓣
      ctx.beginPath()
      ctx.ellipse(petalX, petalY, this.size / 4, this.size / 3, angle, 0, Math.PI * 2)
      ctx.fillStyle = color.petals
      ctx.fill()
      
      // 添加水墨效果
      ctx.strokeStyle = color.stroke
      ctx.lineWidth = 1
      ctx.stroke()
    }
    
    // 绘制花芯
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 6, 0, Math.PI * 2)
    ctx.fillStyle = color.center
    ctx.fill()
    
    // 添加花芯细节
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const stamenX = this.x + Math.cos(angle) * this.size / 8
      const stamenY = this.y + Math.sin(angle) * this.size / 8
      
      ctx.beginPath()
      ctx.arc(stamenX, stamenY, 2, 0, Math.PI * 2)
      ctx.fillStyle = '#ffd93d'
      ctx.fill()
    }
    
    // 添加光晕效果
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    const glowGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
    glowGradient.addColorStop(0, color.stroke)
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = glowGradient
    ctx.fill()
    
    ctx.restore()
  }
}

class Mail {
  constructor(game, x, y, message) {
    this.game = game
    this.x = x
    this.y = y
    this.size = GAME_CONFIG.MAIL.BASE_SIZE
    this.speed = GAME_CONFIG.MAIL.FLY_SPEED
    this.lifetime = GAME_CONFIG.MAIL.LIFETIME
    this.message = message
    this.createdAt = Date.now()
    this.alpha = 1
  }
  
  update(deltaTime) {
    this.y -= this.speed * deltaTime
    this.x += Math.sin(Date.now() * 0.0015) * 10 * deltaTime
    
    // 计算生命周期
    const elapsed = Date.now() - this.createdAt
    this.alpha = 1 - (elapsed / this.lifetime)
    
    if (elapsed > this.lifetime) {
      return false // 生命周期结束
    }
    return true
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    
    // 绘制信封主体
    const gradient = ctx.createLinearGradient(this.x - this.size / 2, this.y - this.size / 3, this.x + this.size / 2, this.y + this.size / 6)
    gradient.addColorStop(0, '#ff4757')
    gradient.addColorStop(1, '#e84118')
    
    // 绘制信封
    ctx.fillStyle = gradient
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 3, this.size, this.size / 2)
    
    // 绘制封口
    ctx.beginPath()
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 3)
    ctx.lineTo(this.x, this.y - this.size / 2)
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 3)
    ctx.fill()
    
    // 添加水墨效果
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(this.x - this.size / 2, this.y - this.size / 3, this.size, this.size / 2)
    
    // 绘制封口线
    ctx.beginPath()
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 3)
    ctx.lineTo(this.x, this.y - this.size / 2)
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 3)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 绘制邮票
    ctx.fillStyle = '#3498db'
    ctx.fillRect(this.x + this.size / 2 - 20, this.y - this.size / 3 + 5, 15, 15)
    ctx.fillStyle = '#ffffff'
    ctx.font = '8px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('邮', this.x + this.size / 2 - 12.5, this.y - this.size / 3 + 12.5)
    
    // 绘制文字
    if (this.message) {
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px "Ma Shan Zheng", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 2
      ctx.fillText(this.message.substring(0, 12) + '...', this.x, this.y - this.size / 6)
      ctx.shadowBlur = 0
    }
    
    // 添加光晕效果
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
    const glowGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size / 2)
    glowGradient.addColorStop(0, 'rgba(255, 71, 87, 0.5)')
    glowGradient.addColorStop(1, 'rgba(255, 71, 87, 0)')
    ctx.fillStyle = glowGradient
    ctx.fill()
    
    // 添加飞行动画效果
    ctx.beginPath()
    ctx.moveTo(this.x - this.size / 2, this.y + this.size / 6)
    ctx.lineTo(this.x - this.size / 2 - 10, this.y + this.size / 6 + 5)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(this.x + this.size / 2, this.y + this.size / 6)
    ctx.lineTo(this.x + this.size / 2 + 10, this.y + this.size / 6 + 5)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    ctx.restore()
  }
}

class MemorialSystem {
  constructor(game) {
    this.game = game
    this.memorialType = null
    this.memorials = []
    this.message = ''
    this.flowerType = '菊花'
  }
  
  setMemorialType(type) {
    this.memorialType = type
    this.memorials = []
  }
  
  handleTouch(x, y) {
    if (!this.memorialType) return
    
    let memorial
    switch (this.memorialType) {
      case GAME_CONFIG.MEMORIAL_TYPES.KONGMING:
        memorial = new KongmingLantern(this.game, x, y, this.message)
        this.game.unlockAchievement('first_kongming')
        break
      case GAME_CONFIG.MEMORIAL_TYPES.RIVER:
        memorial = new RiverLantern(this.game, x, y, this.message)
        this.game.unlockAchievement('first_river')
        break
      case GAME_CONFIG.MEMORIAL_TYPES.FLOWER:
        memorial = new Flower(this.game, x, y, this.flowerType)
        this.game.unlockAchievement('first_flower')
        break
      case GAME_CONFIG.MEMORIAL_TYPES.MAIL:
        memorial = new Mail(this.game, x, y, this.message)
        this.game.unlockAchievement('first_mail')
        break
    }
    
    if (memorial) {
      this.memorials.push(memorial)
      // 保存记录
      this.game.saveMemorialRecord({
        type: this.memorialType,
        message: this.message,
        time: new Date().toISOString()
      })
    }
  }
  
  update(deltaTime) {
    this.memorials = this.memorials.filter(memorial => memorial.update(deltaTime))
  }
  
  render() {
    this.memorials.forEach(memorial => memorial.render())
  }
  
  setMessage(message) {
    this.message = message
  }
  
  setFlowerType(type) {
    this.flowerType = type
  }
}

module.exports = {
  default: MemorialSystem
}
