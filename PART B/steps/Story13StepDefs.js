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
  "the student requests to update the description of project with id {string} to {string} with JSON",
  async function (id, description) {

    const body = { description };

    response = await chai
      .request(host)
      .put(`${projectsEndpoint}/${id}`)
      .set("Content-Type", "application/json")
      .send(body);

    returnCode.value = response.status;
    errorMessage.value = response.text;
  }
);

Then(
  "the description of project with id {string} is set to {string}",
  async function (id, description) {

    const res = await chai
      .request(host)
      .get(`${projectsEndpoint}/${id}`)
      .set("Accept", "application/json");

    expect(res.body.projects?.[0]?.description).to.equal(description);
  }
);



//
// Alternate FLOW: Create with XML
//
When(
  "the student requests to update the description of project with id {string} to {string} with XML",
  async function (id, description) {
    const xmlBody = `<project><description>${description}</description></project>`;

    response = await chai
      .request(host)
      .put(`${projectsEndpoint}/${id}`)
      .set("Content-Type", "application/xml")
      .set("Accept", "application/xml")
      .send(xmlBody);

    returnCode.value = response.status;
    errorMessage.value = response.text;
  }
);



//
// ERROR FLOW: Create with JSON suing XML
//

Given("a project with ID equal to {string} does not exist", async function (project_id) {
  const id = project_id.replace(/['"]+/g, "");
  try {
    const res = await chai.request(host).get(`${projectsEndpoint}/${id}`);
    if (res.status === 200) {
      await chai.request(host).delete(`${projectsEndpoint}/${id}`);
    }
  } catch (err) {
    if (err.status === 404) {
    } else {
      throw err;
    }
  }
});


When(
  "the student requests to update the description of the non existent project with id {string} to {string} with JSON",
  async function (id, description) {
    const body = { description };

    response = await chai
      .request(host)
      .put(`${projectsEndpoint}/${id}`)
      .set("Content-Type", "application/json")
      .send(body);

    returnCode.value = response.status;
    errorMessage.value = response.text;
  }
);