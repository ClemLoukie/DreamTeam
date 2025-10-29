const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

const host = "http://localhost:4567";
const todosEndpoint = "/todos";
const projectsEndpoint = "/projects";
const categsEndpoint = "/categories";
const projTodoRelationship = "tasks";
const todoProjRelationship = "tasksof";
const categoriesRelationship = "categories";
const categProjRelationship = "projects";
const categTodosRelationship = "todos";


// These 2 global variables are imported in the general shared step defs file
// as well as the story 1 and story 2 specific step defs files, because, all stories and scenario outlines
// will have an ending sentence describing that: the student is notified of the success of the creation operation (return code 201)/of the success of the request (return code 200)/
//of the non-existence error w/ a <message> (return code 404), so they share step definitions which are found in he stepDefs.js file
// and these step defs they ALL share, have to handle and check the same return code or error message variables which are updated by all files and stories
// so all the story step def files (for story 1, 2, 3, 4....) will import returnCode and errorMessage variables from the TestUtil.js file and update those 2 variables
// that way the common step defs tht use these variables and are defined in stepDefs.js will see these updates
let returnCode = {
  value: 200,
};

let errorMessage = {
  value: "",
};

async function getTODOIdByTitle(todoTitle) {
  response = await chai
    .request(host)
    .get(todosEndpoint)
    .query({ title: todoTitle });

  expect(response).to.have.status(200);
  expect(response.body.todos[0].title).to.equal(todoTitle);
  return response.body.todos[0].id;
}

async function getProjIdByCourseName(course) {
  response = await chai
    .request(host)
    .get(projectsEndpoint)
    .query({ title: course });

  expect(response).to.have.status(200);
  expect(response.body.projects[0].title).to.equal(course);
  return response.body.projects[0].id;
}

async function getProjIdByDescription(course) {
  response = await chai
    .request(host)
    .get(projectsEndpoint)
    .query({ description: course });

  expect(response).to.have.status(200);
  expect(response.body.projects[0].description).to.equal(course);
  return response.body.projects[0].id;
}

async function getCategIdByTitle(categTitle) {
  response = await chai
    .request(host)
    .get(categsEndpoint)
    .query({ title: categTitle });

  expect(response).to.have.status(200);
  expect(response.body.categories[0].title).to.equal(categTitle);
  return response.body.categories[0].id;
}

module.exports = {
  host: host,
  todosEndpoint: todosEndpoint,
  projectsEndpoint: projectsEndpoint,
  categsEndpoint: categsEndpoint,
  projTodoRelationship: projTodoRelationship,
  todoProjRelationship: todoProjRelationship,
  categoriesRelationship: categoriesRelationship,
  categProjRelationship: categProjRelationship,
  categTodosRelationship: categTodosRelationship,
  getTODOIdByTitle,
  getProjIdByCourseName,
  getProjIdByDescription,
  getCategIdByTitle,
  returnCode,
  errorMessage,
};
