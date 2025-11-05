  const { When, Then } = require("@cucumber/cucumber");
  const chai = require("chai");
  const chaiHttp = require("chai-http");
  const expect = chai.expect;
  const utils = require("../TestUtil.js");
  const { host, context, resolveId } = require("./stepDefs");
  chai.use(chaiHttp);
  let returnCode = utils.returnCode;
  
  When(
    "with a description {string}, title {string} and id {int} the user posts a Categor ID",
    async function (description, title, id) {
      const rid = resolveId(id);
      body = {
        title: "not bob", 
        description: "is bob"
      };
      await chai.request(host).post("/categories").send(body);
      await chai.request(host).post("/categories").send(body);
      await chai.request(host).post("/categories").send(body);
      await chai.request(host).post("/categories").send(body);
      await chai.request(host).post("/categories").send(body);
      await chai.request(host).post("/categories").send(body);
      body = {
        title: title, 
        description: description
      };
      context.response = await chai.request(host).post(`/categories/${rid}`).send(body);
      returnCode.value = context.response.status;
    }
  );
  
  When(
      "with a title {string} and id {int} the user posts a Categor ID",
      async function (title, id) {
        const rid = resolveId(id);
        body = {
            title: "not bob", 
            description: "is bob"
          };
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
        body = {
          title: title
        };
        context.response = await chai.request(host).post(`/categories/${rid}`).send(body);
        returnCode.value = context.response.status;
      }
    );
  
    When(
      "with a description {string} and id {int} the user posts a Categor ID",
      async function (description, id) {
        const rid = resolveId(id);
        const body = {
          description: description
        };
        context.response = await chai.request(host).post(`/categories/${rid}`).send(body);
        returnCode.value = context.response.status;
      }
    );
  
  
    Then("there is returns 404", function () {
      expect(returnCode.value).to.equal(404);
    });
  