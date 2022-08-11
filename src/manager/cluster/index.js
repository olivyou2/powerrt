const { ClientManager } = require("../client");
const { RoomManager } = require("../room");
const { WorkerManager } = require("../worker");

class ClutserManager {
  constructor() {
    const port = 10000 + Math.floor(Math.random() * 1000);

    // 랜덤포트 할당
    this.workerManager = new WorkerManager();

    // 임의포트 지정
    this.clientManager = new ClientManager(port);

    this.roomManager = new RoomManager();

    this.workerManager.on("data", (type, ...args) => {
      if (type === "Broadcast") {
        // 현재 서버에 있는 모든 클라이언트에 브로드캐스팅
        this.clientManager.broadcast(...args);
      } else if (type === "Emit") {
        const [clientId, ...otherArgs] = args;

        const client = this.clientManager.getClient(clientId);
        if (client) {
          client.emit(...otherArgs);
        }
      } else if (type === "Room") {
        const [roomName, ...otherArgs] = args;

        const room = this.roomManager.getRoom(roomName);
        if (room) {
          room.broadcast(...otherArgs);
        }
      }
    });
  }

  /**
   * @description 클러스터에 브로드캐스팅합니다.
   * @param  {...string} args
   */
  broadcast(...args) {
    this.clientManager.broadcast(...args);
    this.workerManager.broadcast("Broadcast", ...args);
  }

  /**
   * @description 클러스터에 룸 브로드캐스팅합니다
   * @param {string} roomName
   * @param  {...string} args
   */
  roomBroadcast(roomName, ...args) {
    const room = this.roomManager.getRoom(roomName);
    if (room) {
      room.broadcast(...args);
    }

    this.workerManager.broadcast("Room", roomName, ...args);
  }

  /**
   * @description 특정 클라이언트에 emit 합니다
   * @param {string} clientId
   * @param  {...string} args
   */
  emit(clientId, ...args) {
    const client = this.clientManager.getClient(clientId);

    if (client) {
      client.emit(...args);
    } else {
      this.workerManager.broadcast("Emit", clientId, ...args);
    }
  }

  /**
   * @description 클라이언트 매니저를 반환합니다
   * @returns {ClientManager} returns Client Manager
   */
  getClientManager() {
    return this.clientManager;
  }

  /**
   * @description 룸매니저를 반환합니다
   * @returns {RoomManager} returns Room Manager
   */
  getRoomManager() {
    return this.roomManager;
  }

  /**
   * @description 서버를 실행합니다
   */
  async run() {
    await this.workerManager.run();
    await this.clientManager.run();

    console.log(
      `Client Server open at ws://localhost:${this.clientManager.port}`
    );
  }
}

exports.ClutserManager = ClutserManager;
