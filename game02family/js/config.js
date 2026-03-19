// 游戏配置文件
const GAME_CONFIG = {
  // 游戏状态
  GAME_STATE: {
    START: 0,
    MENU: 1,
    PLAYING: 2,
    PAUSED: 3,
    GAME_OVER: 4
  },
  
  // 寄思方式
  MEMORIAL_TYPES: {
    KONGMING: 0,  // 孔明灯
    RIVER: 1,      // 河灯
    FLOWER: 2,     // 献花
    MAIL: 3        // 时空信箱
  },
  
  // 视觉配置
  VISUAL: {
    BACKGROUND_COLOR: '#0a0a1a',
    FONT_FAMILY: '"Ma Shan Zheng", "STKaiti", "KaiTi", Arial, sans-serif',
    FONT_SIZE: 14,
    FONT_COLOR: '#ffffff',
    UI_OPACITY: 0.8,
    // 水墨风格颜色方案
    COLORS: {
      PRIMARY: '#1a1a2e',
      SECONDARY: '#16213e',
      ACCENT: '#ffd700',
      TEXT: '#ffffff',
      RED: '#ff6b6b',
      GREEN: '#3a7d44',
      BLUE: '#3498db',
      PURPLE: '#9b59b6'
    }
  },
  
  // 孔明灯配置
  KONGMING: {
    BASE_SIZE: 60,
    RISE_SPEED: 20,
    FLOAT_SPEED: 5,
    MAX_COUNT: 10,
    LIFETIME: 10000, // 10秒
    PARTICLE_COUNT: 50
  },
  
  // 河灯配置
  RIVER: {
    BASE_SIZE: 80,
    FLOW_SPEED: 30,
    MAX_COUNT: 15,
    LIFETIME: 15000, // 15秒
    WAVE_SPEED: 2
  },
  
  // 献花配置
  FLOWER: {
    TYPES: ['菊花', '百合', '玫瑰', '康乃馨'],
    BASE_SIZE: 40,
    MAX_COUNT: 20,
    ANIMATION_DURATION: 3000
  },
  
  // 时空信箱配置
  MAIL: {
    BASE_SIZE: 100,
    FLY_SPEED: 40,
    MAX_COUNT: 5,
    LIFETIME: 20000, // 20秒
    MESSAGE_MAX_LENGTH: 50
  },
  
  // 粒子系统配置
  PARTICLE: {
    MAX_COUNT: 500,
    BASE_SIZE: 2,
    BASE_SPEED: 10
  },
  
  // 背景配置
  BACKGROUND: {
    STAR_COUNT: 80,
    WIND_SPEED: 1,
    CLOUD_COUNT: 5
  },
  
  // 音频配置
  AUDIO: {
    BGM_VOLUME: 0.3,
    EFFECT_VOLUME: 0.6
  },
  
  // 成就系统配置
  ACHIEVEMENT: {
    TYPES: [
      { id: 'first_kongming', name: '初次寄思', description: '第一次放飞孔明灯' },
      { id: 'first_river', name: '江河寄情', description: '第一次放河灯' },
      { id: 'first_flower', name: '花语寄思', description: '第一次献花' },
      { id: 'first_mail', name: '时空信使', description: '第一次使用时空信箱' },
      { id: 'memorial_master', name: '寄思大师', description: '使用所有寄思方式' },
      { id: 'persistent', name: '持之以恒', description: '连续3天使用寄思功能' },
      { id: 'creative', name: '创意无限', description: '创建10个不同的寄思内容' },
      { id: 'sharer', name: '分享大使', description: '分享寄思内容给5个好友' }
    ]
  }
}

module.exports = {
  GAME_CONFIG
}
