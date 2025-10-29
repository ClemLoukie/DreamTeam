const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const projectsEndpoint = utils.projectsEndpoint;
const getProjIdByTitle = utils.getProjIdByCourseName;
const getProjIdByDescription = utils.getProjIdByDescription;

let returnCode = utils.returnCode;
let response;
let errorMessage = utils.errorMessage;

When(
  "a student creates a new course todo list with {string}, {string}, {string}, and {string}",
  async function (title, completed, description, activeStatus) {
    completed = completed === "false" ? false : true;
    activeStatus = activeStatus === "false" ? false : true;
    response = await chai.request(host).post(projectsEndpoint).send({
      title: title,
      completed: completed,
      description: description,
      active: activeStatus,
    });

    returnCode.value = response.status;
  }
);

When(
  "a student creates a new course todo list with {string}, {string}, {string}, and wrong {string}",
  async function (title, completed, description, badActiveStatus) {
    completed = completed === "false" ? false : true;
    response = await chai.request(host).post(projectsEndpoint).send({
      title: title,
      completed: completed,
      description: description,
      active: badActiveStatus,
    });

    errorMessage.value = response.body.errorMessages[0];
    returnCode.value = response.status;
  }
);

When(
  "a student creates a new course todo list with {string}, {string}, and {string}",
  async function (completed, description, activeStatus1) {
    completed = completed === "false" ? false : true;
    let activeStatus = activeStatus1 === "false" ? false : true;
    response = await chai.request(host).post(projectsEndpoint).send({
      completed: completed,
      description: description,
      active: activeStatus,
    });
    returnCode.value = response.status;
  }
);

Then(
  "the course todo list is created with {string}, {string}, {string}, and {string}",
  async function (title, completed, description, activeStatus) {
    let projId = await getProjIdByTitle(title);
    response = await chai.request(host).get(`${projectsEndpoint}/${projId}`);

    expect(response).to.have.status(200);
    expect(response.body.projects[0].title).to.equal(title);
    expect(response.body.projects[0].completed).to.equal(completed);
    expect(response.body.projects[0].active).to.equal(activeStatus);
    expect(response.body.projects[0].description).to.equal(description);
  }
);

Then(
  "the course todo list is created with {string}, {string}, and {string}",
  async function (completed, description, activeStatus) {
    let projId = await getProjIdByDescription(description);
    response = await chai.request(host).get(`${projectsEndpoint}/${projId}`);

    expect(response).to.have.status(200);
    expect(response.body.projects[0].completed).to.equal(completed);
    expect(response.body.projects[0].active).to.equal(activeStatus);
    expect(response.body.projects[0].description).to.equal(description);
  }
);
