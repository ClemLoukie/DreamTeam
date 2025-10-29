const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { Given, When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const todosEndpoint = utils.todosEndpoint;
const todoProjRelationship = utils.todoProjRelationship;
const getTODOIdByTitle = utils.getTODOIdByTitle;
const getProjIdByTitle = utils.getProjIdByCourseName;

let returnCode = utils.returnCode;
let errorMsg = utils.errorMessage;
let response;

Given("TODOs with titles associated with courses", async function (dataTable) {
  var todoProjToCreate = dataTable.hashes();
  for (let i = 0; i < todoProjToCreate.length; i++) {
    let todoId = await getTODOIdByTitle(todoProjToCreate[i].title);
    let courseId = await getProjIdByTitle(todoProjToCreate[i].course);
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${todoId}/${todoProjRelationship}`)
      .send({ id: courseId });

    expect(response).to.have.status(201);
  }
});

When(
  "a student removes a TODO with id {string} from a course todo list with name {string}",
  async function (nonExistingId, course) {
    let courseId = await getProjIdByTitle(course);
    response = await chai
      .request(host)
      .delete(
        `${todosEndpoint}/${nonExistingId}/${todoProjRelationship}/${courseId}`
      );

    returnCode.value = response.status;
    errorMsg.value = response.text;
  }
);

When(
  "a student removes a TODO with title {string} from a course todo list with name {string}",
  async function (title, course) {
    let todoId = await getTODOIdByTitle(title);
    let courseId = await getProjIdByTitle(course);
    response = await chai
      .request(host)
      .delete(`${todosEndpoint}/${todoId}/${todoProjRelationship}/${courseId}`);

    returnCode.value = response.status;
  }
);

Then(
  "the TODO with title {string} is removed from the course todo list with name {string}",
  async function (title, course) {
    let todoId = await getTODOIdByTitle(title);
    let courseId = await getProjIdByTitle(course);
    response = await chai
      .request(host)
      .get(`${todosEndpoint}/${todoId}/${todoProjRelationship}`);

    expect(response).to.have.status(200);
    for (let i = 0; i < response.body.projects; i++) {
      expect(response.body.projects[i].id).to.not.equal(courseId);
    }
  }
);
