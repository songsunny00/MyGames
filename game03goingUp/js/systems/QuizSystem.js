// 答题系统
// 管理题库、抽题、去重
const { CONFIG } = require('../config.js')

let _questions = null

function loadQuestions() {
  if (!_questions) {
    try {
      _questions = require('../../assets/questions.js')
    } catch (e) {
      console.error('Failed to load questions:', e)
      _questions = []
    }
  }
  return _questions
}

class QuizSystem {
  constructor() {
    this._usedIds = new Set()
    this._all = loadQuestions()
  }

  // 随机抽取一道题（同一局内不重复；题库用完后重置）
  draw() {
    if (!this._all || this._all.length === 0) {
      // 降级：返回默认题目避免崩溃
      return { id: 0, type: 'brainteaser', question: '什么东西越洗越脏？', options: ['碗', '水', '地板', '衣服'], answer: 1 }
    }
    let available = this._all.filter(q => !this._usedIds.has(q.id))
    if (available.length === 0) {
      this._usedIds.clear()
      available = this._all.slice()
    }
    const q = available[Math.floor(Math.random() * available.length)]
    this._usedIds.add(q.id)
    return q
  }

  // 检查答案是否正确
  checkAnswer(question, answerIndex) {
    return answerIndex === question.answer
  }

  // 重置已用题目（新一局时调用）
  reset() {
    this._usedIds.clear()
  }

  // 获取题目总数
  get total() {
    return this._all.length
  }
}

module.exports = { QuizSystem }
