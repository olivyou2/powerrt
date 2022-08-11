/**
 * Worker Manager JS
 */

const redis = require("redis");

const { v4 } = require("uuid");

const { Util } = require("../util");
const { Worker } = require("./worker");

const { Server } = require("ws");

class WorkerManager {
  client;
  subscribeClient;

  workers;

  serverId;
  serverUrl;
  server;

  onData;

  constructor() {
    this.client = redis.createClient();
    this.subscribeClient = redis.createClient();

    this.workers = {};

    this.client.on("error", (error) => {
      Util.log(error);
    });
  }

  /**
   * @description 워커 매니저를 실행합니다.
   */
  async run() {
    await this.client.connect();
    await this.subscribeClient.connect();

    await this.#readyCallback();
  }

  /**
   * @description Redis 에 등록된 Worker 정보를 초기화합니다.
   */
  async cleanWorker() {
    await this.client.del("Workers");
  }

  /**
   * @description 객체를 닫습니다
   */
  async close() {
    await this.client.quit();
    await this.subscribeClient.quit();

    this.server.close();
  }

  /**
   * @description 리스너를 지정합니다
   * @param {"data"} type
   * @param {(...args: string[]) => void} callback
   */
  on(type, callback) {
    if (type === "data") {
      this.onData = callback;
    }
  }

  /**
   * @description 매시지를 브로드캐스팅합니다.
   * @param {...string} args
   */
  broadcast(...args) {
    const workers = this.getWorkers();

    for (const worker of workers) {
      worker.emit(...args);
    }
  }

  /**
   * @description 워커 정보를 받습니다
   * @return {[Worker]} workers
   */
  getWorkers() {
    return Object.values(this.workers);
  }

  async #createWorker(workerId, workerUrl) {
    const worker = new Worker(workerId, workerUrl);
    worker.on("error", async () => {
      // If worker is unreachable, then delete this worker id
      await this.client.hDel("Workers", workerId);
    });

    worker.on("connect", async () => {
      //console.log(`${this.serverId} => ${workerId} connected`);

      this.workers[workerId] = worker;
    });

    worker.connect();

    return worker;
  }

  async #readyCallback() {
    const serverId = v4();
    this.serverId = serverId;

    const port = Math.floor(Math.random() * 1000) + 23000;
    this.serverUrl = `ws://localhost:${port}`;

    const workers = await this.client.hGetAll("Workers");

    for (const workerId in workers) {
      const workerUrl = workers[workerId];
      await this.#createWorker(workerId, workerUrl);
    }

    await this.subscribeClient.subscribe("newWorker", async (workerInfo) => {
      const splits = workerInfo.split("@");
      const workerId = splits[0];
      const workerUrl = splits[1];

      if (workerId !== this.serverId && workerUrl !== this.serverUrl) {
        await this.#createWorker(workerId, workerUrl);
      }
    });

    const webSocketServer = new Server({ port });
    webSocketServer.on("connection", (ws, req) => {
      ws.on("message", (data) => {
        const str = data.toString();
        const json = JSON.parse(str);

        this.onData(...json);
      });
    });

    this.server = webSocketServer;

    await this.client.hSet("Workers", serverId, `ws://localhost:${port}`);
    await this.client.publish(
      "newWorker",
      this.serverId + "@" + this.serverUrl
    );

    console.log(`Repeater Server open at ${this.serverUrl}`);
  }
}

exports.WorkerManager = WorkerManager;
