const { Client } = require("../client/client");

class Room {
  name;
  clients;

  onConnection;
  onDisconnection;

  /**
   *
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
    this.clients = [];
  }

  /**
   *
   * @param {Client} client
   * @returns
   */
  participate(client) {
    if (this.clients.includes(client)) {
      return;
    }

    this.clients.push(client);
    if (this.onConnection) {
      this.onConnection(client);
    }
  }

  /**
   *
   * @param {Client} client
   */
  exit(client) {
    if (this.clients.includes(client)) {
      this.clients.splice(
        this.clients.findIndex((c) => c === client),
        1
      );
      if (this.onDisconnection) {
        this.onDisconnection(client);
      }
    }
  }

  /**
   *
   * @param {"connection"|"disconnection"} type
   * @param {(client: Client)=>void} callback
   */
  on(type, callback) {
    if (type === "connection") {
      this.onConnection = callback;
    } else if (type === "disconnection") {
      this.onDisconnection = callback;
    }
  }

  /**
   * @description 브로드캐스팅 합니다
   * @param  {...string} args
   */
  broadcast(...args) {
    for (const client of this.clients) {
      client.emit(...args);
    }
  }
}

exports.Room = Room;
