const { When, Then } = require("@cucumber/cucumber");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const { host, context, resolveId } = require("./stepDefs");

let response;

When("the TODO with id {string} is updated to doneStatus {string}", async function (id, doneStatus) {
  const rid = resolveId(id);
  const body = { doneStatus: doneStatus === "true" };
  context.response = await chai.request(host).put(`/todos/${rid}`).send(body);
});

When("the TODO with id {int} is updated to doneStatus {word}", async function (id, doneStatus) {
  const rid = resolveId(id);
  const body = { doneStatus: doneStatus === "true" };
  context.response = await chai.request(host).put(`/todos/${rid}`).send(body);
});

When("the TODO with id {string} is updated to title {string}", async function (id, title) {
  const rid = resolveId(id);
  const body = { title: title };
  context.response = await chai.request(host).put(`/todos/${rid}`).send(body);
});

When("the TODO with id {int} is updated to title {string}", async function (id, title) {
  const rid = resolveId(id);
  const body = { title: title };
  context.response = await chai.request(host).put(`/todos/${rid}`).send(body);
});

Then("the TODO with id {string} has doneStatus {string}", async function (id, doneStatus) {
  const rid = resolveId(id);
  const res = await chai.request(host).get(`/todos/${rid}`);
  expect(res).to.have.status(200);
  expect(res.body.doneStatus.toString()).to.equal(doneStatus);
});

Then("the TODO with id {int} has doneStatus {word}", async function (id, doneStatus) {
  const rid = resolveId(id);
  const res = await chai.request(host).get(`/todos/${rid}`);
  expect(res).to.have.status(200);
  expect(res.body.doneStatus.toString()).to.equal(doneStatus);
});

Then("the TODO with id {string} has title {string}", async function (id, title) {
  const rid = resolveId(id);
  const res = await chai.request(host).get(`/todos/${rid}`);
  expect(res).to.have.status(200);
  expect(res.body.title).to.equal(title);
});

Then("the TODO with id {int} has title {string}", async function (id, title) {
  const rid = resolveId(id);
  const res = await chai.request(host).get(`/todos/${rid}`);
  expect(res).to.have.status(200);
  expect(res.body.title).to.equal(title);
});
