const { When, Then } = require("@cucumber/cucumber");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const { host, context, resolveId } = require("./stepDefs");

let response;

When("the TODO with id {string} is deleted", async function (id) {
  const rid = resolveId(id);
  context.response = await chai.request(host).delete(`/todos/${rid}`);
});

When("the TODO with id {int} is deleted", async function (id) {
  const rid = resolveId(id);
  context.response = await chai.request(host).delete(`/todos/${rid}`);
});

Then("the TODO with id {string} no longer exists", async function (id) {
  const rid = resolveId(id);
  const res = await chai.request(host).get(`/todos/${rid}`);
  expect(res).to.have.status(404);
});

Then("the TODO with id {int} no longer exists", async function (id) {
  const rid = resolveId(id);
  const res = await chai.request(host).get(`/todos/${rid}`);
  expect(res).to.have.status(404);
});
