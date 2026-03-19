/**
 * 工具函数
 */

/**
 * 生成指定范围内的随机数
 */
export function random(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * 生成指定范围内的随机整数
 */
export function randomInt(min, max) {
  return Math.floor(random(min, max + 1))
}

/**
 * 从数组中随机选择一个元素
 */
export function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

/**
 * 计算两点之间的距离
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 角度转弧度
 */
export function degToRad(deg) {
  return deg * Math.PI / 180
}

/**
 * 弧度转角度
 */
export function radToDeg(rad) {
  return rad * 180 / Math.PI
}

/**
 * 创建径向渐变（水彩效果）
 */
export function createWatercolorGradient(ctx, x, y, radius, color, alpha = 0.8) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  
  // 解析颜色
  const rgb = hexToRgb(color)
  
  gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`)
  gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.6})`)
  gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.3})`)
  gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)
  
  return gradient
}

/**
 * 十六进制颜色转 RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }
}

/**
 * 颜色混合
 */
export function blendColors(color1, color2, ratio) {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio)
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio)
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)
  
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 缓动函数 - 缓出
 */
export function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * 缓动函数 - 缓入缓出
 */
export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
