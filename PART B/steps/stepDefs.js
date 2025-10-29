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
const getProjIdByCourseName = utils.getProjIdByCourseName;

let returnCode = utils.returnCode;
let errorMsg = utils.errorMessage;

// These return code global variables are to be used in the step defs below which are shared by everyone and that check
// that the return codes are correct
const createSuccess = 201;
const returnedResourceSuccess = 200;
const notFoundError = 404;
const badRequest = 400;

Given("TODOs with the following details exist", async function (dataTable) {
  var todosToCreate = dataTable.hashes();

  for (let i = 0; i < todosToCreate.length; i++) {
    todosToCreate[i].doneStatus =
      todosToCreate[i].doneStatus === "false" ? false : true;

    response = await chai
      .request(host)
      .post(todosEndpoint)
      .send(todosToCreate[i]);

    expect(response).to.have.status(201);
    expect(response.body.title).to.deep.equalInAnyOrder(todosToCreate[i].title);
  }
});

Given(
  "course todo list projects with the following details exist",
  async function (dataTable) {
    var projsToCreate = dataTable.hashes();

    for (let i = 0; i < projsToCreate.length; i++) {
      projsToCreate[i].completed =
        projsToCreate[i].completed === "false" ? false : true;
      projsToCreate[i].active =
        projsToCreate[i].active === "false" ? false : true;

      response = await chai
        .request(host)
        .post(projsEndpoint)
        .send(projsToCreate[i]);
      expect(response).to.have.status(201);
      expect(response.body.title).to.deep.equalInAnyOrder(
        projsToCreate[i].title
      );
    }
  }
);

Given("a TODO with id {string} does not exist", async function (nonExistingID) {
  response = await chai.request(host).get(`${todosEndpoint}/${nonExistingID}`);
  const expected = {
    errorMessages: [`Could not find an instance with todos/${nonExistingID}`],
  };
  expect(response).to.have.status(404);
  expect(response.body).to.deep.equal(expected);
});

//For stories 9,10
Given("a task with ID equal to {int} exists", async function (taskID) {
  response = await chai.request(host).get(`${todosEndpoint}/${taskID}`);
  expect(response).to.have.status(200);
});

Given("a task with ID equal to {int} does not exist", async function (taskID) {
  response = await chai.request(host).get(`${todosEndpoint}/${taskID}`);
  const expected = {
    errorMessages: [`Could not find an instance with todos/${taskID}`],
  };
  expect(response).to.have.status(404);
  expect(response.body).to.deep.equal(expected);
});

// These 2 step defs are shared by everyone and use returnCode and errorMsg which are global variables imported from TestUtil
// In stories 2 and 3
When(
  "a student adds a TODO with title {string} to a course todo list with name {string}",
  async function (todoTitle, course) {
    let projID = await getProjIdByCourseName(course);
    let todoID = await getTODOIdByTitle(todoTitle);
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${todoID}/${todoProjRelationship}`)
      .send({ id: projID });
    returnCode.value = response.status;
  }
);

// In stories 3 and 4
When(
  "a student assigns a doneStatus {string} to a TODO with title {string}",
  async function (doneStatus1, title) {
    let todoId = await getTODOIdByTitle(title);
    doneStatus1 = doneStatus1 === "false" ? false : true;
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${todoId}`)
      .send({ doneStatus: doneStatus1 });

    returnCode.value = response.status;
  }
);

// These 3 step defs are shared by everyone and use returnCode and errorMsg which are global variables imported from TestUtil
// the specific stories (like 1 and 2) modify these imported global variables, so this stepDefs.js file knows about all the changes through these global variables
Then(
  "the student is notified of the completion of the creation operation",
  function () {
    expect(returnCode.value).to.equal(createSuccess);
  }
);

Then(
  "the student is notified of the completion of the deletion operation",
  function () {
    expect(returnCode.value).to.equal(returnedResourceSuccess);
  }
);

Then(
  "the student is notified of the completion of the update operation",
  function () {
    expect([createSuccess, returnedResourceSuccess]).to.include(
      returnCode.value
    );
  }
);

Then(
  "the student is notified of the non-existence error with a message {string}",
  function (expectedErrorMsg) {
    expect(returnCode.value).to.equal(notFoundError);
    expect(errorMsg.value).to.deep.equal(expectedErrorMsg);
  }
);

// BUG
// EXPECTED BEHAVIOR: Return Code = 400 and Error Message = "Could not find [resource name]"
// ACTUAL BEHAVIOR: Return Code = 200
Then("the student is notified of the non-existence error", function () {
  expect(returnCode.value).to.equal(returnedResourceSuccess);
});

Then(
  "the student is notified of the failed validation with a message {string}",
  function (expectedErrorMsg) {
    expect(returnCode.value).to.equal(badRequest);
    expect(errorMsg.value).to.deep.equal(expectedErrorMsg);
  }
);

Then(
  "the student is notified of the completion of the query operation",
  function () {
    expect(returnCode.value).to.equal(returnedResourceSuccess);
  }
);

// start and shutdown the server between every scenario outline
Given("the server is running", async function () {
  try {
    await startServer();
  } catch (err) {}
});

// used in story 7 and 8 for multiple scenarios
Given("the task with ID of {int} has a status of {string}", async function (
  task_id,
  done_status
) {
  done_status = done_status === "false" ? false : true;
  response = await chai
    .request(host)
    .post(`${todosEndpoint}/${task_id}`)
    .send({ doneStatus: done_status });
  expect(response).to.have.status(200);
});

After(async function () {
  try {
    await shutdown();
  } catch (err) {}
});
