const { When, Then } = require("@cucumber/cucumber");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const { host, context, resolveId } = require("./stepDefs");

// helper to escape XML special chars
function escapeXml(unsafe) {
	if (unsafe === undefined || unsafe === null) return "";
	return String(unsafe)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

When("the TODO with id {string} has its doneStatus updated to {string}", async function (id, doneStatus) {
	const rid = resolveId(id);
	// GET existing resource and merge updated field so server receives a full object
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	let ds;
	if (doneStatus === "true") ds = true;
	else if (doneStatus === "false") ds = false;
	else ds = doneStatus;
	const body = Object.assign({}, existing, { doneStatus: ds });
	// remove server-assigned or wrapper fields to avoid validation errors
	delete body.id;
	delete body.todo;
	delete body.todos;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/json")
		.send(body);


});

When(/^the TODO with id "([^"]+)" has its doneStatus updated to (true|false)$/, async function (id, doneStatus) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const body = Object.assign({}, existing, { doneStatus: doneStatus === "true" });
	delete body.id;
	delete body.todo;
	delete body.todos;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/json")
		.send(body);


});

When("the TODO with id {int} has its doneStatus updated to {string}", async function (id, doneStatus) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	let ds;
	if (doneStatus === "true") ds = true;
	else if (doneStatus === "false") ds = false;
	else ds = doneStatus;
	const body = Object.assign({}, existing, { doneStatus: ds });
	delete body.id;
	delete body.todo;
	delete body.todos;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/json")
		.send(body);


});

// handle unquoted boolean words (e.g. `true` in Examples)
When("the TODO with id {int} has its doneStatus updated to true", async function (id) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const body = Object.assign({}, existing, { doneStatus: true });
	delete body.id;
	delete body.todo;
	delete body.todos;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/json")
		.send(body);


});

// Alternate Flow: XML
When("the TODO with id {string} has its doneStatus updated to {string} with XML", async function (id, doneStatus) {
	const rid = resolveId(id);
	// GET existing resource so we can send a full resource XML the server expects
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const title = existing.title || (existing.todo && existing.todo.title) || (existing.todos && existing.todos[0] && existing.todos[0].title) || "";
	const description = existing.description || (existing.todo && existing.todo.description) || (existing.todos && existing.todos[0] && existing.todos[0].description) || "";
	let ds = doneStatus;
	if (doneStatus === "true") ds = true;
	else if (doneStatus === "false") ds = false;
	// build XML
	const xmlBody = `<todo><title>${escapeXml(title)}</title><doneStatus>${ds ? 'true' : 'false'}</doneStatus><description>${escapeXml(description)}</description></todo>`;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/xml")
		.set("Accept", "application/xml")
		.send(xmlBody);
});

When("the TODO with id {int} has its doneStatus updated to {string} with XML", async function (id, doneStatus) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const title = existing.title || (existing.todo && existing.todo.title) || (existing.todos && existing.todos[0] && existing.todos[0].title) || "";
	const description = existing.description || (existing.todo && existing.todo.description) || (existing.todos && existing.todos[0] && existing.todos[0].description) || "";
	let ds = doneStatus;
	if (doneStatus === "true") ds = true;
	else if (doneStatus === "false") ds = false;
	const xmlBody = `<todo><title>${escapeXml(title)}</title><doneStatus>${ds ? 'true' : 'false'}</doneStatus><description>${escapeXml(description)}</description></todo>`;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/xml")
		.set("Accept", "application/xml")
		.send(xmlBody);
});

// handle unquoted boolean words for XML alternate flow
When("the TODO with id {int} has its doneStatus updated to true with XML", async function (id) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const title = existing.title || (existing.todo && existing.todo.title) || (existing.todos && existing.todos[0] && existing.todos[0].title) || "";
	const description = existing.description || (existing.todo && existing.todo.description) || (existing.todos && existing.todos[0] && existing.todos[0].description) || "";
	const xmlBody = `<todo><title>${escapeXml(title)}</title><doneStatus>true</doneStatus><description>${escapeXml(description)}</description></todo>`;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/xml")
		.set("Accept", "application/xml")
		.send(xmlBody);
});

When("the TODO with id {int} has its doneStatus updated to false with XML", async function (id) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const title = existing.title || (existing.todo && existing.todo.title) || (existing.todos && existing.todos[0] && existing.todos[0].title) || "";
	const description = existing.description || (existing.todo && existing.todo.description) || (existing.todos && existing.todos[0] && existing.todos[0].description) || "";
	const xmlBody = `<todo><title>${escapeXml(title)}</title><doneStatus>false</doneStatus><description>${escapeXml(description)}</description></todo>`;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/xml")
		.set("Accept", "application/xml")
		.send(xmlBody);
});

When("the TODO with id {int} has its doneStatus updated to false", async function (id) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const body = Object.assign({}, existing, { doneStatus: false });
	delete body.id;
	delete body.todo;
	delete body.todos;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/json")
		.send(body);
});

Then("the TODO with id {string} has doneStatus {string}", async function (id, doneStatus) {
	const rid = resolveId(id);
	const resp = await chai.request(host).get(`/todos/${rid}`);
	expect(resp).to.have.status(200);
	const b = resp.body || {};
	let actual = (
		(b.doneStatus !== undefined && b.doneStatus) ||
		(b.todos && b.todos[0] && b.todos[0].doneStatus) ||
		(b.todo && b.todo.doneStatus) ||
		false
	);
	if (typeof actual === "string") actual = actual === "true";
	const expected = doneStatus === "true" || doneStatus === true;
	expect(actual).to.equal(expected);
});

Then("the TODO with id {int} has doneStatus {string}", async function (id, doneStatus) {
	const rid = resolveId(id);
	const resp = await chai.request(host).get(`/todos/${rid}`);
	expect(resp).to.have.status(200);
	const b = resp.body || {};
	let actual = (
		(b.doneStatus !== undefined && b.doneStatus) ||
		(b.todos && b.todos[0] && b.todos[0].doneStatus) ||
		(b.todo && b.todo.doneStatus) ||
		false
	);
	if (typeof actual === "string") actual = actual === "true";
	const expected = doneStatus === "true" || doneStatus === true;
	expect(actual).to.equal(expected);
});

// Then steps for unquoted true/false words
Then("the TODO with id {int} has doneStatus true", async function (id) {
	const rid = resolveId(id);
	const resp = await chai.request(host).get(`/todos/${rid}`);
	expect(resp).to.have.status(200);
	const b = resp.body || {};
	let actual = (
		(b.doneStatus !== undefined && b.doneStatus) ||
		(b.todos && b.todos[0] && b.todos[0].doneStatus) ||
		(b.todo && b.todo.doneStatus) ||
		false
	);
	if (typeof actual === "string") actual = actual === "true";
	expect(actual).to.equal(true);
});

Then("the TODO with id {int} has doneStatus false", async function (id) {
	const rid = resolveId(id);
	const resp = await chai.request(host).get(`/todos/${rid}`);
	expect(resp).to.have.status(200);
	const b = resp.body || {};
	let actual = (
		(b.doneStatus !== undefined && b.doneStatus) ||
		(b.todos && b.todos[0] && b.todos[0].doneStatus) ||
		(b.todo && b.todo.doneStatus) ||
		false
	);
	if (typeof actual === "string") actual = actual === "true";
	expect(actual).to.equal(false);
});

