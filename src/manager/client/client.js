const { WebSocket } = require("ws");
const { Util } = require("../util");

class Client {
  clientId;
  socket;

  onConnect;
  onDisconnect;
  onData;

  /**
   * @param {string} clientId
   * @param {WebSocket} socket
   */
  constructor(clientId, socket) {
    this.clientId = clientId;
    this.socket = socket;

    this.onConnect = [];
    this.onDisconnect = [];
    this.onData = [];

    this.socket.on("open", () => {
      for (const func of this.onConnect) {
        func();
      }
    });

    this.socket.on("close", () => {
      for (const func of this.onDisconnect) {
        func();
      }
    });

    this.socket.on("message", (data) => {
      if (this.onData) {
        const json = JSON.parse(data.toString());

        for (const func of this.onData) {
          func(...json);
        }
      }
    });
  }

  /**
   * @description 이벤트를 연결합니다.
   * @param {"connection" | "disconnection" | "data"} type
   * @param {(...args: string[]) => void} callback
   */
  on(type, callback) {
    if (type === "connection") {
      this.onConnect.push(callback);
    } else if (type === "disconnection") {
      this.onDisconnect.push(callback);
    } else if (type === "data") {
      this.onData.push(callback);
    }
  }

  /**
   * @description 클라이언트에 메시지를 전달합니다
   * @param  {...string} args
   */
  emit(...args) {
    this.socket.send(JSON.stringify(args), (err) => {
      if (err) {
        Util.log("CLIENT SEND ERROR :" + err);
      }
    });
  }
}

exports.Client = Client;
