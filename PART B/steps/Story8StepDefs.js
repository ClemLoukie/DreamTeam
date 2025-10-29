const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { Given, When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
const { categoriesRelationship } = require("../TestUtil.js");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const todosEndpoint = utils.todosEndpoint;
const projectsEndpoint = utils.projectsEndpoint;
const projTodoRelationship = utils.projTodoRelationship;
const getCategIdByTitle = utils.getCategIdByTitle;

let returnCode = utils.returnCode;
let response;
let errorMsg = utils.errorMessage;

Given(
  "the task with ID of {int} exists and has a priority of {string} and done status {string}",
  async function (task_id, current_priority, done_status) {
    done_status = done_status === "false" ? false : true;
    body = {
      doneStatus: done_status,
      title: "test",
    };
    response = await chai.request(host).post(`${todosEndpoint}`).send(body);
    const categoryID = await getCategIdByTitle(current_priority);
    await chai
      .request(host)
      .post(`${todosEndpoint}/${task_id}/${categoriesRelationship}`)
      .send({ id: categoryID });
    returnCode.value = response.status;
  }
);

let incompleteList = [];
When(
  "the user requests to query tasks with priority {string} from all registered class",
  async function (current_priority) {
    response = await chai
      .request(host)
      .get(`${todosEndpoint}?doneStatus=false`);
    const categoryID = await getCategIdByTitle(current_priority);
    response.body.todos.forEach((task) => {
      if (task.categories) {
        task.categories.forEach((category) => {
          if (category.id === categoryID) {
            incompleteList.push(task);
          }
        });
      }
    });
    returnCode.value = response.status;
    if (response.body.errorMessages) {
      errorMsg.value = response.body.errorMessages[0];
    }
  }
);

Then(
  "the system returns a list of tasks with incomplete status {string} along with a priority of {string}",
  async function (done_status, current_priority) {
    let testList = [];
    response = await chai
      .request(host)
      .get(`${todosEndpoint}?doneStatus=false`);
    const categoryID = await getCategIdByTitle(current_priority);
    response.body.todos.forEach((task) => {
      if (task.categories) {
        task.categories.forEach((category) => {
          if (category.id === categoryID) {
            testList.push(task);
          }
        });
      }
    });
    expect(testList[0]).to.equalInAnyOrder(incompleteList[0]);
  }
);

Then(
  "the system returns an empty list of tasks with incomplete status {string} along with a priority of {string}",
  async function (done_status, current_priority) {
    let testList = [];
    response = await chai
      .request(host)
      .get(`${todosEndpoint}?doneStatus=false`);
    const categoryID = await getCategIdByTitle(current_priority);
    response.body.todos.forEach((task) => {
      if (task.categories) {
        task.categories.forEach((category) => {
          if (category.id === categoryID) {
            testList.push(task);
          }
        });
      }
    });
    expect(testList.length).to.equal(0);
  }
);

When(
  "the student requests to query incomplete tasks with priority {string} for the project {string}",
  async function (current_priority, project_id) {
    response = await chai
      .request(host)
      .get(
        `${projectsEndpoint}/${project_id}/${projTodoRelationship}?doneStatus=false`
      );
    if (response.body.errorMessages) {
      errorMsg.value = response.body.errorMessages[0];
    }
    returnCode.value = response.status;
  }
);
