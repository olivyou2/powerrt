# PowerRT
선형적 확장이 가능한 리얼타임 웹소켓 프레임워크

### Worker Manager
Redis 를 통해 각 워커간의 통신을 처리함

### Client Manager
WebSocket 서버를 바인딩하고, 클라이언트와 관련된 통신을 처리함

### Room Manager
클라이언트를 논리적으로 구분하여 효율적인 프로그래밍 가능

### Web Hook Manager
웹 후킹을 통해 HTTP 요청을 WebSocket 패킷으로 변환함

#### Example
````js
const { ClutserManager } = require(".");

const clientManager = clutserManager.getClientManager();
clientManager.on("connection", (client) => {
  client.emit("message", "Welcome!");

  clutserManager.broadcast("message", `${client.clientId} is connected`);
});

await clutserManager.run();

return clutserManager;
````
