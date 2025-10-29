const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { Given, When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const projsEndpoint = utils.projectsEndpoint;
const projTodoRelationship = utils.projTodoRelationship;

let returnCode = utils.returnCode;
let response;
let errorMsg = utils.errorMessage;

Given("the following project exists", async function (dataTable) {
  var id = dataTable.hashes();
  response = await chai
    .request(host)
    .get(`${projsEndpoint}/${id[0].project_id}`);
  expect(response).to.have.status(200);
});

When(
  "the student requests to delete tasks from the project {string}",
  async function (project_id) {
    response = await chai
      .request(host)
      .get(`${projsEndpoint}/${project_id}/${projTodoRelationship}`);
    let taskIds = [];
    response.body.todos.forEach((task) => {
      taskIds.push(task.id);
    });
    for (id of taskIds) {
      response = await chai
        .request(host)
        .delete(`${projsEndpoint}/${project_id}/${projTodoRelationship}/${id}`);
      expect(response).to.have.status(200);
    }
    returnCode.value = response.status;
    if (response.body.errorMessages) {
      errorMsg.value = response.body.errorMessages[0];
    }
  }
);

Given("student is registered in the class with id {string}", async function (
  project_id
) {
  response = await chai.request(host).post(`${projsEndpoint}/${project_id}`);
  expect(response).to.have.status(200);
});

Then(
  "the system returns an empty to do list for the project with id {string}",
  async function (project_id) {
    const expectedList = {
      todos: [],
    };
    response = await chai
      .request(host)
      .get(`${projsEndpoint}/${project_id}/${projTodoRelationship}`);
    expect(response.body).to.equalInAnyOrder(expectedList);
  }
);

When(
  "the student requests to delete project with id {string} to clear up schedule",
  async function (project_id) {
    response = await chai
      .request(host)
      .delete(`${projsEndpoint}/${project_id}`);
    returnCode.value = response.status;
  }
);

When(
  "the student requests to delete nonexistent project {string} to clear up schedule",
  async function (project_id) {
    response = await chai
      .request(host)
      .delete(`${projsEndpoint}/${project_id}`);
    returnCode.value = response.status;
    errorMsg.value = response.body.errorMessages[0];
  }
);
