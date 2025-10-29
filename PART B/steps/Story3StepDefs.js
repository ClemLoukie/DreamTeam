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
const getTODOIdByTitle = utils.getTODOIdByTitle;

let returnCode = utils.returnCode;
let response;
let errorMessage = utils.errorMessage;

When(
  "a student assigns a doneStatus {string} to the todo with id {string}",
  async function (doneStatus1, nonExistingId) {
    doneStatus1 = doneStatus1 === "false" ? false : true;
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${nonExistingId}`)
      .send({ doneStatus: doneStatus1 });

    errorMessage.value = response.body.errorMessages[0];
    returnCode.value = response.status;
  }
);

Then(
  "the todo with title {string} is now set to doneStatus {string}",
  async function (title, doneStatus1) {
    let todoId = await getTODOIdByTitle(title);
    response = await chai.request(host).get(`${todosEndpoint}/${todoId}`);
    expect(response).to.have.status(200);
    expect(response.body.todos[0].doneStatus).to.equal(doneStatus1);
  }
);
