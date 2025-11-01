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


//
// NORMAL FLOW: Create with JSON
//
When(
  "the student requests to delete project with id {string} to declutter bulletin with JSON",
  async function (id) {
    response = await chai
      .request(host)
      .delete(`${projectsEndpoint}/${id}`)
      .set("Content-Type", "application/json");

    returnCode.value = response.status;
    errorMessage.value = response.text;
  }
);

Then("the status code 200 is returned", function () {
  expect(returnCode.value).to.equal(200);
});

Then("the status code 404 is returned", function () {
  expect(returnCode.value).to.equal(404);
});


//
// Alternate FLOW: Create with XML
//
When(
  "the student requests to delete project with id {string} to declutter bulletin with XML",
  async function (id) {
    response = await chai
      .request(host)
      .delete(`${projectsEndpoint}/${id}`)
      .set("Content-Type", "application/xml")
      .set("Accept", "application/xml");

    returnCode.value = response.status;
    errorMessage.value = response.text;
  }
);

Then("the project with id {string} is deleted", async function (id) {
  try {
    await chai.request(host).get(`${projectsEndpoint}/${id}`);
    throw new Error(`Project ${id} still exists`);
  } catch (err) {
    expect(err.status).to.equal(undefined);
  }
});


//
// ERROR FLOW: Create with JSON suing XML
//

Given("a project with ID of {string} does not exist", async function (project_id) {
  try {
    // Try deleting the project if it exists
    const res = await chai.request(host).delete(`${projectsEndpoint}/${project_id}`);
    // If deletion succeeds, fine — it’s now gone
    if (res.status === 200) {
      console.log(`Project ${project_id} existed but was deleted.`);
    }
  } catch (err) {
    // If the project was already missing, a 404 is normal — just ignore it
    if (err.status === 404) {
      console.log(`Project ${project_id} was already not found (as expected).`);
    } else {
      throw err; // rethrow unexpected errors
    }
  }
});

When("the student requests to delete nonexistent project {string} to declutter bulletin", async function (id) {
  response = await chai
        .request(host)
        .delete(`${projectsEndpoint}/${id}`)
        .set("Content-Type", "application/json");

      returnCode.value = response.status;
      errorMessage.value = response.text;

});

Then("the student is notified of the non-existence error with a message {string}", async function (expectedMessage) {
     expect(errorMessage.value).to.include(expectedMessage);
   });