import fs from "fs";
import path from "path";
import * as _ from "underscore";
import express from "express";
import WebSocket from "ws";

let DIRECTORY = null;
let LOG_FILE = null;
let LAST_LINE_READ = 0;
let WEB_SERVER = null;
let WS_CONNECTION = null;

const app = express()
	.use(express.static("src/publicclient"))
	.use(express.json())
	.post("/submit", async ({ body }, res) => {
		if (body === null) return res.status(400).send(`no data`);
		if ("websocket" in body === false)
			return res.status(400).send(`no websocket`);
		WEB_SERVER = body.websocket;
		console.log(`WebServer is running at ${WEB_SERVER}`);
		setTimeout(async () => {
			// close any existing connection
			if (WS_CONNECTION !== null) {
				WS_CONNECTION.close();
				WS_CONNECTION = null;
			}

			// connect to the WS server
			WS_CONNECTION = new WebSocket(WEB_SERVER);
			WS_CONNECTION.onopen = (ws) => {
				console.log(`Connected to ${WEB_SERVER}`);
				WS_CONNECTION.send(
					JSON.stringify({
						type: "init",
						id: "gameclient",
					})
				);
				WS_CONNECTION.send(JSON.stringify({ reset: true }));
			};
			WS_CONNECTION.onclose = () => {
				console.log(`Disconnected from ${WEB_SERVER}`);
			};
			WS_CONNECTION.onerror = (error) => {
				console.error(`Error:`, error);
			};
		}, 100);

		if ("workshop" in body === false)
			return res.status(400).send(`no workshop`);
		const check = body.workshop;
		const dirExists = fs.existsSync(check);

		if (!dirExists) {
			return res.status(400).send(`invalid directory`);
		}
		DIRECTORY = body.workshop;
		console.log(DIRECTORY);
		const file = getMostRecentFileName(DIRECTORY);
		console.log(file);
		LOG_FILE = file;
		LAST_LINE_READ = 0;
		res.send(true);
	})
	.get("/submit", () => new Response("POST"))
	.listen(3001);

console.log(`WebServer is running at http://localhost:3001`);
console.log(`Please head to the webpage to select the Folder to scan.`);

const getMostRecentFileName = (dir) => {
	const files = fs.readdirSync(dir);

	// @ts-ignore
	return _.max(files, (file) => {
		const fullpath = path.join(dir, file);

		// ctime = creation time is used
		// replace with mtime for modification time
		return fs.statSync(fullpath).ctime;
	});
};

setInterval(() => {
	if (LOG_FILE === null) return;

	const fileCheck = getMostRecentFileName(DIRECTORY);
	if (fileCheck !== LOG_FILE) {
		console.log(`New file found: ${fileCheck}`);
		LOG_FILE = fileCheck;
		LAST_LINE_READ = 0;
	}

	const file = path.join(DIRECTORY, LOG_FILE);
	const data = fs.readFileSync(file, "utf8");
	const lines = data.split("\n");
	console.log(Date.now(), lines.length);
	// send all lines from the last line read to the end of the file to the WS server
	if (WS_CONNECTION !== null) {
		// check connected
		if (WS_CONNECTION.readyState !== 1) return;
		const linesToSend = lines.slice(LAST_LINE_READ);
		if (linesToSend.length === 0) return;
		WS_CONNECTION.send(
			JSON.stringify({
				msg: "lines",
				matchLines: lines.slice(LAST_LINE_READ),
				lineCount: linesToSend.length,
				totalLineCount: lines.length,
				fileName: LOG_FILE,
			})
		);
		LAST_LINE_READ = lines.length;
	}
}, 1000);
