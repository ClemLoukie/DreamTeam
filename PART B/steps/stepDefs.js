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
