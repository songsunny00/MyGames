/**
 * 截图分享模块
 * 实现截图保存和分享功能
 */

export default class ShareManager {
  constructor({ canvas, width, height }) {
    this.canvas = canvas
    this.width = width
    this.height = height
    this.shareButtonVisible = true
    
    // 分享按钮位置
    this.buttonX = width - 50
    this.buttonY = height - 50
    this.buttonRadius = 25
  }

  /**
   * 检测是否点击了分享按钮
   */
  isShareButtonTouched(x, y) {
    const dx = x - this.buttonX
    const dy = y - this.buttonY
    return Math.sqrt(dx * dx + dy * dy) <= this.buttonRadius
  }

  /**
   * 渲染分享按钮
   */
  renderButton(ctx) {
    if (!this.shareButtonVisible) return
    
    ctx.save()
    
    // 按钮背景
    ctx.globalAlpha = 0.7
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(this.buttonX, this.buttonY, this.buttonRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // 分享图标（简化的分享符号）
    ctx.globalAlpha = 1
    ctx.strokeStyle = '#6B5BFF'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // 绘制分享图标
    const iconSize = 12
    const cx = this.buttonX
    const cy = this.buttonY
    
    // 三个圆点
    ctx.beginPath()
    ctx.arc(cx - iconSize * 0.7, cy, 3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(cx + iconSize * 0.7, cy - iconSize * 0.5, 3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(cx + iconSize * 0.7, cy + iconSize * 0.5, 3, 0, Math.PI * 2)
    ctx.fill()
    
    // 连接线
    ctx.beginPath()
    ctx.moveTo(cx - iconSize * 0.5, cy)
    ctx.lineTo(cx + iconSize * 0.5, cy - iconSize * 0.4)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(cx - iconSize * 0.5, cy)
    ctx.lineTo(cx + iconSize * 0.5, cy + iconSize * 0.4)
    ctx.stroke()
    
    ctx.restore()
  }

  /**
   * 截图并分享
   */
  async share() {
    try {
      // 显示加载提示
      wx.showLoading({
        title: '生成图片中...',
        mask: true
      })
      
      // 创建临时画布用于截图
      const tempCanvas = wx.createOffscreenCanvas({
        type: '2d',
        width: this.width,
        height: this.height
      })
      const tempCtx = tempCanvas.getContext('2d')
      
      // 复制当前画布内容
      tempCtx.drawImage(this.canvas, 0, 0, this.width, this.height)
      
      // 添加水印
      this.addWatermark(tempCtx)
      
      // 生成图片
      const tempFilePath = await this.canvasToTempFile(tempCanvas)
      
      wx.hideLoading()
      
      // 分享
      this.showShareMenu(tempFilePath)
      
    } catch (e) {
      wx.hideLoading()
      console.log('分享失败:', e)
      wx.showToast({
        title: '分享失败',
        icon: 'none'
      })
    }
  }

  /**
   * 添加水印
   */
  addWatermark(ctx) {
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('星空烟花', this.width / 2, this.height - 20)
    ctx.restore()
  }

  /**
   * Canvas 转临时文件
   */
  canvasToTempFile(canvas) {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas: canvas,
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        destWidth: this.width * 2,
        destHeight: this.height * 2,
        fileType: 'png',
        quality: 1,
        success: (res) => {
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 显示分享菜单
   */
  showShareMenu(imagePath) {
    // 保存到相册选项
    wx.showActionSheet({
      itemList: ['保存到相册', '分享给好友'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.saveToAlbum(imagePath)
            break
          case 1:
            this.shareToFriend(imagePath)
            break
        }
      }
    })
  }

  /**
   * 保存到相册
   */
  async saveToAlbum(imagePath) {
    try {
      await wx.saveImageToPhotosAlbum({
        filePath: imagePath
      })
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
    } catch (e) {
      if (e.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '提示',
          content: '需要授权保存图片权限',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }
  }

  /**
   * 分享给好友
   */
  shareToFriend(imagePath) {
    // 微信小游戏的分享需要通过按钮触发
    // 这里设置分享信息
    wx.shareAppMessage({
      title: '我在星空下放烟花，好美！',
      imageUrl: imagePath,
      query: ''
    })
  }

  /**
   * 设置分享按钮可见性
   */
  setButtonVisible(visible) {
    this.shareButtonVisible = visible
  }
}
