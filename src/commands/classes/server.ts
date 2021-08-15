import { getConfig } from '../../utils/api/fubuki/config'

export class Server {
  private _config: ServerConfig | null

  constructor() {
    this._config = null
    this.setServerConfig()
  }

  async setServerConfig() {
    this._config = await getConfig()
    console.log('configs loaded!')
  }

  // Getters and Setters

  get config() {
    return this._config as ServerConfig
  }
}
