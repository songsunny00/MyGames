// 惩罚系统
// 管理掉楼惩罚和班味惩罚状态
const { CONFIG } = require('../config.js')

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

class PunishmentSystem {
  constructor() {
    this._bombShareFailCount = this._loadShareFailCount()
  }

  // 根据当前楼层计算掉落楼层数
  fallFloors(currentFloor) {
    if (currentFloor > 250) return CONFIG.FALL_FLOORS_HIGH
    if (currentFloor > 100) return CONFIG.FALL_FLOORS_MID
    return CONFIG.FALL_FLOORS_LOW
  }

  // 随机选择惩罚类型（掉楼 or 班味）
  randomPunishmentType() {
    return Math.random() < 0.5 ? 'fall' : 'banwei'
  }

  // 炸弹惩罚类型（直接重来 or 分享免死）
  randomBombPunishment() {
    // 如果累计分享失败达到保底次数，直接免除
    if (this._bombShareFailCount >= CONFIG.BOMB_SHARE_MAX_FAILS) {
      this._bombShareFailCount = 0
      this._saveShareFailCount()
      return 'pardon'
    }
    return Math.random() < 0.5 ? 'restart' : 'share'
  }

  // 分享失败计数
  recordShareFail() {
    this._bombShareFailCount++
    this._saveShareFailCount()
    if (this._bombShareFailCount >= CONFIG.BOMB_SHARE_MAX_FAILS) {
      return true  // 达到保底
    }
    return false
  }

  // 分享成功重置
  resetShareFail() {
    this._bombShareFailCount = 0
    this._saveShareFailCount()
  }

  get shareFailCount() {
    return this._bombShareFailCount
  }

  // 随机安慰文字
  randomFallText() {
    return randomItem(CONFIG.FALL_TEXTS)
  }

  // 随机班味嘲讽文字
  randomBanweiText() {
    return randomItem(CONFIG.BANWEI_TEXTS)
  }

  // 随机鼓励文字
  randomEncourageText() {
    return randomItem(CONFIG.ENCOURAGE_TEXTS)
  }

  // 随机终局祝福
  randomEndingText() {
    return randomItem(CONFIG.ENDING_TEXTS)
  }

  _loadShareFailCount() {
    try {
      if (typeof wx !== 'undefined') {
        const val = wx.getStorageSync('bombShareFailCount')
        return val ? parseInt(val, 10) : 0
      }
    } catch (e) {}
    return 0
  }

  _saveShareFailCount() {
    try {
      if (typeof wx !== 'undefined') {
        wx.setStorageSync('bombShareFailCount', String(this._bombShareFailCount))
      }
    } catch (e) {}
  }
}

module.exports = { PunishmentSystem }
