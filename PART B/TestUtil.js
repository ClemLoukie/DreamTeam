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


// variables used to store returnC code and errorMessage
let returnCode = {
  value: 200,
};

let errorMessage = {
  value: "",
};

// Helper function called in stories 11 to 15
async function getProjIdByTitle(course) {
  const response = await chai
    .request(host)
    .get(projectsEndpoint)
    .query({ title: course });

  expect(response).to.have.status(200);
  expect(response.body.projects[0].title).to.equal(course);
  return response.body.projects[0].id;
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
  getProjIdByTitle,
  returnCode,
  errorMessage,
};
