// UI 控制器
const { GAME_CONFIG } = require('./config.js')

class UIController {
  constructor(game) {
    this.game = game
    this.menuButtons = [
      { id: 'kongming', x: 0.25, y: 0.3, width: 0.4, height: 0.15, text: '孔明灯' },
      { id: 'river', x: 0.25, y: 0.5, width: 0.4, height: 0.15, text: '河灯' },
      { id: 'flower', x: 0.25, y: 0.7, width: 0.4, height: 0.15, text: '献花' },
      { id: 'mail', x: 0.25, y: 0.9, width: 0.4, height: 0.15, text: '时空信箱' }
    ]
    this.backButton = { x: 0.1, y: 0.1, width: 0.15, height: 0.08, text: '返回' }
    this.shareButton = { x: 0.8, y: 0.1, width: 0.15, height: 0.08, text: '分享' }
    this.messageInput = { x: 0.2, y: 0.8, width: 0.6, height: 0.1, text: '' }
    this.flowerSelectors = [
      { id: '菊花', x: 0.2, y: 0.7, width: 0.15, height: 0.1, text: '菊花' },
      { id: '百合', x: 0.4, y: 0.7, width: 0.15, height: 0.1, text: '百合' },
      { id: '玫瑰', x: 0.6, y: 0.7, width: 0.15, height: 0.1, text: '玫瑰' },
      { id: '康乃馨', x: 0.8, y: 0.7, width: 0.15, height: 0.1, text: '康乃馨' }
    ]
    this.isTyping = false
  }
  
  update(deltaTime) {
    // UI 更新逻辑
  }
  
  renderMenu() {
    const ctx = this.game.ctx
    const width = this.game.width
    const height = this.game.height
    
    // 绘制背景装饰
    this.drawMenuBackground(ctx, width, height)
    
    // 绘制标题
    ctx.fillStyle = '#ffffff'
    ctx.font = '48px "Ma Shan Zheng", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
    ctx.shadowBlur = 10
    ctx.fillText('清明寄思', width / 2, height * 0.15)
    ctx.shadowBlur = 0
    
    // 绘制副标题
    ctx.font = '20px "Ma Shan Zheng", Arial, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText('选择寄思方式', width / 2, height * 0.22)
    
    // 绘制菜单按钮
    this.menuButtons.forEach((button, index) => {
      const btnX = 0.3 * width
      const btnY = 0.35 + index * 0.15
      const btnWidth = 0.4 * width
      const btnHeight = 0.12 * height
      
      // 绘制水墨风格按钮背景
      this.drawInkButton(ctx, btnX, btnY * height, btnWidth, btnHeight, index)
      
      // 绘制按钮文字
      ctx.fillStyle = '#ffffff'
      ctx.font = '24px "Ma Shan Zheng", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(button.text, btnX + btnWidth / 2, btnY * height + btnHeight / 2)
      
      // 绘制按钮装饰图标
      this.drawButtonIcon(ctx, button.id, btnX + 30, btnY * height + btnHeight / 2)
    })
    
    // 绘制装饰元素
    this.drawMenuDecorations(ctx, width, height)
  }
  
  // 绘制菜单背景
  drawMenuBackground(ctx, width, height) {
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#0a0a1a')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // 绘制水墨纹理
    ctx.save()
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 200 + 100, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
    ctx.restore()
  }
  
  // 绘制水墨风格按钮
  drawInkButton(ctx, x, y, width, height, index) {
    ctx.save()
    
    // 绘制按钮背景
    const gradient = ctx.createLinearGradient(x, y, x, y + height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, width, height)
    
    // 绘制水墨边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    // 添加水墨效果
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    ctx.moveTo(x, y + height / 2)
    ctx.bezierCurveTo(x + width / 4, y, x + width * 3 / 4, y + height, x + width, y + height / 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    ctx.restore()
  }
  
  // 绘制按钮图标
  drawButtonIcon(ctx, type, x, y) {
    ctx.save()
    ctx.globalAlpha = 0.8
    
    switch (type) {
      case 'kongming':
        // 绘制孔明灯图标
        ctx.beginPath()
        ctx.moveTo(x, y - 15)
        ctx.lineTo(x + 20, y + 5)
        ctx.lineTo(x - 20, y + 5)
        ctx.closePath()
        ctx.fillStyle = '#ffd93d'
        ctx.fill()
        break
      case 'river':
        // 绘制河灯图标
        ctx.beginPath()
        ctx.arc(x, y, 15, 0, Math.PI * 2)
        ctx.fillStyle = '#3498db'
        ctx.fill()
        break
      case 'flower':
        // 绘制花朵图标
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 / 5) * i
          const petalX = x + Math.cos(angle) * 10
          const petalY = y + Math.sin(angle) * 10
          ctx.beginPath()
          ctx.ellipse(petalX, petalY, 5, 8, angle, 0, Math.PI * 2)
          ctx.fillStyle = '#ff6b6b'
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#ffd93d'
        ctx.fill()
        break
      case 'mail':
        // 绘制信箱图标
        ctx.beginPath()
        ctx.moveTo(x - 15, y - 10)
        ctx.lineTo(x + 15, y - 10)
        ctx.lineTo(x + 10, y + 10)
        ctx.lineTo(x - 10, y + 10)
        ctx.closePath()
        ctx.fillStyle = '#9b59b6'
        ctx.fill()
        break
    }
    
    ctx.restore()
  }
  
  // 绘制菜单装饰
  drawMenuDecorations(ctx, width, height) {
    ctx.save()
    
    // 绘制竹叶
    this.drawBambooLeaves(ctx, width * 0.1, height * 0.3)
    this.drawBambooLeaves(ctx, width * 0.9, height * 0.7)
    
    // 绘制梅花
    this.drawPlumBlossom(ctx, width * 0.15, height * 0.8)
    this.drawPlumBlossom(ctx, width * 0.85, height * 0.2)
    
    ctx.restore()
  }
  
  // 绘制竹叶
  drawBambooLeaves(ctx, x, y) {
    ctx.save()
    ctx.globalAlpha = 0.6
    
    // 绘制竹茎
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y + 100)
    ctx.strokeStyle = '#2d5016'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // 绘制竹叶
    for (let i = 0; i < 10; i++) {
      const leafX = x + (i % 2 === 0 ? -30 : 30)
      const leafY = y + i * 10
      
      ctx.beginPath()
      ctx.moveTo(x, leafY)
      ctx.lineTo(leafX, leafY - 10)
      ctx.lineTo(leafX, leafY + 10)
      ctx.closePath()
      ctx.fillStyle = '#3a7d44'
      ctx.fill()
    }
    
    ctx.restore()
  }
  
  // 绘制梅花
  drawPlumBlossom(ctx, x, y) {
    ctx.save()
    ctx.globalAlpha = 0.7
    
    // 绘制梅花
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i
      const petalX = x + Math.cos(angle) * 15
      const petalY = y + Math.sin(angle) * 15
      
      ctx.beginPath()
      ctx.ellipse(petalX, petalY, 8, 12, angle, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
    }
    
    // 绘制花蕊
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#ffd93d'
    ctx.fill()
    
    ctx.restore()
  }
  
  renderGame() {
    const ctx = this.game.ctx
    const width = this.game.width
    const height = this.game.height
    
    // 绘制返回按钮
    const backX = this.backButton.x * width
    const backY = this.backButton.y * height
    const backWidth = this.backButton.width * width
    const backHeight = this.backButton.height * height
    
    // 水墨风格按钮
    this.drawInkButton(ctx, backX, backY, backWidth, backHeight)
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px "Ma Shan Zheng", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.backButton.text, backX + backWidth / 2, backY + backHeight / 2)
    
    // 绘制分享按钮
    const shareX = this.shareButton.x * width
    const shareY = this.shareButton.y * height
    const shareWidth = this.shareButton.width * width
    const shareHeight = this.shareButton.height * height
    
    // 水墨风格按钮
    this.drawInkButton(ctx, shareX, shareY, shareWidth, shareHeight)
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px "Ma Shan Zheng", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.shareButton.text, shareX + shareWidth / 2, shareY + shareHeight / 2)
    
    // 绘制消息输入框
    if (this.game.memorialSystem.memorialType !== GAME_CONFIG.MEMORIAL_TYPES.FLOWER) {
      const inputX = this.messageInput.x * width
      const inputY = this.messageInput.y * height
      const inputWidth = this.messageInput.width * width
      const inputHeight = this.messageInput.height * height
      
      // 水墨风格输入框
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(inputX, inputY, inputWidth, inputHeight)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 2
      ctx.strokeRect(inputX, inputY, inputWidth, inputHeight)
      
      // 添加水墨效果
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.moveTo(inputX, inputY + inputHeight / 2)
      ctx.bezierCurveTo(inputX + inputWidth / 4, inputY, inputX + inputWidth * 3 / 4, inputY + inputHeight, inputX + inputWidth, inputY + inputHeight / 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.globalAlpha = 1
      
      // 绘制文字
      ctx.fillStyle = '#ffffff'
      ctx.font = '16px "Ma Shan Zheng", Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.game.memorialSystem.message || '输入思念的话语...', inputX + 15, inputY + inputHeight / 2)
    }
    
    // 绘制花朵选择器
    if (this.game.memorialSystem.memorialType === GAME_CONFIG.MEMORIAL_TYPES.FLOWER) {
      this.flowerSelectors.forEach(selector => {
        const selX = selector.x * width
        const selY = selector.y * height
        const selWidth = selector.width * width
        const selHeight = selector.height * height
        
        // 水墨风格选择器
        ctx.fillStyle = this.game.memorialSystem.flowerType === selector.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
        ctx.fillRect(selX, selY, selWidth, selHeight)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 2
        ctx.strokeRect(selX, selY, selWidth, selHeight)
        
        // 添加水墨效果
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.moveTo(selX, selY + selHeight / 2)
        ctx.bezierCurveTo(selX + selWidth / 4, selY, selX + selWidth * 3 / 4, selY + selHeight, selX + selWidth, selY + selHeight / 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.globalAlpha = 1
        
        // 绘制选择器文字
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px "Ma Shan Zheng", Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(selector.text, selX + selWidth / 2, selY + selHeight / 2)
      })
    }
  }
  
  handleMenuTouch(x, y) {
    const width = this.game.width
    const height = this.game.height
    
    // 检查菜单按钮点击
    this.menuButtons.forEach((button, index) => {
      const btnX = 0.3 * width
      const btnY = 0.35 + index * 0.15
      const btnWidth = 0.4 * width
      const btnHeight = 0.12 * height
      
      if (x >= btnX && x <= btnX + btnWidth && y >= btnY * height && y <= btnY * height + btnHeight) {
        switch (button.id) {
          case 'kongming':
            this.game.startMemorial(GAME_CONFIG.MEMORIAL_TYPES.KONGMING)
            break
          case 'river':
            this.game.startMemorial(GAME_CONFIG.MEMORIAL_TYPES.RIVER)
            break
          case 'flower':
            this.game.startMemorial(GAME_CONFIG.MEMORIAL_TYPES.FLOWER)
            break
          case 'mail':
            this.game.startMemorial(GAME_CONFIG.MEMORIAL_TYPES.MAIL)
            break
        }
        return
      }
    })
  }
  
  handleGameTouch(x, y) {
    const width = this.game.width
    const height = this.game.height
    
    // 检查返回按钮点击
    const backX = this.backButton.x * width
    const backY = this.backButton.y * height
    const backWidth = this.backButton.width * width
    const backHeight = this.backButton.height * height
    
    if (x >= backX && x <= backX + backWidth && y >= backY && y <= backY + backHeight) {
      this.game.backToMenu()
      return
    }
    
    // 检查分享按钮点击
    const shareX = this.shareButton.x * width
    const shareY = this.shareButton.y * height
    const shareWidth = this.shareButton.width * width
    const shareHeight = this.shareButton.height * height
    
    if (x >= shareX && x <= shareX + shareWidth && y >= shareY && y <= shareY + shareHeight) {
      this.game.shareContent()
      return
    }
    
    // 检查消息输入框点击
    if (this.game.memorialSystem.memorialType !== GAME_CONFIG.MEMORIAL_TYPES.FLOWER) {
      const inputX = this.messageInput.x * width
      const inputY = this.messageInput.y * height
      const inputWidth = this.messageInput.width * width
      const inputHeight = this.messageInput.height * height
      
      if (x >= inputX && x <= inputX + inputWidth && y >= inputY && y <= inputY + inputHeight) {
        // 这里应该触发输入框，在实际微信小程序中使用 wx.createSelectorQuery 等 API
        this.isTyping = true
        // 模拟输入
        this.game.memorialSystem.setMessage('思念无尽，寄情于天')
        return
      }
    }
    
    // 检查花朵选择器点击
    if (this.game.memorialSystem.memorialType === GAME_CONFIG.MEMORIAL_TYPES.FLOWER) {
      for (const selector of this.flowerSelectors) {
        const selX = selector.x * width
        const selY = selector.y * height
        const selWidth = selector.width * width
        const selHeight = selector.height * height
        
        if (x >= selX && x <= selX + selWidth && y >= selY && y <= selY + selHeight) {
          this.game.memorialSystem.setFlowerType(selector.id)
          return
        }
      }
    }
  }
}

module.exports = {
  default: UIController
}
