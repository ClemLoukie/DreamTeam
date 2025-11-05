const { When, Then } = require("@cucumber/cucumber");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const utils = require("../TestUtil.js");
const { host, context, resolveId } = require("./stepDefs");
chai.use(chaiHttp);
let returnCode = utils.returnCode;

When(
  "a description {string} and title {string} are used to create a category",

  async function (title, description) {
    const body = {
      title: title, 
      description: description
    };
    context.response = await chai.request(host).post("/categories").send(body);
    returnCode.value = context.response.status;
  }
);

When(
    "a title {string} is used to create a category",
    async function (title) {
      const body = {
        title: title
      };
      context.response = await chai.request(host).post("/categories").send(body);
      returnCode.value = context.response.status;
    }
  );

  When(
    "a description {string} is used to create a category",
    async function (description) {
      const body = {
        description: description
      };
      context.response = await chai.request(host).post("/categories").send(body);
      returnCode.value = context.response.status;
    }
  );

  Then("there is returns 201", function () {
    expect(returnCode.value).to.equal(201);
  });

  Then("there is returns 200", function () {
    expect(returnCode.value).to.equal(200);
  });

  Then("then status code 400", function () {
    expect(returnCode.value).to.equal(400);
  }); 