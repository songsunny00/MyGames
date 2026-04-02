// 游戏全局常量配置
// 所有坐标使用设计分辨率（750×1334），与实际canvas分辨率无关

const CONFIG = {
  // ── 屏幕尺寸（设计分辨率，2倍像素） ──
  W: 750,
  H: 1334,

  // ── 平台参数 ──
  FLOOR_HEIGHT: 210,        // 每层楼之间的世界Y距离
  PLATFORM_H: 36,           // 平台高度
  PLATFORM_W_START: 360,    // 初始平台宽度
  PLATFORM_W_MIN: 160,      // 最小平台宽度（200层后）
  PLATFORM_W_SHRINK: 0.4,   // 每层缩减px数

  // 平台X位置（左/右交替）
  PLATFORM_LEFT_X: 40,      // 左侧平台起始X
  PLATFORM_RIGHT_X: 350,    // 右侧平台起始X（750-40-360=350）

  // ── 角色参数 ──
  CHAR_W: 80,               // 角色宽度（碰撞盒）
  CHAR_H: 100,              // 角色高度（碰撞盒，含帽子）
  CHAR_BODY_R: 38,          // 身体圆半径（绘制用）
  JUMP_SPEED: 900,          // 起跳速度（px/s，向上为负）
  GRAVITY: 1800,            // 重力加速度（px/s²）
  MOVE_SPEED: 420,          // 水平移动速度（px/s）
  LAND_TOLERANCE: 20,       // 落地判定容差（px）

  // 角色在屏幕中的目标位置（相对屏幕H）
  CHAR_SCREEN_Y_RATIO: 0.45,

  // ── 摄像机参数 ──
  CAMERA_FOLLOW_RATIO: 0.4,    // 角色在屏幕上方40%时跟随
  SCROLL_SPEED_ROUND1: 140,    // 第1周目基础滚动速度（px/s）
  SCROLL_SPEED_ROUND2: 200,    // 第2周目
  SCROLL_SPEED_ROUND3: 260,    // 第3周目（封顶）

  // ── 障碍物参数 ──
  QUIZ_INTERVAL_MIN: 10,    // 最小间隔楼层数
  QUIZ_INTERVAL_MAX: 15,    // 最大间隔楼层数

  // 炸弹概率（动态，随楼层降低）
  BOMB_CHANCE_LOW: 0.20,    // <100层
  BOMB_CHANCE_MID: 0.15,    // 100-250层
  BOMB_CHANCE_HIGH: 0.10,   // >250层

  // 礼包概率（动态，随周目增加）
  GIFT_CHANCE_ROUND1: 0.10,
  GIFT_CHANCE_ROUND2: 0.15,
  GIFT_CHANCE_ROUND3: 0.20,

  // 礼包品质概率
  GIFT_BRONZE_CHANCE: 0.50,  // 铜礼包 50%
  GIFT_SILVER_CHANCE: 0.35,  // 银礼包 35%
  // 金礼包 = 15%

  // 礼包奖励楼层
  GIFT_SILVER_FLOORS: 5,
  GIFT_GOLD_FLOORS: 10,

  // ── 终点楼层 ──
  MAX_FLOOR: 365,

  // ── 惩罚参数 ──
  FALL_FLOORS_LOW: 3,       // <100层掉落楼层数
  FALL_FLOORS_MID: 4,       // 100-250层
  FALL_FLOORS_HIGH: 5,      // >250层
  BOMB_SHARE_MAX_FAILS: 3,  // 分享失败保底次数

  // ── 炸弹掉落参数 ──
  BOMB_W: 80,
  BOMB_H: 80,
  BOMB_FALL_SPEED: 900,     // px/s
  BOMB_WARN_TIME: 0.5,      // 预警时间（秒）
  BOMB_INTERVAL_MIN: 8,     // 最短间隔秒数
  BOMB_INTERVAL_MAX: 15,

  // 礼包掉落参数
  GIFT_W: 80,
  GIFT_H: 80,
  GIFT_FALL_SPEED: 600,     // px/s
  GIFT_INTERVAL_MIN: 12,
  GIFT_INTERVAL_MAX: 22,

  // ── 颜色（UI原型暖色调风格） ──
  COLOR: {
    SKY_TOP: '#5BB8F5',
    SKY_BOTTOM: '#E8F8F0',
    PLATFORM_TOP: '#F5A000',
    PLATFORM_FRONT: '#E09000',
    PLATFORM_SHADOW: 'rgba(0,0,0,0.15)',
    PLATFORM_QUIZ: '#FF4040',
    CHAR_BODY: '#FFFFFF',
    CHAR_HAT: '#8B6340',
    CHAR_HAT_BRIM: '#6B4820',
    CHAR_EYE: '#2A1A0E',
    BOMB_BODY: '#2A2A2A',
    BOMB_FUSE: '#8B6914',
    BOMB_SPARK: '#FFD700',
    GIFT_BRONZE: '#CD7F32',
    GIFT_SILVER: '#C0C0C0',
    GIFT_GOLD: '#FFD700',
    OBSTACLE_BG: '#FF3333',
    HUD_BG: '#FFFFFF',
    TEXT_PRIMARY: '#3D2B1F',
    TEXT_SECONDARY: '#8B6E5A',
    TEXT_FLOOR: '#F59500',
    CREAM: '#FFF8E7',
    CREAM_DARK: '#FFF0C8',
    YELLOW: '#FFD84D',
    YELLOW_DEEP: '#FFC107',
    PINK: '#FFB3C6',
    PINK_DEEP: '#FF8FAB',
    PEACH: '#FFCBA4',
    GREEN: '#56C596',
    GREEN_LIGHT: '#A8F0CF',
    RED: '#FF6B6B',
    RED_LIGHT: '#FFB3B3',
  },

  // ── 游戏状态 ──
  STATE: {
    START: 'start',
    PLAYING: 'playing',
    QUIZ: 'quiz',
    BOMB_MODAL: 'bomb_modal',
    PUNISHMENT: 'punishment',
    BANWEI: 'banwei',
    END: 'end',
    PAUSE: 'pause',
  },

  // ── 动效时长（秒） ──
  FX: {
    ANSWER_FEEDBACK: 0.6,   // 答题结果反馈
    FALL_ANIM: 0.5,         // 掉楼动画
    GIFT_OPEN: 0.6,         // 礼包开启动效
    BOMB_EXPLODE: 0.5,      // 炸弹爆炸
    FLOAT_TEXT_LIFE: 1.2,   // 飘字存活时间
    SHAKE_DURATION: 0.3,    // 屏幕震动时长
    QUIZ_BLOCK_FLOAT: 0.8,  // 问号方块浮动周期
  },

  // ── 嘲讽文字池 ──
  BANWEI_TEXTS: [
    '你的班味太重了！',
    '又被卷进去了？',
    '打工魂觉醒中...',
    '你的发际线在抗议！',
    '加班快乐（并不）',
    '老板在看着你！',
    'PPT写完了吗？',
    '你的KPI还差多少？',
  ],

  // ── 掉楼安慰文字池 ──
  FALL_TEXTS: [
    '差一点就过了！',
    '别灰心，继续加油！',
    '下次一定行！',
    '摸鱼失败，再试一次！',
    '离成功只差一点点！',
  ],

  // ── 鼓励文字池 ──
  ENCOURAGE_TEXTS: [
    '加油！继续爬！',
    '太棒了！',
    '去班味成功！',
    '你是最棒的！',
    '坚持就是胜利！',
    '马上就到顶了！',
    '摸鱼达人！',
    '逃离成功！',
  ],

  // ── 终局祝福语池 ──
  ENDING_TEXTS: [
    '祝你从此无班味！天天摸鱼，天天加薪！',
    '365天班？不存在的！你已成功裸辞！',
    '直升机接走，从此只上自己想上的班！',
    '班味已清空，满血复活！',
  ],
}

module.exports = { CONFIG }
