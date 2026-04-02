// 游戏主场景
// 协调所有游戏实体：角色、平台、障碍物、HUD、特效
const { CONFIG } = require("../config.js");
const { Character } = require("../entities/Character.js");
const { PlatformManager } = require("../entities/PlatformManager.js");
const { ObstacleManager } = require("../entities/ObstacleManager.js");
const { HUD } = require("../ui/HUD.js");
const { FeedbackFX } = require("../ui/FeedbackFX.js");
const { CollectionPanel } = require("../ui/CollectionPanel.js");
const { QuizSystem } = require("../systems/QuizSystem.js");
const { PunishmentSystem } = require("../systems/PunishmentSystem.js");
const { QuizPanel } = require("./QuizPanel.js");
const { BombModal } = require("./BombModal.js");

// GameScene内部状态（不暴露给Main）
const GS = {
  PLAYING: "playing",
  QUIZ: "quiz",
  BOMB_MODAL: "bomb_modal",
  PUNISHMENT: "punishment",
  BANWEI: "banwei",
  PAUSE: "pause",
  COLLECTION: "collection",
};

class GameScene {
  constructor(onEvent) {
    this.onEvent = onEvent; // 向Main发送事件

    this.char = new Character();
    this.platformMgr = new PlatformManager();
    this.obstacleMgr = new ObstacleManager();
    this.hud = new HUD();
    this.fx = new FeedbackFX();
    this.collectionPanel = new CollectionPanel();
    this.quizSystem = new QuizSystem();
    this.punishSystem = new PunishmentSystem();
    this.quizPanel = new QuizPanel();
    this.bombModal = new BombModal();

    // 摄像机世界Y（屏幕顶边对应的世界Y）
    this.cameraWorldY = 0;

    this._state = GS.PLAYING;
    this._scrollSpeed = CONFIG.SCROLL_SPEED_ROUND1;
    this._punishTimer = 0;
    this._quizForBanwei = false; // 当前quiz是否为解除班味惩罚

    this._clouds = this._initClouds();
    this._bgT = 0;
    this._collectionProgress = [0, 1, 0];
    this._round = 0;
  }

  // ── 初始化新游戏 ──
  init(completionRound = 0) {
    this._round = completionRound;
    this._collectionProgress = [
      completionRound > 0 ? 1 : 0,
      completionRound > 1 ? 1 : 0,
      completionRound > 2 ? 1 : 0,
    ];
    this.obstacleMgr.setRound(completionRound);
    this.quizSystem.reset();

    const speeds = [
      CONFIG.SCROLL_SPEED_ROUND1,
      CONFIG.SCROLL_SPEED_ROUND2,
      CONFIG.SCROLL_SPEED_ROUND3,
    ];
    this._scrollSpeed = speeds[Math.min(completionRound, 2)];

    // 初始化平台
    const initCamY = -(CONFIG.H * 0.7);
    this.cameraWorldY = initCamY;
    this.platformMgr.init(initCamY);

    // 角色定位到第1层
    const floor1 = this.platformMgr.platforms.find((p) => p.floor === 1);
    const { x, w } = this.platformMgr.floorToX(1);
    this.char.worldX = x + w / 2;
    this.char.worldY = floor1 ? floor1.worldY : 0;
    this.char.velY = -CONFIG.JUMP_SPEED;
    this.char.velX = 0;
    this.char.currentFloor = 1;
    this.char.maxFloor = 1;
    this.char.isBanwei = false;

    this.obstacleMgr.reset();
    this.fx = new FeedbackFX();
    this._state = GS.PLAYING;
    this._punishTimer = 0;
    this._quizForBanwei = false;
    this._bgT = 0;
  }

  // ── 每帧更新 ──
  update(dt, input) {
    this._bgT += dt;

    // ── 暂停状态 ──
    if (this._state === GS.PAUSE) {
      const hits = input.consumeTaps(this.hud.getPauseOverlayAreas());
      if (hits.includes("resume")) this._state = GS.PLAYING;
      if (hits.includes("exit")) this.onEvent({ type: "exitToStart" });
      return;
    }

    if (this._state === GS.COLLECTION) {
      this.collectionPanel.update(dt);
      const hits = input.consumeTaps(this.collectionPanel.getClickAreas());
      if (hits.includes("closeCollection")) {
        this.collectionPanel.hide();
        this._state = GS.PLAYING;
      }
      return;
    }

    // ── Quiz面板 ──
    if (this._state === GS.QUIZ) {
      this._updateQuiz(dt, input);
      this.fx.update(dt);
      return;
    }

    // ── 炸弹弹窗 ──
    if (this._state === GS.BOMB_MODAL) {
      this._updateBombModal(dt, input);
      this.fx.update(dt);
      return;
    }

    // ── 所有活跃状态（PLAYING / BANWEI / PUNISHMENT）共用物理更新 ──
    const allowJump = this._state !== GS.PUNISHMENT;
    const landedPlat = this.char.update(
      dt,
      this.platformMgr,
      input,
      this._state,
      allowJump,
    );

    this._updateCamera(dt);
    this.platformMgr.update(this.cameraWorldY);
    this.fx.update(dt);

    // ── 惩罚倒计时 ──
    if (this._state === GS.PUNISHMENT) {
      this._punishTimer -= dt;
      if (this._punishTimer <= 0) this._state = GS.PLAYING;
      return;
    }

    // ── 正常游戏（含班味） ──
    // 障碍物更新（只在PLAYING时生成新炸弹礼包）
    if (this._state === GS.PLAYING) {
      this.obstacleMgr.update(dt, this.char.currentFloor);
      this._checkBombGiftCollisions();
    }

    // 落地处理
    if (landedPlat) {
      this._onLanded(landedPlat);
    }

    // HUD点击（暂停）
    const hudHits = input.consumeTaps(this.hud.getClickAreas());
    if (hudHits.includes("pause")) {
      this._state = GS.PAUSE;
    } else if (hudHits.includes("collection")) {
      this.collectionPanel.show(this._collectionProgress);
      this._state = GS.COLLECTION;
    }
  }

  _updateCamera(dt) {
    const charScreenY = this.char.worldY - this.cameraWorldY;

    // 角色接近屏幕上方时，摄像机跟随
    const followY = this.char.worldY - CONFIG.H * CONFIG.CAMERA_FOLLOW_RATIO;
    if (followY < this.cameraWorldY) {
      this.cameraWorldY = followY;
    }

    // 自动向上滚动
    this.cameraWorldY -= this._scrollSpeed * dt;

    // 防止角色完全脱离画面底部（回位到当前楼层）
    if (charScreenY > CONFIG.H + 100) {
      const floorY = this.platformMgr.floorToWorldY(
        Math.max(1, this.char.currentFloor),
      );
      const { x, w } = this.platformMgr.floorToX(this.char.currentFloor);
      this.char.worldX = x + w / 2;
      this.char.worldY = floorY;
      this.char.velY = -CONFIG.JUMP_SPEED;
      this.cameraWorldY = floorY - CONFIG.H * 0.7;
    }
  }

  _onLanded(plat) {
    if (this._state === GS.BANWEI) {
      // 班味状态：任意落地就触发解除quiz
      if (!plat._banweiQuizConsumed) {
        plat._banweiQuizConsumed = true;
        this._triggerQuiz(true);
      }
      return;
    }

    // PLAYING：检查quiz方块
    if (plat.hasQuiz && !plat.quizConsumed) {
      plat.quizConsumed = true;
      this._triggerQuiz(false);
    }
  }

  _triggerQuiz(isForBanwei) {
    this._quizForBanwei = isForBanwei;
    const question = this.quizSystem.draw();
    this.quizPanel.show(question, this.char.currentFloor);
    this._state = GS.QUIZ;
  }

  _updateQuiz(dt, input) {
    this.quizPanel.update(dt);

    // 选项点击
    const optAreas = this.quizPanel.getOptionAreas();
    const hits = input.consumeTaps(optAreas);
    for (const hit of hits) {
      if (hit.startsWith("option_")) {
        this.quizPanel.selectOption(parseInt(hit.replace("option_", ""), 10));
      }
    }

    // 结果处理（展示时间结束后触发）
    const result = this.quizPanel.getResult();
    if (result === "correct") {
      this.fx.burst(CONFIG.W / 2, CONFIG.H * 0.5, 18, "#2ECC71");
      this.fx.addFloatText("去班味成功！", CONFIG.W / 2, CONFIG.H * 0.4, {
        color: "#2ECC71",
        fontSize: 52,
      });

      if (this._quizForBanwei) {
        // 解除班味
        this.char.isBanwei = false;
        this._quizForBanwei = false;
        this.fx.addFloatText("班味已清除！", CONFIG.W / 2, CONFIG.H * 0.33, {
          color: "#FFD700",
          fontSize: 44,
        });
      }
      this._state = GS.PLAYING;
    } else if (result === "wrong") {
      this.fx.shake(8, 0.3);
      this._applyWrongPunishment();
    }
  }

  _applyWrongPunishment() {
    const type = this.punishSystem.randomPunishmentType();

    if (type === "fall") {
      const floors = this.punishSystem.fallFloors(this.char.currentFloor);
      const newFloor = Math.max(1, this.char.currentFloor - floors);
      this.char.currentFloor = newFloor;

      // 传送到掉落楼层
      const targetWorldY = this.platformMgr.floorToWorldY(newFloor);
      const { x, w } = this.platformMgr.floorToX(newFloor);
      this.char.worldX = x + w / 2;
      this.char.worldY = targetWorldY;
      this.char.velY = -CONFIG.JUMP_SPEED;

      this.fx.addFloatText(
        this.punishSystem.randomFallText(),
        CONFIG.W / 2,
        CONFIG.H * 0.42,
        { color: "#FF9500", fontSize: 42 },
      );
      this.fx.addFloatText(`-${floors}层`, CONFIG.W / 2, CONFIG.H * 0.35, {
        color: "#FF3333",
        fontSize: 56,
      });

      this._state = GS.PUNISHMENT;
      this._punishTimer = 1.5;
    } else {
      // 班味惩罚
      this.char.isBanwei = true;
      this.fx.addFloatText(
        this.punishSystem.randomBanweiText(),
        CONFIG.W / 2,
        CONFIG.H * 0.35,
        { color: "#FF3333", fontSize: 44 },
      );
      this._state = GS.BANWEI;
    }
  }

  _checkBombGiftCollisions() {
    // 炸弹礼包在屏幕坐标系；用角色屏幕坐标做碰撞
    const charSX = this.char.worldX;
    const charSY = this.char.worldY - this.cameraWorldY;

    const charProxy = { worldX: charSX, worldY: charSY };

    const bomb = this.obstacleMgr.checkBombHit(charProxy);
    if (bomb) {
      this._onBombHit();
      return;
    }

    const gift = this.obstacleMgr.checkGiftHit(charProxy);
    if (gift) this._onGiftCollected(gift);
  }

  _onBombHit() {
    const charSY = this.char.worldY - this.cameraWorldY;
    this.fx.shake(16, 0.5);
    this.fx.burst(this.char.worldX, charSY, 20, "#FF4444");

    const punishType = this.punishSystem.randomBombPunishment();
    this.bombModal.show(punishType, this.char.currentFloor);
    this._state = GS.BOMB_MODAL;
  }

  _onGiftCollected(gift) {
    const charSY = this.char.worldY - this.cameraWorldY;
    this.fx.burst(this.char.worldX, charSY, 16, this._giftColor(gift.tier));

    if (gift.tier === "bronze") {
      this.fx.addFloatText(
        this.punishSystem.randomEncourageText(),
        this.char.worldX,
        charSY - 80,
        { color: "#FFD700", fontSize: 44 },
      );
    } else {
      const floors =
        gift.tier === "gold"
          ? CONFIG.GIFT_GOLD_FLOORS
          : CONFIG.GIFT_SILVER_FLOORS;
      this.char.forceJump(floors);
      this.fx.confetti(22);
      this.fx.addFloatText(`+${floors}层 🎉`, CONFIG.W / 2, CONFIG.H * 0.4, {
        color: "#FFD700",
        fontSize: 58,
      });

      // 瞬移到新楼层
      const newFloor = this.char.currentFloor;
      const newWorldY = this.platformMgr.floorToWorldY(newFloor);
      const { x, w } = this.platformMgr.floorToX(newFloor);
      this.char.worldX = x + w / 2;
      this.char.worldY = newWorldY;
      this.char.velY = -CONFIG.JUMP_SPEED;
      this.cameraWorldY = newWorldY - CONFIG.H * 0.7;
      this.platformMgr.update(this.cameraWorldY);
    }
  }

  _giftColor(tier) {
    return tier === "gold"
      ? "#FFD700"
      : tier === "silver"
        ? "#C0C0C0"
        : "#CD7F32";
  }

  _updateBombModal(dt, input) {
    this.bombModal.update(dt);

    // 倒计时结束自动重来
    if (this.bombModal.type === "share" && this.bombModal.countdown <= 0) {
      this.onEvent({ type: "bombRestart" });
      return;
    }

    const hits = input.consumeTaps(this.bombModal.getClickAreas());
    for (const hit of hits) {
      if (hit === "share") {
        this._handleBombShare();
      } else if (hit === "restart") {
        this.onEvent({ type: "bombRestart" });
      } else if (hit === "continue") {
        this._state = GS.PLAYING;
      }
    }
  }

  _handleBombShare() {
    const isWechat = typeof wx !== "undefined";
    if (isWechat) {
      wx.shareAppMessage({
        title: `我在爬楼游戏中被炸飞了！救救孩子！已到达第${this.char.currentFloor}层`,
        success: () => {
          this.punishSystem.resetShareFail();
          this._state = GS.PLAYING;
          this.fx.addFloatText(
            "分享成功！继续爬！",
            CONFIG.W / 2,
            CONFIG.H / 2,
            { color: "#2ECC71", fontSize: 44 },
          );
        },
        fail: () => {
          const isPardon = this.punishSystem.recordShareFail();
          if (isPardon) {
            this.bombModal.show("pardon", this.char.currentFloor);
          } else {
            this.onEvent({ type: "bombRestart" });
          }
        },
      });
    } else {
      // 非微信环境：直接继续
      this._state = GS.PLAYING;
    }
  }

  // ── 渲染 ──
  render(ctx) {
    ctx.save();
    this.fx.applyShake(ctx);

    // 背景
    this._drawBackground(ctx);

    // 平台
    this.platformMgr.render(ctx, this.cameraWorldY);

    // 角色
    const charSX = this.char.worldX;
    const charSY = this.char.worldY - this.cameraWorldY;
    this.char.renderShadow(ctx, charSX, charSY);
    this.char.render(ctx, charSX, charSY);

    // 炸弹 + 礼包（屏幕坐标）
    this.obstacleMgr.renderBombs(ctx);
    this.obstacleMgr.renderGifts(ctx);

    // 特效
    this.fx.render(ctx);

    ctx.restore();

    // HUD（不受震动影响）
    this.hud.render(
      ctx,
      this.char.currentFloor,
      this.char.maxFloor,
      this._getCollectionProgressText(),
    );

    // 暂停覆盖
    if (this._state === GS.PAUSE) {
      this.hud.renderPauseOverlay(ctx);
    }

    if (this._state === GS.COLLECTION) {
      this.collectionPanel.render(ctx);
    }

    // 班味提示栏
    if (this._state === GS.BANWEI) {
      this._drawBanweiBar(ctx);
    }

    // Quiz面板（叠加）
    if (this._state === GS.QUIZ) {
      this.quizPanel.render(ctx);
    }

    // 炸弹弹窗（叠加）
    if (this._state === GS.BOMB_MODAL) {
      this.bombModal.render(ctx);
    }
  }

  _drawBackground(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.H);
    bgGrad.addColorStop(0, "#5BB8F5");
    bgGrad.addColorStop(0.55, "#B8E8FA");
    bgGrad.addColorStop(0.8, "#D8F2FC");
    bgGrad.addColorStop(1, "#E8F8F0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // 太阳光晕
    ctx.save();
    const sunGrd = ctx.createRadialGradient(-80, -80, 0, -80, -80, 400);
    sunGrd.addColorStop(0, "rgba(255,255,200,0.2)");
    sunGrd.addColorStop(1, "transparent");
    ctx.fillStyle = sunGrd;
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
    ctx.restore();

    this._drawClouds(ctx);

    // 地面渐变
    ctx.save();
    const groundGrd = ctx.createLinearGradient(0, CONFIG.H - 90, 0, CONFIG.H);
    groundGrd.addColorStop(0, "transparent");
    groundGrd.addColorStop(1, "rgba(150,210,160,0.3)");
    ctx.fillStyle = groundGrd;
    ctx.fillRect(0, CONFIG.H - 90, CONFIG.W, 90);
    ctx.restore();
  }

  _initClouds() {
    return [
      { bx: 80, by: 120, scale: 0.9, speed: 0.28 },
      { bx: 500, by: 200, scale: 0.7, speed: 0.21 },
      { bx: 260, by: 70, scale: 1.1, speed: 0.17 },
      { bx: 620, by: 320, scale: 0.6, speed: 0.25 },
    ];
  }

  _drawClouds(ctx) {
    const t = this._bgT;
    for (const c of this._clouds) {
      const fx = Math.sin(t * c.speed) * 18;
      const fy = Math.sin(t * c.speed * 1.5 + c.bx) * 6;
      this._drawCloud(ctx, c.bx + fx, c.by + fy, c.scale);
    }
  }

  _drawCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(120,180,220,0.2)";
    ctx.shadowBlur = 12;
    const parts = [
      [0, 0, 40],
      [-50, -10, 32],
      [50, -10, 32],
      [-80, 12, 24],
      [80, 12, 24],
      [-30, -26, 28],
      [30, -26, 28],
    ];
    for (const [px, py, r] of parts) {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _drawBanweiBar(ctx) {
    ctx.save();
    const t = this._bgT;
    const alpha = 0.75 + 0.25 * Math.sin(t * 4);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#FF3333";
    ctx.font = "bold 38px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 16;
    ctx.fillText(
      "班味惩罚中！落到下一个平台需答对题目解除",
      CONFIG.W / 2,
      CONFIG.H * 0.91,
    );
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _getCollectionProgressText() {
    const total = this._collectionProgress.reduce((a, b) => a + b, 0);
    return `${total}/3`;
  }

  getCurrentFloor() {
    return this.char.currentFloor;
  }
}

module.exports = { GameScene };
