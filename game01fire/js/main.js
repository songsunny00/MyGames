/**
 * 游戏主模块
 * 整合所有模块，管理游戏主循环
 */

import StarBackground from './starBg.js'
import ParticlePool from './particle.js'
import FireworkManager from './firework.js'
import Controller from './controller.js'
import AudioManager from './audio.js'
import ShareManager from './share.js'
import { PARTICLE_MAX_COUNT } from './config.js'

export default class Main {
  constructor(options) {
    // 画布相关
    this.canvas = options.canvas
    this.ctx = options.ctx
    this.width = options.width
    this.height = options.height
    
    // 时间
    this.time = 0
    
    // 初始化各模块
    this.init()
  }

  /**
   * 初始化
   */
  init() {
    // 粒子池
    this.particlePool = new ParticlePool(PARTICLE_MAX_COUNT)
    
    // 星空背景
    this.starBg = new StarBackground({
      width: this.width,
      height: this.height
    })
    
    // 烟花管理器
    this.fireworkManager = new FireworkManager({
      width: this.width,
      height: this.height,
      particlePool: this.particlePool
    })
    
    // 音效管理器
    this.audioManager = new AudioManager()
    
    // 分享管理器
    this.shareManager = new ShareManager({
      canvas: this.canvas,
      width: this.width,
      height: this.height
    })
    
    // 交互控制器
    this.controller = new Controller({
      width: this.width,
      height: this.height,
      onLaunch: (options) => this.launchFirework(options)
    })
    
    // 设置烟花爆炸回调
    this.fireworkManager.onExplode = (type) => {
      this.audioManager.playExplodeSound(type)
    }
    
    // 开始播放背景音乐
    this.audioManager.playBGM()
    
    // 初始烟花展示
    setTimeout(() => {
      this.launchFirework({ x: this.width / 2, targetY: this.height * 0.3 })
    }, 500)
  }

  /**
   * 发射烟花
   */
  launchFirework(options) {
    this.fireworkManager.launch(options)
    this.audioManager.playLaunchSound()
  }

  /**
   * 更新
   */
  update(deltaTime) {
    this.time += deltaTime
    
    // 更新星空背景
    this.starBg.update(deltaTime)
    
    // 更新交互控制器
    this.controller.update(this.time)
    
    // 更新烟花
    this.fireworkManager.update()
    
    // 更新粒子
    this.particlePool.update()
  }

  /**
   * 渲染
   */
  render() {
    const ctx = this.ctx
    
    // 清空画布
    ctx.clearRect(0, 0, this.width, this.height)
    
    // 渲染星空背景
    this.starBg.render(ctx)
    
    // 渲染粒子
    this.particlePool.render(ctx)
    
    // 渲染烟花
    this.fireworkManager.render(ctx)
    
    // 渲染分享按钮
    this.shareManager.renderButton(ctx)
  }

  /**
   * 销毁
   */
  destroy() {
    this.controller.destroy()
    this.audioManager.destroy()
  }
}
