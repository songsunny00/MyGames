// 背景系统
const { GAME_CONFIG } = require('./config.js')

class Star {
  constructor(game) {
    this.game = game
    this.x = Math.random() * game.width
    this.y = Math.random() * game.height
    this.size = Math.random() * 2 + 1
    this.speed = Math.random() * 0.5 + 0.5
    this.alpha = Math.random() * 0.8 + 0.2
  }
  
  update(deltaTime) {
    this.y += this.speed * deltaTime * 10
    if (this.y > this.game.height) {
      this.y = 0
      this.x = Math.random() * this.game.width
    }
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

class Cloud {
  constructor(game) {
    this.game = game
    this.x = Math.random() * game.width
    this.y = Math.random() * game.height * 0.3
    this.size = Math.random() * 50 + 30
    this.speed = Math.random() * 2 + 1
    this.alpha = Math.random() * 0.3 + 0.1
  }
  
  update(deltaTime) {
    this.x += this.speed * deltaTime * 5
    if (this.x > this.game.width + this.size) {
      this.x = -this.size
      this.y = Math.random() * this.game.height * 0.3
    }
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2)
    ctx.arc(this.x + this.size * 0.3, this.y - this.size * 0.2, this.size * 0.4, 0, Math.PI * 2)
    ctx.arc(this.x + this.size * 0.6, this.y, this.size * 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

class WillowBranch {
  constructor(game) {
    this.game = game
    this.x = Math.random() * game.width
    this.y = -50
    this.size = Math.random() * 30 + 20
    this.speed = Math.random() * 2 + 1
    this.alpha = Math.random() * 0.6 + 0.4
  }
  
  update(deltaTime) {
    this.y += this.speed * deltaTime * 10
    if (this.y > this.game.height) {
      this.y = -50
      this.x = Math.random() * this.game.width
    }
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.strokeStyle = '#2d5016'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x + this.size * 0.5, this.y + this.size * 1.5)
    ctx.stroke()
    
    // 绘制柳叶
    ctx.fillStyle = '#4caf50'
    for (let i = 0; i < 5; i++) {
      const leafX = this.x + (i / 4) * this.size * 0.5
      const leafY = this.y + (i / 4) * this.size * 1.5
      ctx.beginPath()
      ctx.ellipse(leafX, leafY, 3, 6, Math.PI / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

class PeachBlossom {
  constructor(game) {
    this.game = game
    this.x = Math.random() * game.width
    this.y = -30
    this.size = Math.random() * 10 + 5
    this.speed = Math.random() * 1.5 + 0.5
    this.alpha = Math.random() * 0.8 + 0.5
    this.rotation = Math.random() * Math.PI * 2
  }
  
  update(deltaTime) {
    this.y += this.speed * deltaTime * 8
    this.rotation += deltaTime * 0.5
    if (this.y > this.game.height) {
      this.y = -30
      this.x = Math.random() * this.game.width
      this.rotation = Math.random() * Math.PI * 2
    }
  }
  
  render() {
    const ctx = this.game.ctx
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    
    // 绘制桃花
    ctx.fillStyle = '#ff6b6b'
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const petalX = Math.cos(angle) * this.size
      const petalY = Math.sin(angle) * this.size
      ctx.beginPath()
      ctx.ellipse(petalX, petalY, this.size * 0.6, this.size * 0.3, angle, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 绘制花蕊
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
  }
}

class Background {
  constructor(game) {
    this.game = game
    this.stars = []
    this.clouds = []
    this.willowBranches = []
    this.peachBlossoms = []
    this.init()
  }
  
  init() {
    // 创建星星
    for (let i = 0; i < GAME_CONFIG.BACKGROUND.STAR_COUNT; i++) {
      this.stars.push(new Star(this.game))
    }
    
    // 创建云
    for (let i = 0; i < GAME_CONFIG.BACKGROUND.CLOUD_COUNT; i++) {
      this.clouds.push(new Cloud(this.game))
    }
    
    // 创建柳枝
    for (let i = 0; i < 3; i++) {
      this.willowBranches.push(new WillowBranch(this.game))
    }
    
    // 创建桃花
    for (let i = 0; i < 5; i++) {
      this.peachBlossoms.push(new PeachBlossom(this.game))
    }
  }
  
  update(deltaTime) {
    this.stars.forEach(star => star.update(deltaTime))
    this.clouds.forEach(cloud => cloud.update(deltaTime))
    this.willowBranches.forEach(branch => branch.update(deltaTime))
    this.peachBlossoms.forEach(blossom => blossom.update(deltaTime))
  }
  
  render() {
    // 绘制水墨风格背景
    const ctx = this.game.ctx
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height)
    gradient.addColorStop(0, '#0a0a1a')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(1, '#0f3460')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.game.width, this.game.height)
    
    // 绘制水墨纹理
    this.drawInkTexture(ctx, this.game.width, this.game.height)
    
    // 绘制星星
    this.stars.forEach(star => star.render())
    
    // 绘制云
    this.clouds.forEach(cloud => cloud.render())
    
    // 绘制柳枝
    this.willowBranches.forEach(branch => branch.render())
    
    // 绘制桃花
    this.peachBlossoms.forEach(blossom => blossom.render())
    
    // 绘制远山
    this.drawInkMountains(ctx, this.game.width, this.game.height)
  }
  
  // 绘制水墨纹理
  drawInkTexture(ctx, width, height) {
    ctx.save()
    ctx.globalAlpha = 0.05
    
    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 300 + 100,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
    
    // 绘制水墨线条
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      )
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = Math.random() * 2 + 1
      ctx.stroke()
    }
    
    ctx.restore()
  }
  
  // 绘制水墨远山
  drawInkMountains(ctx, width, height) {
    ctx.save()
    ctx.globalAlpha = 0.3
    
    // 远处的山
    ctx.beginPath()
    ctx.moveTo(0, height * 0.7)
    ctx.bezierCurveTo(
      width * 0.2, height * 0.4,
      width * 0.5, height * 0.5,
      width * 0.8, height * 0.4
    )
    ctx.lineTo(width, height * 0.7)
    ctx.closePath()
    ctx.fillStyle = '#1a1a2e'
    ctx.fill()
    
    // 近处的山
    ctx.beginPath()
    ctx.moveTo(0, height * 0.8)
    ctx.bezierCurveTo(
      width * 0.3, height * 0.6,
      width * 0.6, height * 0.7,
      width, height * 0.6
    )
    ctx.lineTo(width, height * 0.8)
    ctx.closePath()
    ctx.fillStyle = '#16213e'
    ctx.fill()
    
    ctx.restore()
  }
}

module.exports = {
  default: Background
}
