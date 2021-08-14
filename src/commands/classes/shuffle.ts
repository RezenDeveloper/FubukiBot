import type { QueueClass } from './queueClass'

export class Shuffle {
  private _shuffleList: number[]
  private _isShuffle: boolean
  private currentQueue: QueueClass

  constructor(currentQueue: QueueClass) {
    this._shuffleList = []
    this._isShuffle = false
    this.currentQueue = currentQueue
  }

  addToShuffleList(index: number) {
    if (this._shuffleList.includes(index)) return
    this._shuffleList = [...this._shuffleList, index]
  }

  clearShuffleList() {
    this._shuffleList = []
  }

  get shuffleList() {
    return this._shuffleList
  }

  set isShuffle(shuffle: boolean) {
    this._isShuffle = shuffle
    if (!shuffle) this.clearShuffleList()
  }

  get isShuffle() {
    return this._isShuffle
  }

  nextShuffleIndex() {
    return new Promise((resolve, reject) => {
      const queueLenght = this.currentQueue.length
      let pass = false
      let index = 0

      if (this._shuffleList.length === queueLenght) return reject('This is the last music')

      while (!pass) {
        index = Math.floor(Math.random() * queueLenght)
        console.log('shuffle index', index)
        if (!this._shuffleList.includes(index)) {
          this.addToShuffleList(index)
          pass = true
        }
      }

      console.log({
        shuffleListLength: this._shuffleList.length,
        queueLenght,
        shuffleList: this._shuffleList,
      })

      this.currentQueue.index = index
      resolve()
    }) as Promise<void>
  }

  prevShuffleIndex() {
    return new Promise((resolve, reject) => {
      const arrayLength = this._shuffleList.length - 1
      if (arrayLength <= 0) {
        return reject('This is the first song')
      }

      this._shuffleList = this._shuffleList.slice(0, -1)
      const prevIndex = this._shuffleList[this._shuffleList.length - 1]
      this.currentQueue.index = prevIndex
      console.log({
        shuffleListLength: this._shuffleList.length,
        queueLenght: this.currentQueue.length,
        shuffleList: this._shuffleList,
      })
      resolve(true)
    })
  }
}
