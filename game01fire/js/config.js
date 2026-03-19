/**
 * 游戏配置常量
 */

// 画布尺寸（运行时设置）
export const CANVAS_WIDTH = 375
export const CANVAS_HEIGHT = 667

// 粒子系统配置
export const PARTICLE_MAX_COUNT = 500
export const PARTICLE_MIN_LIFE = 60
export const PARTICLE_MAX_LIFE = 120

// 烟花配置
export const FIREWORK_RISE_SPEED = 3
export const FIREWORK_EXPLODE_PARTICLES = 80

// 星空配置
export const STAR_COUNT = 150
export const METEOR_INTERVAL = 3000 // 流星间隔（毫秒）

// 梦幻水彩色板
export const COLORS = {
  // 主色调
  dreamy: [
    '#FF6B9D', // 粉红
    '#C44FE2', // 紫色
    '#6B5BFF', // 蓝紫
    '#4FC3E2', // 天蓝
    '#4FE2B8', // 青绿
    '#E2C74F', // 金黄
    '#E27B4F', // 橙色
    '#FF9EB5'  // 浅粉
  ],
  // 发财系列 - 金色主题
  gold: [
    '#FFD700', // 金色
    '#FFA500', // 橙金
    '#FFEC8B', // 浅金
    '#FF6347', // 番茄红
    '#FFD700'  // 金色
  ],
  // 极光色
  aurora: [
    'rgba(107, 91, 255, 0.3)',   // 蓝紫
    'rgba(196, 79, 226, 0.3)',   // 紫色
    'rgba(79, 195, 226, 0.3)',   // 天蓝
    'rgba(79, 226, 184, 0.3)'    // 青绿
  ],
  // 星星颜色
  star: [
    '#FFFFFF',
    '#FFE4E1',
    '#E6E6FA',
    '#F0FFF0'
  ]
}

// 烟花类型
export const FIREWORK_TYPES = {
  // 基础烟花
  HEART: 'heart',         // 心形爆炸
  DOUBLE: 'double',       // 双重爆炸
  WATERCOLOR: 'watercolor', // 水彩晕染
  METEOR: 'meteor',       // 流星
  // VIP专属
  BAOFU: 'baofu',         // 暴富
  CHENGGONG: 'chenggong', // 马上成功
  CUPID: 'cupid',         // 丘比特
  JINLI: 'jinli'          // 锦鲤
}

// 烟花解锁状态
export const FIREWORK_UNLOCK = {
  heart: { unlocked: true, requiresUnlock: false },
  double: { unlocked: true, requiresUnlock: false },
  watercolor: { unlocked: true, requiresUnlock: false },
  meteor: { unlocked: true, requiresUnlock: false },
  baofu: { unlocked: false, requiresUnlock: true },
  chenggong: { unlocked: false, requiresUnlock: true },
  cupid: { unlocked: false, requiresUnlock: true },
  jinli: { unlocked: false, requiresUnlock: true }
}

// 文字烟花配置
export const TEXT_FIREWORKS = {
  baofu: { text: '暴富', emojis: ['💎', '💰', '✨', '🏆'] },
  chenggong: { text: '成功', emojis: ['🎯', '⭐', '🚀', '💪'] },
  cupid: { text: '', emojis: ['💘', '💕', '💖', '💗', '❤️'] },
  jinli: { text: '锦鲤', emojis: ['🐟', '🍀', '✨', '🎊', '💫'] }
}

// 物理参数
export const GRAVITY = 0.03
export const FRICTION = 0.99

// 触摸配置
export const LONG_PRESS_INTERVAL = 200 // 长按发射间隔（毫秒）
export const SHAKE_THRESHOLD = 15      // 晃动阈值
