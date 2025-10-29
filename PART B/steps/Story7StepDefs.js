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
const projTodoRelationship = utils.projTodoRelationship;

let response;
let returnCode = utils.returnCode;
let errorMsg = utils.errorMessage;

const todo2 = {
  id: "2",
  title: "file paperwork",
  doneStatus: "false",
  description: "",
  tasksof: [
    {
      id: "1",
    },
  ],
};

const todo1 = {
  id: "1",
  title: "scan paperwork",
  doneStatus: "false",
  description: "",
  tasksof: [
    {
      id: "1",
    },
  ],
  categories: [
    {
      id: "1",
    },
  ],
};

Given("the following incomplete tasks exist", async function (dataTable) {
  var todos = dataTable.hashes();
  for (let i = 0; i < todos.length; i++) {
    response = await chai.request(host).get(todosEndpoint);

    expect(response).to.have.status(200);
    expect(response.body.todos).to.deep.equalInAnyOrder([todo1, todo2]);
  }
});

Given(
  "the following incomplete tasks are part of the following course todo list",
  async function (dataTable) {
    var rls = dataTable.hashes();
    response = await chai
      .request(host)
      .get(
        `${projsEndpoint}/${rls.project_id}/${projTodoRelationship}?doneStatus=false`
      );
    expect(response.body.todos).to.deep.equalInAnyOrder([todo1, todo2]);
  }
);

Then(
  "the system displays the following list of incomplete tasks",
  async function () {
    expect(response.body.todos).to.deep.equalInAnyOrder([todo2, todo1]);
  }
);

Then("the system returns an empty list of tasks", async function () {
  const expected = {
    todos: [],
  };
  expect(response.body).to.equalInAnyOrder(expected);
});

Given(
  "a class with id {string} and title {string} with all tasks belonging to it being complete",
  async function (courseId, courseTitle) {
    response = await chai
      .request(host)
      .post(`${projsEndpoint}`)
      .send({ title: courseTitle });
    expect(response).to.have.status(201);
    expect(response.body.id).to.equal(courseId);
    response = await chai
      .request(host)
      .post(`${todosEndpoint}`)
      .send({ title: "Review notes", doneStatus: true });
    expect(response).to.have.status(201);
    let newTodoId = response.body.id;

    response = await chai
      .request(host)
      .post(`${projsEndpoint}/${courseId}/${projTodoRelationship}`)
      .send({ id: newTodoId });

    expect(response).to.have.status(201);
  }
);

Given("a project with ID of {string} does not exist", async function (
  project_id
) {
  response = await chai.request(host).get(`${projsEndpoint}/${project_id}`);
  const expected = {
    errorMessages: [`Could not find an instance with projects/${project_id}`],
  };
  expect(response).to.have.status(404);
  expect(response.body).to.deep.equal(expected);
});

// Used in story 7 and 8
When(
  "the student requests to query incomplete tasks for the project {string}",
  async function (project_id) {
    response = await chai
      .request(host)
      .get(
        `${projsEndpoint}/${project_id}/${projTodoRelationship}?doneStatus=false`
      );
    if (response.body.errorMessages) {
      errorMsg.value = response.body.errorMessages[0];
    }
    returnCode.value = response.status;
  }
);
