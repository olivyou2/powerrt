const { ClutserManager, WebhookManager } = require(".");

const serverRun = async () => {
  const clutserManager = new ClutserManager();

  const clientManager = clutserManager.getClientManager();
  clientManager.on("connection", (client) => {
    client.emit("message", "Welcome!");

    clutserManager.broadcast("message", `${client.clientId} is connected`);
  });

  await clutserManager.run();

  return clutserManager;
};

const testCase = async () => {
  //await clean();
  await serverRun();
  await serverRun();
  await serverRun();
  const cluster = await serverRun();

  const webhookManager = new WebhookManager();
  webhookManager.app.get("/:message", (req, res) => {
    cluster.broadcast("message", req.params.message);
  });
  webhookManager.run();
};

testCase().then(() => {
  //console.log("Server is running");
});
