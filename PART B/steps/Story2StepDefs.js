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
const projsEndpoint = utils.projectsEndpoint;
const todoProjRelationship = utils.todoProjRelationship;
const getTODOIdByTitle = utils.getTODOIdByTitle;
const getProjIdByCourseName = utils.getProjIdByCourseName;

let returnCode = utils.returnCode;
let response;
let errorMessage = utils.errorMessage;

async function createProj(course, description) {
  response = await chai
    .request(host)
    .post(projsEndpoint)
    .send({ title: course, description: description });

  expect(response).to.have.status(201);
  expect(response.body.title).to.equal(course);
  expect(response.body.description).to.equal(description);
}

When(
  "a student adds a TODO with id {string} to a course todo list with name {string}",
  async function (nonExistingID, course) {
    let projID = await getProjIdByCourseName(course);
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${nonExistingID}/${todoProjRelationship}`)
      .send({ id: projID });
    errorMessage.value = response.body.errorMessages[0];
    returnCode.value = response.status;
  }
);

Then(
  "the TODO with title {string} is added as a task of the course todo list with name {string}",
  async function (todoTitle, course) {
    let todoID = await getTODOIdByTitle(todoTitle);
    response = await chai
      .request(host)
      .get(`${todosEndpoint}/${todoID}/${todoProjRelationship}`);
    expect(response).to.have.status(200);
    expect(response.body.projects[0].title).to.equal(course);
  }
);

Given(
  "the student creates a course todo list with name {string} and description {string}",
  async function (course, description) {
    await createProj(course, description);
  }
);
