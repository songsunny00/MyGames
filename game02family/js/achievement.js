// 成就系统
const { GAME_CONFIG } = require('./config.js')

class AchievementSystem {
  constructor(game) {
    this.game = game
    this.achievements = {}
    this.init()
  }
  
  init() {
    // 初始化成就系统
    this.loadAchievements()
  }
  
  loadAchievements() {
    // 检测是否在微信小程序环境中
    const isWechat = typeof wx !== 'undefined'
    
    if (isWechat) {
      try {
        const savedAchievements = wx.getStorageSync('achievements')
        if (savedAchievements) {
          this.achievements = savedAchievements
        } else {
          // 初始化所有成就为未解锁状态
          GAME_CONFIG.ACHIEVEMENT.TYPES.forEach(achievement => {
            this.achievements[achievement.id] = {
              unlocked: false,
              timestamp: null
            }
          })
          this.saveAchievements()
        }
      } catch (err) {
        console.error('Failed to load achievements:', err)
        // 初始化默认成就
        GAME_CONFIG.ACHIEVEMENT.TYPES.forEach(achievement => {
          this.achievements[achievement.id] = {
            unlocked: false,
            timestamp: null
          }
        })
      }
    } else {
      // 在非微信环境中，初始化默认成就
      console.log('Running in non-wechat environment, using in-memory achievements')
      GAME_CONFIG.ACHIEVEMENT.TYPES.forEach(achievement => {
        this.achievements[achievement.id] = {
          unlocked: false,
          timestamp: null
        }
      })
    }
  }
  
  saveAchievements() {
    // 检测是否在微信小程序环境中
    const isWechat = typeof wx !== 'undefined'
    
    if (isWechat) {
      try {
        wx.setStorageSync('achievements', this.achievements)
      } catch (err) {
        console.error('Failed to save achievements:', err)
      }
    }
  }
  
  unlockAchievement(id) {
    if (!this.achievements[id] || this.achievements[id].unlocked) {
      return
    }
    
    this.achievements[id] = {
      unlocked: true,
      timestamp: Date.now()
    }
    
    this.saveAchievements()
    this.showAchievementNotification(id)
    
    // 检查是否解锁了所有寄思方式
    this.checkMemorialMaster()
  }
  
  checkMemorialMaster() {
    const memorialTypes = [
      'first_kongming',
      'first_river',
      'first_flower',
      'first_mail'
    ]
    
    const allUnlocked = memorialTypes.every(type => {
      return this.achievements[type] && this.achievements[type].unlocked
    })
    
    if (allUnlocked) {
      this.unlockAchievement('memorial_master')
    }
  }
  
  showAchievementNotification(id) {
    // 检测是否在微信小程序环境中
    const isWechat = typeof wx !== 'undefined'
    
    const achievement = GAME_CONFIG.ACHIEVEMENT.TYPES.find(a => a.id === id)
    if (achievement) {
      if (isWechat) {
        wx.showToast({
          title: `成就解锁: ${achievement.name}`,
          icon: 'success',
          duration: 2000
        })
      } else {
        console.log(`成就解锁: ${achievement.name}`)
      }
    }
  }
  
  getUnlockedAchievements() {
    return GAME_CONFIG.ACHIEVEMENT.TYPES.filter(achievement => {
      return this.achievements[achievement.id] && this.achievements[achievement.id].unlocked
    })
  }
  
  getLockedAchievements() {
    return GAME_CONFIG.ACHIEVEMENT.TYPES.filter(achievement => {
      return !this.achievements[achievement.id] || !this.achievements[achievement.id].unlocked
    })
  }
  
  resetAchievements() {
    GAME_CONFIG.ACHIEVEMENT.TYPES.forEach(achievement => {
      this.achievements[achievement.id] = {
        unlocked: false,
        timestamp: null
      }
    })
    this.saveAchievements()
  }
}

module.exports = {
  default: AchievementSystem
}
