/**
 * 音效管理模块
 * 管理背景音乐和音效播放
 */

import { FIREWORK_TYPES } from './config.js'

export default class AudioManager {
  constructor() {
    this.muted = false
    this.bgmPlaying = false
    
    // 音频实例
    this.bgm = null
    this.launchSound = null
    this.explodeSounds = {}
    
    // 初始化音频
    this.init()
  }

  /**
   * 初始化音频
   */
  init() {
    try {
      // 背景音乐
      this.bgm = wx.createInnerAudioContext()
      this.bgm.src = 'audio/bgm.mp3'
      this.bgm.loop = true
      this.bgm.volume = 0.3
      
      // 点火音效
      this.launchSound = wx.createInnerAudioContext()
      this.launchSound.src = 'audio/launch.mp3'
      this.launchSound.volume = 0.5
      
      // 爆炸音效
      this.explodeSounds = {
        [FIREWORK_TYPES.SPHERE]: this.createExplodeSound('audio/explode.mp3', 0.6),
        [FIREWORK_TYPES.HEART]: this.createExplodeSound('audio/explode.mp3', 0.5),
        [FIREWORK_TYPES.DOUBLE]: this.createExplodeSound('audio/explode.mp3', 0.7),
        [FIREWORK_TYPES.WATERCOLOR]: this.createExplodeSound('audio/explode.mp3', 0.4)
      }
      
      // 监听背景音乐结束事件
      this.bgm.onEnded(() => {
        this.bgmPlaying = false
      })
      
      // 监听错误
      this.bgm.onError((err) => {
        console.log('背景音乐加载失败:', err)
      })
      
    } catch (e) {
      console.log('音频初始化失败:', e)
    }
  }

  /**
   * 创建爆炸音效实例
   */
  createExplodeSound(src, volume) {
    const sound = wx.createInnerAudioContext()
    sound.src = src
    sound.volume = volume
    return sound
  }

  /**
   * 播放背景音乐
   */
  playBGM() {
    if (this.muted || this.bgmPlaying) return
    
    try {
      this.bgm.play()
      this.bgmPlaying = true
    } catch (e) {
      console.log('播放背景音乐失败:', e)
    }
  }

  /**
   * 暂停背景音乐
   */
  pauseBGM() {
    if (!this.bgmPlaying) return
    
    try {
      this.bgm.pause()
      this.bgmPlaying = false
    } catch (e) {
      console.log('暂停背景音乐失败:', e)
    }
  }

  /**
   * 播放点火音效
   */
  playLaunchSound() {
    if (this.muted) return
    
    try {
      // 重置播放位置
      this.launchSound.stop()
      this.launchSound.play()
    } catch (e) {
      console.log('播放点火音效失败:', e)
    }
  }

  /**
   * 播放爆炸音效
   */
  playExplodeSound(type) {
    if (this.muted) return
    
    const sound = this.explodeSounds[type]
    if (sound) {
      try {
        sound.stop()
        sound.play()
      } catch (e) {
        console.log('播放爆炸音效失败:', e)
      }
    }
  }

  /**
   * 切换静音
   */
  toggleMute() {
    this.muted = !this.muted
    
    if (this.muted) {
      this.pauseBGM()
    } else {
      this.playBGM()
    }
    
    return this.muted
  }

  /**
   * 设置音量
   */
  setVolume(volume) {
    const v = Math.max(0, Math.min(1, volume))
    
    if (this.bgm) {
      this.bgm.volume = v * 0.3
    }
    if (this.launchSound) {
      this.launchSound.volume = v * 0.5
    }
    Object.values(this.explodeSounds).forEach(sound => {
      if (sound) {
        sound.volume = v * 0.6
      }
    })
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.bgm) {
      this.bgm.stop()
      this.bgm.destroy()
    }
    if (this.launchSound) {
      this.launchSound.stop()
      this.launchSound.destroy()
    }
    Object.values(this.explodeSounds).forEach(sound => {
      if (sound) {
        sound.stop()
        sound.destroy()
      }
    })
  }
}
