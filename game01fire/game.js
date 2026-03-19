/**
 * 星空烟花沙盒 - 游戏入口
 * 初始化 Canvas 和游戏主循环
 */

import Main from './js/main.js'

// 获取画布
const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')

// 获取系统信息
const systemInfo = wx.getSystemInfoSync()
const { windowWidth, windowHeight, pixelRatio } = systemInfo

// 设置画布尺寸
canvas.width = windowWidth * pixelRatio
canvas.height = windowHeight * pixelRatio
ctx.scale(pixelRatio, pixelRatio)

// 初始化游戏
const game = new Main({
  canvas,
  ctx,
  width: windowWidth,
  height: windowHeight
})

// 游戏主循环
let lastTime = 0
const targetFPS = 60
const frameInterval = 1000 / targetFPS

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime
  
  if (deltaTime >= frameInterval) {
    lastTime = timestamp - (deltaTime % frameInterval)
    game.update(deltaTime)
    game.render()
  }
  
  requestAnimationFrame(gameLoop)
}

// 启动游戏
requestAnimationFrame(gameLoop)
