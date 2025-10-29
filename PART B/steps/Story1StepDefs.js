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
const categsEndpoint = utils.categsEndpoint;
const categoriesRelationship = utils.categoriesRelationship;
const getTODOIdByTitle = utils.getTODOIdByTitle;
const getCategIdByTitle = utils.getCategIdByTitle;

let returnCode = utils.returnCode;
let response;
let errorMessage = utils.errorMessage;

async function createPriorityCateg(categPriorityTitle) {
  response = await chai
    .request(host)
    .post(categsEndpoint)
    .send({ title: categPriorityTitle });

  expect(response).to.have.status(201);
  expect(response.body.title).to.equal(categPriorityTitle);
}

Given("the student creates a category with title {string}", async function (
  priority
) {
  await createPriorityCateg(priority);
});

Given("a category with title {string} exists", async function (title) {
  await createPriorityCateg(title);
  await getCategIdByTitle(title);
});

When(
  "a student assigns priority {string} to the todo with id {string}",
  async function (priority, nonExistingID) {
    let categID = await getCategIdByTitle(priority);
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${nonExistingID}/${categoriesRelationship}`)
      .send({ id: categID });

    errorMessage.value = response.body.errorMessages[0];
    returnCode.value = response.status;
  }
);

When(
  "a student assigns priority {string} to the todo with title {string}",
  async function (priority, todoTitle) {
    let categID = await getCategIdByTitle(priority);
    let todoID = await getTODOIdByTitle(todoTitle);
    response = await chai
      .request(host)
      .post(`${todosEndpoint}/${todoID}/${categoriesRelationship}`)
      .send({ id: categID });
    returnCode.value = response.status;
  }
);

Then(
  "the todo with title {string} is now classified as priority {string}",
  async function (todoTitle, priority) {
    let todoID = await getTODOIdByTitle(todoTitle);
    response = await chai
      .request(host)
      .get(`${todosEndpoint}/${todoID}/${categoriesRelationship}`);
    expect(response.body.categories[0].title).to.equal(priority);
  }
);
