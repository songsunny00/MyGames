/**
 * 解锁管理模块
 * 处理烟花类型的解锁逻辑
 */

import { FIREWORK_UNLOCK } from './config.js'

// 存储 key
const STORAGE_KEY = 'firework_unlock_status'

class UnlockManager {
  constructor() {
    // 从本地存储加载解锁状态
    this.unlockStatus = this.loadUnlockStatus()
  }

  /**
   * 从本地存储加载解锁状态
   */
  loadUnlockStatus() {
    try {
      const saved = wx.getStorageSync(STORAGE_KEY)
      if (saved) {
        // 合并保存的状态和默认状态
        return { ...FIREWORK_UNLOCK, ...saved }
      }
    } catch (e) {
      console.log('加载解锁状态失败:', e)
    }
    return { ...FIREWORK_UNLOCK }
  }

  /**
   * 保存解锁状态到本地存储
   */
  saveUnlockStatus() {
    try {
      const toSave = {}
      Object.keys(this.unlockStatus).forEach(key => {
        toSave[key] = { ...this.unlockStatus[key] }
      })
      wx.setStorageSync(STORAGE_KEY, toSave)
    } catch (e) {
      console.log('保存解锁状态失败:', e)
    }
  }

  /**
   * 检查烟花类型是否已解锁
   */
  isUnlocked(type) {
    const status = this.unlockStatus[type]
    return status ? status.unlocked : false
  }

  /**
   * 检查烟花类型是否需要解锁
   */
  requiresUnlock(type) {
    const status = this.unlockStatus[type]
    return status ? status.requiresUnlock : false
  }

  /**
   * 解锁烟花类型
   */
  unlock(type) {
    if (this.unlockStatus[type]) {
      this.unlockStatus[type].unlocked = true
      this.saveUnlockStatus()
      return true
    }
    return false
  }

  /**
   * 通过观看广告解锁
   */
  unlockByAd(type) {
    return new Promise((resolve, reject) => {
      // 创建激励视频广告
      let rewardedVideoAd = null
      
      try {
        rewardedVideoAd = wx.createRewardedVideoAd({
          adUnitId: 'adunit-xxx' // 需要替换为实际的广告单元ID
        })
        
        rewardedVideoAd.onClose((res) => {
          // 用户完整观看了广告
          if (res && res.isEnded) {
            this.unlock(type)
            resolve({ success: true, type })
          } else {
            // 用户未完整观看
            wx.showToast({
              title: '观看完整广告才能解锁',
              icon: 'none'
            })
            resolve({ success: false, reason: 'not_ended' })
          }
        })
        
        rewardedVideoAd.onError((err) => {
          console.log('广告加载失败:', err)
          // 广告加载失败时，直接解锁（开发阶段）
          this.unlock(type)
          resolve({ success: true, type, fallback: true })
        })
        
        rewardedVideoAd.show().catch(() => {
          // 失败重试
          rewardedVideoAd.load().then(() => rewardedVideoAd.show())
        })
        
      } catch (e) {
        console.log('创建广告失败:', e)
        // 开发阶段直接解锁
        this.unlock(type)
        resolve({ success: true, type, fallback: true })
      }
    })
  }

  /**
   * 通过分享解锁
   */
  unlockByShare(type) {
    return new Promise((resolve, reject) => {
      wx.shareAppMessage({
        title: '我在星空下放烟花，好美！快来试试吧~',
        imageUrl: '', // 分享图片
        success: () => {
          this.unlock(type)
          resolve({ success: true, type })
        },
        fail: (err) => {
          console.log('分享失败:', err)
          // 开发阶段直接解锁
          this.unlock(type)
          resolve({ success: true, type, fallback: true })
        }
      })
    })
  }

  /**
   * 获取所有解锁状态
   */
  getAllUnlockStatus() {
    return { ...this.unlockStatus }
  }

  /**
   * 获取已解锁的类型列表
   */
  getUnlockedTypes() {
    return Object.keys(this.unlockStatus).filter(
      type => this.unlockStatus[type].unlocked
    )
  }

  /**
   * 获取需要解锁的类型列表
   */
  getLockedTypes() {
    return Object.keys(this.unlockStatus).filter(
      type => this.unlockStatus[type].requiresUnlock && !this.unlockStatus[type].unlocked
    )
  }

  /**
   * 重置所有解锁状态（用于测试）
   */
  resetAll() {
    this.unlockStatus = { ...FIREWORK_UNLOCK }
    try {
      wx.removeStorageSync(STORAGE_KEY)
    } catch (e) {
      console.log('清除存储失败:', e)
    }
  }
}

// 单例
let instance = null

export function getUnlockManager() {
  if (!instance) {
    instance = new UnlockManager()
  }
  return instance
}

export default UnlockManager
