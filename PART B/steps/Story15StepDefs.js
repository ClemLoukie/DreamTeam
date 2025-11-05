const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { Given, When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");


chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const projectsEndpoint = utils.projectsEndpoint;
const getProjIdByTitle = utils.getProjIdByTitle;

let returnCode = utils.returnCode;
let response;
let errorMessage = utils.errorMessage;


Given("the following projects exists", async function (dataTable) {
  const projects = dataTable.hashes(); // turns table into array of objects

  for (const proj of projects) {
    // Clean up quotes and convert strings to booleans safely
    const title = proj.project_title.replace(/['"]+/g, "").trim();
    const completed = String(proj.completed).replace(/['"]+/g, "").trim().toLowerCase() === "true";
    const active = String(proj.active).replace(/['"]+/g, "").trim().toLowerCase() === "true";

    // POST request to create each project
    const res = await chai
      .request(host)
      .post(projectsEndpoint)
      .set("Content-Type", "application/json")
      .send({ title, completed, active });

    expect([200, 201]).to.include(res.status);
  }
});



//
// NORMAL FLOW: Create with JSON
//
When(
  "the student requests to query projects with title {string}",
  async function (title) {

    response = await chai
      .request(host)
      .get(projectsEndpoint)
      .query({ title })
      .set("Content-Type", "application/json");

    returnCode.value = response.status;
    errorMessage.value = response.text;
  }
);

Then("the projects with title {string} are displayed", async function (title) {
  const res =
    response ||
    (await chai
      .request(host)
      .get(projectsEndpoint)
      .query({ title })
      .set("Content-Type", "application/json"));

  expect(res).to.have.status(200);
  expect(res.body).to.have.property("projects");

  const projects = res.body.projects;

  // helpful guard
  expect(projects).to.not.be.undefined;
  expect(projects.length).to.be.greaterThan(0);

  // verify all titles match
  projects.forEach((proj) => {
    expect(proj.title).to.equal(title);
  });
});



//
// ALTERNATE FLOW: Query by completed status
//
When("the student requests to query a project with completed status {string}", async function (completed) {
  response = await chai
    .request(host)
    .get(projectsEndpoint)
    .query({ completed})
    .set("Content-Type", "application/json");

  returnCode.value = response.status;
  errorMessage.value = response.text;
});

Then("the projects with completed status {string} are displayed", async function (completed) {
  // cleanup
  const cleanCompleted = completed.replace(/['"]+/g, "");

  // query all projects first
  const allRes = await chai
    .request(host)
    .get(projectsEndpoint)
    .set("Content-Type", "application/json");

  expect(allRes).to.have.status(200);
  const allProjects = allRes.body.projects || [];
  allProjects.forEach((proj, index) => {

  });
  // query filtered projects based on parameter
  const res =
    response ||
    (await chai
      .request(host)
      .get(projectsEndpoint)
      .query({ completed: cleanCompleted === "true" })
      .set("Content-Type", "application/json"));

  // check response
  expect(res).to.have.status(200);
  expect(res.body).to.have.property("projects");

  const projects = res.body.projects;
  expect(projects).to.not.be.undefined;
  expect(projects.length).to.be.greaterThan(0);

  // values match the expected query
  projects.forEach((proj, index) => {
    const matches = String(proj.completed) === String(cleanCompleted);

    expect(String(proj.completed)).to.equal(String(cleanCompleted));
  });

});


//
// ERROR FLOW: Create with JSON suing XML
//

When(
  "the student requests to query a project with non existent parameter of value {string}",
  async function (non_existent) {
    response = await chai
      .request(host)
      .get(projectsEndpoint)
      .query({ fakeParam: non_existent }) // send a non-existent parameter
      .set("Content-Type", "application/json");

    returnCode.value = response.status;
    errorMessage.value = response.text;
  }
);

Then("a list of projects is displayed", async function () {
  const res =
    response ||
    (await chai
      .request(host)
      .get(projectsEndpoint)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json"));

  expect(res).to.have.status(200);
  expect(res.body).to.have.property("projects");

  const projects = res.body.projects;

  expect(projects).to.not.be.undefined;
  expect(projects.length).to.be.greaterThan(0);

});


