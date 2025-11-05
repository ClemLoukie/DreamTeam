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
  "the student requests to update the activity status of project with id {string} to {string} with JSON",
  async function (id, activity_status) {

    const body = { active: activity_status === "true" };

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
  "the activity status of project with id {string} is set to {string}",
  async function (id, activity_status) {

    const res = await chai
      .request(host)
      .get(`${projectsEndpoint}/${id}`)
      .set("Accept", "application/json");

    expect(res.body.projects?.[0]?.active).to.equal(activity_status);
  }
);



//
// Alternate FLOW: Create with XML
//
When(
  "the student requests to update the activity status of project with id {string} to {string} with XML",
  async function (id, activity_status) {
    const xmlBody = `<project><active>${activity_status}</active></project>`;

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



When(
  "the student requests to update the activity status of a non existent project with id {string} to {string} with JSON",
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