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

  addToShuffleList = (index: number) => {
    this._shuffleList = [...this._shuffleList, index]
  }

  clearShuffleList = () => {
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

  setShuffleIndex = () => {
    const queueLenght = this.currentQueue.length
    let pass = false
    let index = 0

    if (this._shuffleList.length === queueLenght) this.clearShuffleList()

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
    })

    this.currentQueue.index = index
  }

  prevShuffleIndex() {
    return new Promise((resolve, reject) => {
      const prevIndex = this._shuffleList.length - 1
      if (prevIndex < 0) {
        reject('This is the first song')
      }

      this._shuffleList = this._shuffleList.slice(0, -1)
      this.currentQueue.index = prevIndex
      resolve(true)
    })
  }
}
