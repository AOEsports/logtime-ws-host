import fs from "fs";
import path from "path";
import * as _ from "underscore";
import express from "express";

let FILE_READER_TIMER = null;
let DIRECTORY = null;
let LOG_FILE = null;
let LAST_LINE_READ = 0;

const port = 3000;

const app = express()
	.use(express.static("src/public"))
	.use(express.json())
	.post("/submit", async ({ body }, res) => {
		if ("workshop" in body === false) return res.status(400).send(false);
		const check = body.workshop;
		const dirExists = fs.existsSync(check);

		if (!dirExists) {
			return res.status(400).send(false);
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

FILE_READER_TIMER = setInterval(() => {
	if (LOG_FILE === null) return;
	const file = path.join(DIRECTORY, LOG_FILE);
	const data = fs.readFileSync(file, "utf8");
	const lines = data.split("\n");
	const lastLine = lines.slice(-2)[0];
	console.log(Date.now(), lastLine);
}, 1000);
