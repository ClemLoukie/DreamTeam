const { When, Then } = require("@cucumber/cucumber");
  const chai = require("chai");
  const chaiHttp = require("chai-http");
  const expect = chai.expect;
  const utils = require("../TestUtil.js");
  const { host, context, resolveId } = require("./stepDefs");
  chai.use(chaiHttp);
  let returnCode = utils.returnCode;
  

  
  When(
      "the user deletes a Categors ID {int}",
      async function (id) {
        const body = {
            title: "not bob", 
            description: "is bob"
          };
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
        const rid = resolveId(id);
        context.response = await chai.request(host).delete(`/categories/${rid}`);
        returnCode.value = context.response.status;
      }
    );


  When(
    "the user deletes a different Categors ID {int}",
    async function (id) {
        const body = {
            title: "not bob", 
            description: "is bob"
          };
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
          await chai.request(host).post("/categories").send(body);
      const rid = resolveId(id);
      context.response = await chai.request(host).delete(`/categories/${rid}`);
      returnCode.value = context.response.status;
    }
  );


  When(
    "the user deletes an invalid Categors ID {int}",
    async function (id) {
      const rid = resolveId(id);
      context.response = await chai.request(host).delete(`/categories/${rid}`);
      returnCode.value = context.response.status;
    }
  );
  

    Then("there is 200 ok", function () {
        expect(returnCode.value).to.equal(200);
      });
  