const { WebSocket } = require("ws");
const redis = require("redis");

const run = async (port) => {
  const id = Math.floor(Math.random() * 1000);
  const socket = new WebSocket(`ws://localhost:${port}`);

  const send = (...args) => {
    socket.send(JSON.stringify(args));
  };

  socket.onopen = () => {};

  socket.on("message", (data) => {
    const json = JSON.parse(data.toString());

    console.log(id, json);
  });
};

const test = async () => {
  for (let i = 0; i < 1; i++) {
    await run(10182);
    await run(10417);
    await run(10033);
    await run(10710);
  }
};

test().then(() => {
  console.log("Test done");
});
