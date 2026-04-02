// 游戏入口文件
const TARGET_FPS = 60
const UPDATE_INTERVAL = 1000 / TARGET_FPS

let lastTime = 0
let game = null

const isWechat = typeof wx !== 'undefined'

if (isWechat) {
  wx.onShow(() => { if (game) game.resume() })
  wx.onHide(() => { if (game) game.pause() })
  wx.onError((err) => { console.error('Game error:', err) })
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp
  const deltaTime = Math.min(timestamp - lastTime, 50) // cap at 50ms to avoid spiral

  if (deltaTime >= UPDATE_INTERVAL) {
    if (game) {
      game.update(deltaTime / 1000)
      game.render()
    }
    lastTime = timestamp - (deltaTime % UPDATE_INTERVAL)
  }

  setTimeout(() => gameLoop(timestamp + 16), 16)
}

function initGame() {
  let canvas, ctx

  if (isWechat) {
    canvas = wx.createCanvas()
    ctx = canvas.getContext('2d')
    const sysInfo = wx.getSystemInfoSync()
    const dpr = sysInfo.pixelRatio || 2
    canvas.width = sysInfo.windowWidth * dpr
    canvas.height = sysInfo.windowHeight * dpr
    console.log('Canvas:', canvas.width, 'x', canvas.height, 'dpr:', dpr)
  } else {
    // Node.js / test environment
    try {
      const { createCanvas } = require('canvas')
      canvas = createCanvas(750, 1334)
      ctx = canvas.getContext('2d')
    } catch (e) {
      console.error('canvas module not found, running headless')
      canvas = { width: 750, height: 1334 }
      ctx = { fillRect: () => {}, fillStyle: '', clearRect: () => {} }
    }
    console.log('Running in test mode...')
  }

  const Game = require('./js/main.js').default
  game = new Game(canvas, ctx)
  game.init()

  gameLoop(0)
}

initGame()
