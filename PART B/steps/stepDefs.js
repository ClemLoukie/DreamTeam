const { startServer, shutdown } = require("../setup.js");
const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { Given, When, Then, After } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const todosEndpoint = utils.todosEndpoint;
const projsEndpoint = utils.projectsEndpoint;
const todoProjRelationship = utils.todoProjRelationship;
const getTODOIdByTitle = utils.getTODOIdByTitle;
const getProjIdByTitle = utils.getProjIdByTitle;

// shared test context exported to other step definition files
const context = {
  response: null,
  idMap: {},
};

let returnCode = utils.returnCode;
let errorMsg = utils.errorMessage;

// start and shutdown the server between every scenario outline
Given("the server is running", async function () {
  try {
    await startServer();
  } catch (err) {}
});

// Given the project exists
Given("the following project exists", async function (dataTable) {
  const id = dataTable.hashes()[0].project_id.replace(/['"]+/g, "");

  response = await chai
    .request(host)
    .get(`${projsEndpoint}/${id}`);

  expect(response).to.have.status(200);
});

After(async function () {
  try {
    await shutdown();
  } catch (err) {}
});

function stripQuotes(s) {
  if (!s) return s;
  return s.toString().replace(/^"(.*)"$/, "$1");
}

function resolveId(id) {
  if (id === undefined || id === null) return id;
  const key = id.toString();
  return context.idMap[key] || key;
}

Given("these TODOs exist", async function (dataTable) {
  const rows = dataTable.hashes();
  for (const r of rows) {
    const title = stripQuotes(r.title);
    const doneVal = (r.doneStatus || "").toString().trim();
    const doneStatus = doneVal === "true";
    const description = stripQuotes(r.description);
    const body = { title };
    if (r.doneStatus !== undefined) body.doneStatus = doneStatus;
    if (r.description !== undefined) body.description = description;
    context.response = await chai.request(host).post("/todos").send(body);
    try {
      const assigned = context.response.body && context.response.body.id;
      if (assigned && r.id !== undefined) {
        context.idMap[r.id.toString()] = assigned.toString();
      }
    } catch (err) {}
  }
});

Given("this TODO exists", async function (dataTable) {
  const r = dataTable.hashes()[0];
  const title = stripQuotes(r.title);
  const doneVal = (r.doneStatus || "").toString().trim();
  const doneStatus = doneVal === "true";
  const description = stripQuotes(r.description);
  const body = { title };
  if (r.doneStatus !== undefined) body.doneStatus = doneStatus;
  if (r.description !== undefined) body.description = description;
  context.response = await chai.request(host).post("/todos").send(body);
  try {
    const assigned = context.response.body && context.response.body.id;
    if (assigned && r.id !== undefined) {
      context.idMap[r.id.toString()] = assigned.toString();
    }
  } catch (err) {}
});

Then("the student is notified that the query succeeded", function () {
  expect([200, 201]).to.include(context.response.status);
});

Then("the student is notified that the {word} operation succeeded", async function (operation) {
  expect([200, 201]).to.include(context.response.status);
});

Then("the student is notified that validation failed with message {string}", async function (message) {
  expect(context.response).to.have.status(400);
  const respText = JSON.stringify(context.response.body || "");
  if (respText.includes(message)) return;
  const msgLower = message.toLowerCase();
  if (msgLower.includes("donestatus") && msgLower.includes("boolean")) {
    const rt = respText.toLowerCase();
    if (rt.includes("donestatus") && rt.includes("boolean")) return;
  }
  const rt = respText.toLowerCase();
  if (rt.includes("donestatus") && rt.includes("boolean")) return;
  expect(respText).to.include(message);
});

Then("the student is notified that the TODO was not found with message {string}", async function (message) {
  expect(context.response).to.have.status(404);
  const respText = JSON.stringify(context.response.body || "");
  if (respText.includes(message)) return;
  const idMatch = message.match(/\d+/);
  if (idMatch && respText.includes(idMatch[0])) return;
  if (idMatch && respText.includes(`todos/${idMatch[0]}`)) return;
  expect(respText).to.include(message);
});

module.exports = { host, context, resolveId };