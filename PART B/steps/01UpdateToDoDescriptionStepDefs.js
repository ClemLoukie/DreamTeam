const { When, Then } = require("@cucumber/cucumber");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const { host, context, resolveId } = require("./stepDefs");

When("the TODO with id {string} has its description updated to {string}", async function (id, description) {
	const rid = resolveId(id);
	// fetch current resource to preserve other fields if API requires a full object
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const body = Object.assign({}, existing, { description: description });
	// remove wrapper/id fields to avoid validation errors
	delete body.id;
	delete body.todo;
	delete body.todos;
	// normalize doneStatus to boolean if present as string to satisfy validation
	if (body.doneStatus === "true") body.doneStatus = true;
	else if (body.doneStatus === "false") body.doneStatus = false;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/json")
		.send(body);

	
});

When("the TODO with id {int} has its description updated to {string}", async function (id, description) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const body = Object.assign({}, existing, { description: description });
	// remove wrapper/id fields to avoid validation errors
	delete body.id;
	delete body.todo;
	delete body.todos;
	// normalize doneStatus to boolean if present as string to satisfy validation
	if (body.doneStatus === "true") body.doneStatus = true;
	else if (body.doneStatus === "false") body.doneStatus = false;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/json")
		.send(body);


});

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

// Alternate Flow: XML
When("the TODO with id {string} has its description updated to {string} with XML", async function (id, description) {
	const rid = resolveId(id);
	// GET existing resource so we can send a full resource XML the server expects
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	// extract fields, fall back to nested shapes
	const title = existing.title || (existing.todo && existing.todo.title) || (existing.todos && existing.todos[0] && existing.todos[0].title) || "";
	let doneStatus = existing.doneStatus;
	if (typeof doneStatus === "string") doneStatus = doneStatus === "true";
	// build XML with title, doneStatus and the new description (no id wrapper)
	const xmlBody = `<todo>` +
		`<title>${escapeXml(title)}</title>` +
		`<doneStatus>${doneStatus ? 'true' : 'false'}</doneStatus>` +
		`<description>${escapeXml(description)}</description>` +
		`</todo>`;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/xml")
		.set("Accept", "application/xml")
		.send(xmlBody);
});

When("the TODO with id {int} has its description updated to {string} with XML", async function (id, description) {
	const rid = resolveId(id);
	const getResp = await chai.request(host).get(`/todos/${rid}`);
	const existing = (getResp.body && (getResp.body.todo || (getResp.body.todos && getResp.body.todos[0]) || getResp.body)) || {};
	const title = existing.title || (existing.todo && existing.todo.title) || (existing.todos && existing.todos[0] && existing.todos[0].title) || "";
	let doneStatus = existing.doneStatus;
	if (typeof doneStatus === "string") doneStatus = doneStatus === "true";
	const xmlBody = `<todo>` +
		`<title>${escapeXml(title)}</title>` +
		`<doneStatus>${doneStatus ? 'true' : 'false'}</doneStatus>` +
		`<description>${escapeXml(description)}</description>` +
		`</todo>`;
	context.response = await chai
		.request(host)
		.put(`/todos/${rid}`)
		.set("Content-Type", "application/xml")
		.set("Accept", "application/xml")
		.send(xmlBody);
});

Then("the TODO with id {string} has description {string}", async function (id, description) {
	const rid = resolveId(id);
	const resp = await chai.request(host).get(`/todos/${rid}`);
	expect(resp).to.have.status(200);
	const b = resp.body || {};
	const actualDesc = (
		(b.description !== undefined && b.description) ||
		(b.todos && b.todos[0] && b.todos[0].description) ||
		(b.todo && b.todo.description) ||
		""
	).toString();
	expect(actualDesc).to.equal(description.toString());
});

Then("the TODO with id {int} has description {string}", async function (id, description) {
	const rid = resolveId(id);
	const resp = await chai.request(host).get(`/todos/${rid}`);
	expect(resp).to.have.status(200);
	const b = resp.body || {};
	const actualDesc = (
		(b.description !== undefined && b.description) ||
		(b.todos && b.todos[0] && b.todos[0].description) ||
		(b.todo && b.todo.description) ||
		""
	).toString();
	expect(actualDesc).to.equal(description.toString());
});

