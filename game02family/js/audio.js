// 音频管理系统
const { GAME_CONFIG } = require('./config.js')

class AudioManager {
  constructor(game) {
    this.game = game
    this.bgm = null
    this.effects = {}
    this.isMuted = false
    this.init()
  }
  
  init() {
    // 初始化音频
    this.loadAudio()
  }
  
  loadAudio() {
    // 检测是否在微信小程序环境中
    const isWechat = typeof wx !== 'undefined'
    
    if (isWechat) {
      // 加载背景音乐
      this.bgm = wx.createInnerAudioContext()
      this.bgm.src = 'audio/bgm.mp3'
      this.bgm.loop = true
      this.bgm.volume = GAME_CONFIG.AUDIO.BGM_VOLUME
      
      // 加载音效
      this.effects.launch = wx.createInnerAudioContext()
      this.effects.launch.src = 'audio/launch.mp3'
      this.effects.launch.volume = GAME_CONFIG.AUDIO.EFFECT_VOLUME
      
      this.effects.explode = wx.createInnerAudioContext()
      this.effects.explode.src = 'audio/explode.mp3'
      this.effects.explode.volume = GAME_CONFIG.AUDIO.EFFECT_VOLUME
    } else {
      // 在非微信环境中，使用空对象模拟
      console.log('Running in non-wechat environment, audio disabled')
      this.bgm = null
      this.effects = {}
    }
  }
  
  playBGM() {
    if (!this.isMuted && this.bgm) {
      this.bgm.play().catch(err => {
        console.error('Failed to play BGM:', err)
      })
    }
  }
  
  pauseBGM() {
    if (this.bgm) {
      this.bgm.pause()
    }
  }
  
  resumeBGM() {
    if (!this.isMuted && this.bgm) {
      this.bgm.play().catch(err => {
        console.error('Failed to resume BGM:', err)
      })
    }
  }
  
  playEffect(name) {
    if (!this.isMuted && this.effects[name]) {
      this.effects[name].play().catch(err => {
        console.error(`Failed to play effect ${name}:`, err)
      })
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.pauseBGM()
    } else {
      this.playBGM()
    }
  }
  
  setVolume(volume) {
    if (this.bgm) {
      this.bgm.volume = volume * GAME_CONFIG.AUDIO.BGM_VOLUME
    }
    for (const key in this.effects) {
      if (this.effects[key]) {
        this.effects[key].volume = volume * GAME_CONFIG.AUDIO.EFFECT_VOLUME
      }
    }
  }
}

module.exports = {
  default: AudioManager
}
