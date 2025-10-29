const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const todosEndpoint = utils.todosEndpoint;

let response;
let returnCode = utils.returnCode;
let errorMsg = utils.errorMessage;

When(
  "a student requests to update the description of task with id {int} to {string}",
  async function (taskID, description) {
    const body = {
      description: description,
    };
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${taskID}`)
      .send(body);
    returnCode.value = response.status;
    if (response.body.errorMessages) {
      errorMsg.value = response.body.errorMessages[0];
    }
  }
);

When(
  "a student requests to update the description of task with id {int} to {string} by overwriting the task with title {string}",
  async function (taskID, description, title) {
    const body = {
      title: title,
      description: description,
    };
    response = await chai
      .request(host)
      .put(`${todosEndpoint}/${taskID}`)
      .send(body);
    returnCode.value = response.status;
  }
);

Then(
  "the description of task with id {int} is set to {string}",
  async function (taskID, description) {
    response = await chai.request(host).get(`${todosEndpoint}/${taskID}`);
    expect(response.body.todos[0].description).to.equal(description);
  }
);
