// 游戏主逻辑（状态机）
// Main负责顶层状态（START / PLAYING / END）
// GameScene内部处理 QUIZ / BOMB_MODAL / PUNISHMENT / BANWEI 等游戏内状态
const { CONFIG } = require('./config.js')
const { InputSystem } = require('./systems/InputSystem.js')
const { StartScene } = require('./scenes/StartScene.js')
const { GameScene } = require('./scenes/GameScene.js')
const { EndScene } = require('./scenes/EndScene.js')
const { PunishmentSystem } = require('./systems/PunishmentSystem.js')

const isWechat = typeof wx !== 'undefined'

class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx

    // 缩放比（canvas物理像素 → 设计分辨率750×1334）
    this.dprX = canvas.width / CONFIG.W
    this.dprY = canvas.height / CONFIG.H

    // 顶层状态：START | PLAYING | END
    this.state = CONFIG.STATE.START

    // 通关周目（0=第一次，1=第二次，2=第三次及以后）
    this._completionRound = 0

    // 系统
    this.input = new InputSystem()
    this.input.setCanvas(canvas)
    this.punishSystem = new PunishmentSystem()

    // 场景
    this.startScene = new StartScene()
    this.gameScene = new GameScene((event) => this._onGameEvent(event))
    this.endScene = new EndScene()

    this._paused = false
  }

  init() {
    console.log('Game "Going Up" initialized | canvas:', this.canvas.width, 'x', this.canvas.height)
  }

  // 微信切后台
  pause() { this._paused = true }
  resume() { this._paused = false }

  // ── 每帧更新 ──
  update(dt) {
    if (this._paused) return

    switch (this.state) {
      case CONFIG.STATE.START:
        this.startScene.update(dt)
        this._checkStartTaps()
        break

      case CONFIG.STATE.PLAYING:
        this.gameScene.update(dt, this.input)
        // 通关检测
        if (this.gameScene.getCurrentFloor() >= CONFIG.MAX_FLOOR) {
          this._onWin()
        }
        break

      case CONFIG.STATE.END:
        this.endScene.update(dt)
        this._checkEndTaps()
        break
    }
  }

  // ── 每帧渲染 ──
  render() {
    const ctx = this.ctx
    ctx.save()
    ctx.scale(this.dprX, this.dprY)
    ctx.clearRect(0, 0, CONFIG.W, CONFIG.H)

    switch (this.state) {
      case CONFIG.STATE.START:
        this.startScene.render(ctx)
        break

      case CONFIG.STATE.PLAYING:
        this.gameScene.render(ctx)
        break

      case CONFIG.STATE.END:
        this.endScene.render(ctx)
        break
    }

    ctx.restore()
  }

  // ── 开始界面点击 ──
  _checkStartTaps() {
    const hits = this.input.consumeTaps(this.startScene.getClickAreas())
    for (const hit of hits) {
      const result = this.startScene.handleTap(hit)
      if (result === 'start') this._startGame()
    }
  }

  // ── 终局界面点击 ──
  _checkEndTaps() {
    const hits = this.input.consumeTaps(this.endScene.getClickAreas())
    if (hits.includes('replay')) {
      this._startGame()
    } else if (hits.includes('share')) {
      this._shareGame()
    }
  }

  // ── 开始/重新开始游戏 ──
  _startGame() {
    this.gameScene.init(this._completionRound)
    this.state = CONFIG.STATE.PLAYING
  }

  // ── 通关 ──
  _onWin() {
    this._completionRound = Math.min(this._completionRound + 1, 3)
    const blessText = this.punishSystem.randomEndingText()
    this.endScene.show(CONFIG.MAX_FLOOR, blessText, () => {})
    this.state = CONFIG.STATE.END
  }

  // ── GameScene事件回调 ──
  _onGameEvent(event) {
    switch (event.type) {
      case 'bombRestart':
        // 炸弹惩罚：重新开始（不改变周目）
        this._startGame()
        break

      case 'win':
        this._onWin()
        break
    }
  }

  // ── 分享 ──
  _shareGame() {
    if (isWechat) {
      wx.shareAppMessage({
        title: `我在《爬楼》中成功逃离了365天的班味！快来挑战！`,
        imageUrl: '',
      })
    }
  }
}

module.exports = { default: Game }
