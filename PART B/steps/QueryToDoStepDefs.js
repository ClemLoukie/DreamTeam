const { When, Then } = require("@cucumber/cucumber");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const { host, context, resolveId } = require("./stepDefs");

When("all TODOs are requested", async function () {
  context.response = await chai.request(host).get("/todos");
});

When("the TODO with id {string} is requested", async function (id) {
  const rid = resolveId(id);
  context.response = await chai.request(host).get(`/todos/${rid}`);
});

When("the TODO with id {int} is requested", async function (id) {
  const rid = resolveId(id);
  context.response = await chai.request(host).get(`/todos/${rid}`);
});

Then("all existing TODOs are returned", async function () {
  expect(context.response).to.have.status(200);
  expect(context.response.body.todos).to.be.an("array");
});

Then("the TODO with id {string} is returned", async function (id) {
  const rid = resolveId(id);
  expect(context.response).to.have.status(200);
  const b = context.response.body || {};
  const actualId = (
    (b.id !== undefined && b.id) ||
    (b.todos && b.todos[0] && b.todos[0].id) ||
    (b.todo && b.todo.id) ||
    ""
  ).toString();
  expect(actualId).to.equal(rid.toString());
});

Then("the TODO with id {int} is returned", async function (id) {
  const rid = resolveId(id);
  expect(context.response).to.have.status(200);
  const b = context.response.body || {};
  const actualId = (
    (b.id !== undefined && b.id) ||
    (b.todos && b.todos[0] && b.todos[0].id) ||
    (b.todo && b.todo.id) ||
    ""
  ).toString();
  expect(actualId).to.equal(rid.toString());
});
