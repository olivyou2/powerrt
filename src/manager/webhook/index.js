const express = require("express");

class WebhookManager {
  constructor() {
    this.app = express();
  }

  run() {
    this.app.listen(80, () => {
      //console.log("Webhook is Running...");
    });
  }
}

exports.WebhookManager = WebhookManager;
