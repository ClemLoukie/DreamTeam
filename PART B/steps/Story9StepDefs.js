const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { Given, When } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const categsEndpoint = utils.categsEndpoint;
const todosEndpoint = utils.todosEndpoint;
const categoriesRelationship = utils.categoriesRelationship;
const getCategIdByTitle = utils.getCategIdByTitle;

let response;
let returnCode = utils.returnCode;
let errorMsg = utils.errorMessage;

async function createPriorityCateg(categPriorityTitle) {
  response = await chai
    .request(host)
    .post(categsEndpoint)
    .send({ title: categPriorityTitle });

  expect(response).to.have.status(201);
  expect(response.body.title).to.equal(categPriorityTitle);
}

Given("categories LOW, MEDIUM, and HIGH exist", async function () {
  await createPriorityCateg("LOW");
  await createPriorityCateg("MEDIUM");
  await createPriorityCateg("HIGH");
});

Given("the task with ID of {int} has a priority of {string}", async function (
  taskID,
  priority
) {
  const categoryID = await getCategIdByTitle(priority);

  response = await chai
    .request(host)
    .post(`${todosEndpoint}/${taskID}/${categoriesRelationship}`)
    .send({ id: categoryID });
  expect(response).to.have.status(201);
});

Given("current priority {string} is equal to {string}", function (
  currPriority,
  priority
) {
  expect(currPriority).to.equal(priority);
});

When(
  "the student requests to delete priority of {string} from task with {int}",
  async function (priority, taskID) {
    const categoryID = await getCategIdByTitle(priority);

    response = await chai
      .request(host)
      .delete(
        `${todosEndpoint}/${taskID}/${categoriesRelationship}/${categoryID}`
      );
    returnCode.value = response.status;
    if (response.body.errorMessages) {
      errorMsg.value = response.body.errorMessages[0];
    }
  }
);

When(
  "the student requests to add priority of {string} to task of {int}",
  async function (priority, taskID) {
    const categoryID = await getCategIdByTitle(priority);

    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${taskID}/${categoriesRelationship}`)
      .send({ id: categoryID });

    returnCode.value = response.status;
  }
);
