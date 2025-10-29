const chai = require("chai");
const chaiHttp = require("chai-http");
const constants = require("./TestUtil.js");
const child_process = require("child_process");

chai.use(chaiHttp);

async function startServer() {
  child_process.spawn("java", ["-jar", "runTodoManagerRestAPI-1.5.5.jar"]);
  let serverReady = false;
  while (!serverReady) {
    try {
      await chai.request(constants.host).get(constants.categsEndpoint);
      serverReady = true;
    } catch (err) {}
  }
}

async function shutdown() {
  try {
    await chai.request(constants.host).get("/shutdown");
  } catch (err) {}
}

module.exports = { startServer, shutdown };
