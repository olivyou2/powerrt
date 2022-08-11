const { WebSocket } = require("ws");
const { Util } = require("../util");

class Worker {
  id;
  workerUrl;
  socket;

  onError;
  onConnect;
  onData;

  constructor(id, workerUrl) {
    this.id = id;
    this.workerUrl = workerUrl;
  }

  /**
   *
   * @param {"error" | "connect" | "data"} type
   * @param {(...args: string[])=>void} callback
   */
  on(type, callback) {
    if (type === "error") {
      this.onError = callback;
    } else if (type === "connect") {
      this.onConnect = callback;
    } else if (type === "data") {
      this.onData = callback;
    }
  }

  /**
   * @description 데이터를 전송합니다
   * @param {...string} args
   */
  emit(...args) {
    const json = JSON.stringify(args);
    this.socket.send(json, (err) => {
      if (err) {
        Util.log("SEND ERROR: " + err.toString());
      }
    });
  }

  /**
   * @description 워커에 연결합니다
   */
  connect() {
    try {
      const socket = new WebSocket(this.workerUrl);
      this.socket = socket;

      socket.onerror = () => {
        this.onError();
      };

      socket.onclose = () => {
        this.onError();
      };

      socket.onopen = () => {
        this.onConnect();
      };
    } catch {}
  }
}

exports.Worker = Worker;
