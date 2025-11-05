const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const projectsEndpoint = utils.projectsEndpoint;
const getProjIdByTitle = utils.getProjIdByTitle;

let returnCode = utils.returnCode;
let response;
let errorMessage = utils.errorMessage;

//
// NORMAL FLOW: Create with JSON
//
When(
  "a student creates a project with title {string}, completed status {string}, activity status {string}, and description {string} using JSON format",
  async function (title, completed, active, description) {
    completed = completed === "false" ? false : true;
    activeStatus = active === "false" ? false : true;

    response = await chai.request(host).post(projectsEndpoint).set("Content-Type", "application/json").send({ // Novelty: set("Content-Type", "application/json")
      title: title,
      completed: completed,
      description: description,
      active: activeStatus,
    });
    returnCode.value = response.status;
  }
);

Then(
  "the project with title {string}, completed status {string}, activity status {string}, and description {string} is added to the list of project instances",
  async function (title, completed, active, description) {

    let projId = await getProjIdByTitle(title);
    response = await chai.request(host).get(`${projectsEndpoint}/${projId}`);

    expect(response).to.have.status(200);
    expect(response.body.projects[0].title).to.equal(title);
    expect(response.body.projects[0].completed).to.equal(completed);
    expect(response.body.projects[0].active).to.equal(active);
    expect(response.body.projects[0].description).to.equal(description);
  }
);

Then("the status code 201 is returned", function () {
  expect(returnCode.value).to.equal(201);
});


//
// Alternate FLOW: Create with XML
//
When(
  "a student creates a project with title {string}, completed status {string}, activity status {string}, and description {string} using XML format",
  async function (title, completed, active, description) {

    const xmlBody = `
          <project>
            <title>${title}</title>
            <completed>${completed}</completed>
            <active>${active}</active>
            <description>${description}</description>
          </project>
        `;

    response = await chai.request(host).post(projectsEndpoint).set("Content-Type", "application/xml").send(xmlBody);
    returnCode.value = response.status;
  }
);

//
// ERROR FLOW: Create with JSON suing XML
//
When(
  "a student creates a project with title {string} using XML syntax for JSON",
  async function (title) {

    const body = `
          <project>
            <title>${title}</title>
          </project>
        `;

    response = await chai
          .request(host)
          .post(projectsEndpoint)
          .set("Content-Type", "application/json") // wrong content type on purpose
          .send(body);

        returnCode.value = response.status;
        errorMessage.value = response.text;
  }
  );

 Then("the system returns an error message {string}", function (expectedMessage) {
   expect(errorMessage.value).to.include(expectedMessage);
 });


Then("the status code 400 is returned", function () {
  expect(returnCode.value).to.equal(400);
});





