const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const utils = require("../TestUtil.js");
const { Given, When, Then } = require("@cucumber/cucumber");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");

chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

const host = utils.host;
const todosEndpoint = utils.todosEndpoint;
const getTODOIdByTitle = utils.getTODOIdByTitle;

let returnCode = utils.returnCode;
let response;
let errorMessage = utils.errorMessage;

Given("the following todos exists", async function (dataTable) {
	const todos = dataTable.hashes();

	for (const td of todos) {
		const title = td.todo_title;
		const done = td.done === "false" ? false : true;

		await chai
			.request(host)
			.post(todosEndpoint)
			.set("Content-Type", "application/json")
			.send({ title: title, done: done });
	}
});

// Query by title
When("the student requests to query todos with title {string}", async function (title) {
	response = await chai
		.request(host)
		.get(todosEndpoint)
		.query({ title })
		.set("Content-Type", "application/json");

	returnCode.value = response.status;
	errorMessage.value = response.text;
});

Then("the todos with title {string} are displayed", async function (title) {
	const res =
		response ||
		(await chai
			.request(host)
			.get(todosEndpoint)
			.query({ title })
			.set("Content-Type", "application/json"));

	expect(res).to.have.status(200);
	expect(res.body).to.have.property("todos");

	const todos = res.body.todos;
	expect(todos).to.not.be.undefined;
	expect(todos.length).to.be.greaterThan(0);

	todos.forEach((t) => {
		expect(t.title).to.equal(title);
	});
});

// Query by done status
When("the student requests to query a todo with done status {string}", async function (done) {
	response = await chai
		.request(host)
		.get(todosEndpoint)
		.query({ done })
		.set("Content-Type", "application/json");

	returnCode.value = response.status;
	errorMessage.value = response.text;
});

Then("the todos with done status {string} are displayed", async function (done) {
	const res = response || (await chai.request(host).get(todosEndpoint).query({ done }).set("Content-Type", "application/json"));

	expect(res).to.have.status(200);
	expect(res.body).to.have.property("todos");

	const todos = res.body.todos;
	expect(todos).to.not.be.undefined;
	expect(todos.length).to.be.greaterThan(0);

	todos.forEach((t) => {
		// API may return boolean or string — normalize both sides to string for comparison
		expect(String(t.done)).to.equal(done.replace(/['"]+/g, ""));
	});
});

// Error flow: query by non-existent parameter (per feature this returns a list currently)
When(
	"the student requests to query a todo with non existent parameter of value {string}",
	async function (non_existent) {
		response = await chai
			.request(host)
			.get(todosEndpoint)
			.query({ nonsense: non_existent })
			.set("Content-Type", "application/json");

		returnCode.value = response.status;
		errorMessage.value = response.text;
	}
);

Then("a list of todos is displayed", async function () {
	const res = response || (await chai.request(host).get(todosEndpoint).set("Content-Type", "application/json"));

	expect(res).to.have.status(200);
	expect(res.body).to.have.property("todos");
	expect(res.body.todos.length).to.be.greaterThan(0);
});

