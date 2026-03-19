// 游戏主逻辑
const { GAME_CONFIG } = require('./config.js')
const Background = require('./background.js').default
const MemorialSystem = require('./memorial.js').default
const UIController = require('./ui.js').default
const AudioManager = require('./audio.js').default
const AchievementSystem = require('./achievement.js').default

class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.width = canvas.width
    this.height = canvas.height
    this.state = GAME_CONFIG.GAME_STATE.START
    this.lastTime = 0
    
    // 初始化游戏系统
    this.background = new Background(this)
    this.memorialSystem = new MemorialSystem(this)
    this.uiController = new UIController(this)
    this.audioManager = new AudioManager(this)
    this.achievementSystem = new AchievementSystem(this)
    
    // 触摸事件处理
    this.touchHandler = this.handleTouch.bind(this)
    
    // 检测canvas是否支持addEventListener（浏览器环境）
    if (this.canvas.addEventListener) {
      this.canvas.addEventListener('touchstart', this.touchHandler)
      this.canvas.addEventListener('touchmove', this.touchHandler)
      this.canvas.addEventListener('touchend', this.touchHandler)
    } else {
      // 在非浏览器环境中，跳过事件监听
      console.log('Running in non-browser environment, touch events disabled')
    }
  }
  
  init() {
    console.log('Game initialized')
    this.audioManager.playBGM()
    this.achievementSystem.loadAchievements()
  }
  
  update(deltaTime) {
    switch (this.state) {
      case GAME_CONFIG.GAME_STATE.MENU:
        this.background.update(deltaTime)
        this.uiController.update(deltaTime)
        break
      case GAME_CONFIG.GAME_STATE.PLAYING:
        this.background.update(deltaTime)
        this.memorialSystem.update(deltaTime)
        this.uiController.update(deltaTime)
        break
    }
  }
  
  render() {
    // 清空画布
    this.ctx.fillStyle = GAME_CONFIG.VISUAL.BACKGROUND_COLOR
    this.ctx.fillRect(0, 0, this.width, this.height)
    
    switch (this.state) {
      case GAME_CONFIG.GAME_STATE.START:
        this.renderStartScreen()
        break
      case GAME_CONFIG.GAME_STATE.MENU:
        this.background.render()
        this.uiController.renderMenu()
        break
      case GAME_CONFIG.GAME_STATE.PLAYING:
        this.background.render()
        this.memorialSystem.render()
        this.uiController.renderGame()
        break
    }
  }
  
  renderStartScreen() {
    // 绘制水墨风格背景
    this.ctx.fillStyle = '#0a0a1a'
    this.ctx.fillRect(0, 0, this.width, this.height)
    
    // 绘制水墨山水背景
    this.drawInkMountain(this.ctx, this.width, this.height)
    
    // 绘制柳枝
    this.drawWillowBranch(this.ctx, this.width, this.height)
    
    // 绘制桃花
    this.drawPeachBlossom(this.ctx, this.width, this.height)
    
    // 绘制标题
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '48px "Ma Shan Zheng", Arial, sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
    this.ctx.shadowBlur = 10
    this.ctx.fillText('清明寄思', this.width / 2, this.height / 2 - 60)
    
    // 绘制副标题
    this.ctx.font = '24px "Ma Shan Zheng", Arial, sans-serif'
    this.ctx.fillText('寄托哀思，传承记忆', this.width / 2, this.height / 2 - 10)
    
    // 绘制开始按钮
    this.ctx.shadowBlur = 0
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.ctx.font = '20px "Ma Shan Zheng", Arial, sans-serif'
    this.ctx.fillText('点击开始', this.width / 2, this.height / 2 + 50)
    
    // 绘制装饰性文字
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    this.ctx.font = '16px "Ma Shan Zheng", Arial, sans-serif'
    this.ctx.fillText('慎终追远，民德归厚矣', this.width / 2, this.height - 40)
  }
  
  // 绘制水墨山水
  drawInkMountain(ctx, width, height) {
    ctx.save()
    ctx.globalAlpha = 0.6
    
    // 绘制远处的山
    ctx.beginPath()
    ctx.moveTo(0, height * 0.7)
    ctx.bezierCurveTo(width * 0.2, height * 0.4, width * 0.5, height * 0.5, width * 0.8, height * 0.4)
    ctx.lineTo(width, height * 0.7)
    ctx.closePath()
    ctx.fillStyle = '#1a1a2e'
    ctx.fill()
    
    // 绘制近处的山
    ctx.beginPath()
    ctx.moveTo(0, height * 0.8)
    ctx.bezierCurveTo(width * 0.3, height * 0.6, width * 0.6, height * 0.7, width, height * 0.6)
    ctx.lineTo(width, height * 0.8)
    ctx.closePath()
    ctx.fillStyle = '#16213e'
    ctx.fill()
    
    ctx.restore()
  }
  
  // 绘制柳枝
  drawWillowBranch(ctx, width, height) {
    ctx.save()
    ctx.globalAlpha = 0.7
    
    // 绘制柳枝
    ctx.beginPath()
    ctx.moveTo(width * 0.1, height * 0.3)
    ctx.lineTo(width * 0.15, height * 0.8)
    ctx.strokeStyle = '#2d5016'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // 绘制柳叶
    for (let i = 0; i < 20; i++) {
      const x = width * 0.1 + i * 15
      const y = height * 0.4 + Math.sin(i * 0.5) * 20
      
      ctx.beginPath()
      ctx.ellipse(x, y, 8, 15, Math.PI / 2, 0, Math.PI * 2)
      ctx.fillStyle = '#3a7d44'
      ctx.fill()
    }
    
    ctx.restore()
  }
  
  // 绘制桃花
  drawPeachBlossom(ctx, width, height) {
    ctx.save()
    ctx.globalAlpha = 0.8
    
    // 绘制桃花
    const positions = [
      { x: width * 0.8, y: height * 0.3 },
      { x: width * 0.85, y: height * 0.25 },
      { x: width * 0.75, y: height * 0.35 }
    ]
    
    positions.forEach(pos => {
      // 绘制花瓣
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i
        const petalX = pos.x + Math.cos(angle) * 20
        const petalY = pos.y + Math.sin(angle) * 20
        
        ctx.beginPath()
        ctx.ellipse(petalX, petalY, 12, 18, angle, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6b6b'
        ctx.fill()
      }
      
      // 绘制花蕊
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#ffd93d'
      ctx.fill()
    })
    
    ctx.restore()
  }
  
  handleTouch(event) {
    const touch = event.touches[0] || event.changedTouches[0]
    const x = touch.clientX
    const y = touch.clientY
    
    switch (this.state) {
      case GAME_CONFIG.GAME_STATE.START:
        this.state = GAME_CONFIG.GAME_STATE.MENU
        break
      case GAME_CONFIG.GAME_STATE.MENU:
        this.uiController.handleMenuTouch(x, y)
        break
      case GAME_CONFIG.GAME_STATE.PLAYING:
        this.memorialSystem.handleTouch(x, y)
        this.uiController.handleGameTouch(x, y)
        break
    }
  }
  
  resume() {
    console.log('Game resumed')
    this.audioManager.resumeBGM()
  }
  
  pause() {
    console.log('Game paused')
    this.audioManager.pauseBGM()
  }
  
  // 切换到寄思模式
  startMemorial(type) {
    this.state = GAME_CONFIG.GAME_STATE.PLAYING
    this.memorialSystem.setMemorialType(type)
  }
  
  // 返回到菜单
  backToMenu() {
    this.state = GAME_CONFIG.GAME_STATE.MENU
  }
  
  // 解锁成就
  unlockAchievement(id) {
    this.achievementSystem.unlockAchievement(id)
  }
  
  // 保存寄思记录
  saveMemorialRecord(record) {
    // 实现保存逻辑
    console.log('Saving memorial record:', record)
  }
  
  // 分享内容
  shareContent() {
    // 生成分享图片
    this.generateShareImage()
    
    // 调用微信分享接口
    wx.shareAppMessage({
      title: '清明寄思',
      imageUrl: 'share.png', // 实际项目中需要替换为生成的图片路径
      success: (res) => {
        console.log('分享成功:', res)
        // 解锁分享成就
        this.unlockAchievement('sharer')
      },
      fail: (err) => {
        console.error('分享失败:', err)
      }
    })
  }
  
  // 生成分享图片
  generateShareImage() {
    // 实现分享图片生成逻辑
    console.log('Generating share image...')
    // 实际项目中可以使用 canvas 生成分享图片
  }
}

module.exports = {
  default: Game
}
