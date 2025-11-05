const { When, Then } = require("@cucumber/cucumber");
  const chai = require("chai");
  const chaiHttp = require("chai-http");
  const expect = chai.expect;
  const utils = require("../TestUtil.js");
  const { host, context, resolveId } = require("./stepDefs");
  chai.use(chaiHttp);
  let returnCode = utils.returnCode;

  
  When(
    "the user uses GETs",
    async function () {
      context.response = await chai.request(host).get(`/categories`);
      returnCode.value = context.response.status;
    }
  );
  
  When(
      "the user GETs with an ID {int}",
      async function (id) {
        const body = {
            title: "not bob", 
            description: "is bob"
          };
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
        const rid = resolveId(id);
        context.response = await chai.request(host).get(`/categories/${rid}`);
        returnCode.value = context.response.status;
      }
    );
  
    When(
      "the user GETS an invalid ID {int}",
      async function (id) {
        const rid = resolveId(id);
        context.response = await chai.request(host).get(`/categories/${rid}`);
        returnCode.value = context.response.status;
      }
    );

  
  
    Then("there is error 404", function () {
      expect(returnCode.value).to.equal(404);
    });