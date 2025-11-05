const { When, Then } = require("@cucumber/cucumber");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

const { host, context } = require("./stepDefs");

When(
  "a TODO is created with title {string}, doneStatus {string}, and description {string}",
  async function (title, doneStatus, description) {
    const body = {
      title: title,
      doneStatus: doneStatus, 
      description: description,
    };
    context.response = await chai.request(host).post("/todos").send(body);
  }
);

When(
  /^a TODO is created with title "([^"]+)", doneStatus (true|false), and description "([^"]+)"$/,
  async function (title, doneStatus, description) {
    const body = {
      title: title,
      doneStatus: doneStatus === "true",
      description: description,
    };
    context.response = await chai.request(host).post("/todos").send(body);
  }
);

When("a TODO is created with title {string} and doneStatus {string}", async function (title, doneStatus) {
  const body = {
    title: title,
    doneStatus: doneStatus,
  };
  context.response = await chai.request(host).post("/todos").send(body);
});

When(/^a TODO is created with title "([^"]+)" and doneStatus (true|false)$/, async function (title, doneStatus) {
  const body = {
    title: title,
    doneStatus: doneStatus === "true",
  };
  context.response = await chai.request(host).post("/todos").send(body);
});

Then("the TODO with title {string} exists", async function (title) {
  const check = await chai.request(host).get("/todos").query({ title: title });
  expect(check).to.have.status(200);
  const match = check.body.todos.find((t) => t.title === title);
  expect(match).to.not.be.undefined;
});