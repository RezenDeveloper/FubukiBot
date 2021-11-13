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
    if (this._shuffleList.includes(index)) return { error: 'Shuffle - Already Played!' }
    this._shuffleList = [...this._shuffleList, index]
    return { error: null }
  }

  backToIndex(index: number) {
    if (!this._shuffleList.includes(index)) return { error: 'Shuffle - Not played yet!' }
    const indexOfMusic = this._shuffleList.indexOf(index)
    this._shuffleList = this._shuffleList.slice(0, indexOfMusic + 1)
    return { error: null }
  }

  clearShuffleList() {
    this._shuffleList = []
  }

  get shuffleList() {
    return this._shuffleList
  }

  set isShuffle(shuffle: boolean) {
    this._isShuffle = shuffle
    this.currentQueue.currentPlaying.updateEmbed()
    if (!shuffle) this.clearShuffleList()
  }

  get isShuffle() {
    return this._isShuffle
  }

  nextShuffleIndex() {
    const queueLenght = this.currentQueue.length
    let pass = false
    let index = 0

    if (this._shuffleList.length === queueLenght) {
      if (!this.currentQueue.isOnLoop) return { error: 'This is the last music' }
      this.clearShuffleList()
    }

    while (!pass) {
      index = Math.floor(Math.random() * queueLenght)
      if (!this._shuffleList.includes(index)) {
        this.addToShuffleList(index)
        pass = true
      }
    }
    this.currentQueue.index = index
    return { error: null }
  }

  prevShuffleIndex() {
    const arrayLength = this._shuffleList.length - 1
    if (arrayLength <= 0) {
      return { error: 'This is the first song' }
    }

    this._shuffleList = this._shuffleList.slice(0, -1)
    const prevIndex = this._shuffleList[this._shuffleList.length - 1]
    this.currentQueue.index = prevIndex
    return { error: null }
  }
}
