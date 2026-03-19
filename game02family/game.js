// 游戏入口文件
const TARGET_FPS = 60
const UPDATE_INTERVAL = 1000 / TARGET_FPS

let lastTime = 0
let game = null

// 检测是否在微信小程序环境中
const isWechat = typeof wx !== 'undefined'

if (isWechat) {
  wx.onShow(() => {
    if (game) {
      game.resume()
    }
  })

  wx.onHide(() => {
    if (game) {
      game.pause()
    }
  })

  wx.onError((err) => {
    console.error('Game error:', err)
  })
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp
  const deltaTime = timestamp - lastTime
  
  if (deltaTime >= UPDATE_INTERVAL) {
    if (game) {
      game.update(deltaTime / 1000)
      game.render()
    }
    lastTime = timestamp - (deltaTime % UPDATE_INTERVAL)
  }
  
  if (isWechat) {
    requestAnimationFrame(gameLoop)
  } else {
    // 在非微信环境中，模拟几帧后退出
    if (timestamp > 1000) {
      console.log('Test completed successfully!')
      return
    }
    setTimeout(() => gameLoop(timestamp + 16), 16)
  }
}

function initGame() {
  let canvas, ctx
  
  if (isWechat) {
    canvas = wx.createCanvas()
    ctx = canvas.getContext('2d')
  } else {
    // 创建模拟 canvas
    const { createCanvas } = require('canvas')
    canvas = createCanvas(750, 1334)
    ctx = canvas.getContext('2d')
    console.log('Running in test mode...')
  }
  
  // 导入游戏主逻辑
  const Game = require('./js/main.js').default
  game = new Game(canvas, ctx)
  game.init()
  
  if (isWechat) {
    requestAnimationFrame(gameLoop)
  } else {
    gameLoop(0)
  }
}

// 启动游戏
initGame()
