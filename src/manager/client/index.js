const { Server } = require("ws");
const { v4 } = require("uuid");
const { Client } = require("./client");

class ClientManager {
  port;

  server;
  clients;

  onConnection;
  onOpen;
  onClose;

  constructor(port) {
    this.port = port;
    this.clients = {};
  }

  /**
   * @description 서버를 실행합니다
   */
  run() {
    this.server = new Server({ port: this.port });

    this.server.on("listening", () => {
      if (this.onOpen) {
        this.onOpen();
      }
    });

    this.server.on("close", () => {
      if (this.onClose) {
        this.onClose();
      }
    });

    this.server.on("connection", (socket, req) => {
      const clientId = v4();
      const client = new Client(clientId, socket);

      client.on("disconnection", () => {
        delete this.clients[clientId];
      });

      this.clients[clientId] = client;

      if (this.onConnection) {
        this.onConnection(client);
      }
    });
  }

  /**
   * @description 리스너를 지정합니다
   * @param {"connection" | "open" | "close"} type
   * @param {(client: Client) => void | () => void} callback
   */
  on(type, callback) {
    if (type === "connection") {
      this.onConnection = callback;
    } else if (type === "open") {
      this.onOpen = callback;
    } else if (type === "close") {
      this.onClose = callback;
    }
  }

  /**
   * @description 클라이언트 객체를 받아옵니다.
   * @return {[Client]} clients
   */
  getClients() {
    return Object.values(this.clients);
  }

  /**
   * @description ClientId 를 통해 클라이언트를 받아옵니다.
   * @param {string} clientId
   * @return {Client | undefined}
   */
  getClient(clientId) {
    if (Object.keys(this.clients).includes(clientId)) {
      return this.clients[clientId];
    } else {
      return undefined;
    }
  }

  /**
   *
   * @param  {...string} args
   */
  broadcast(...args) {
    const clients = this.getClients();

    for (const client of clients) {
      client.emit(...args);
    }
  }
}

exports.ClientManager = ClientManager;
