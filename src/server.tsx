import { ServerWebSocket } from "bun";
import { createDTO, scrimCsvToObjArray } from "./parser";

let CURRENT: {
	fileName: string;
	lines: string[];
} = {
	fileName: "",
	lines: [],
};

let LAST_DATA_SENT: any = {};

// Key WebSocket Map
let GameClientWS: ServerWebSocket<any> | null = null;
let ReceivingDataConnections: ServerWebSocket<any>[] = [];

const server = Bun.serve({
	development: true,
	async fetch(req, server) {
		const success = server.upgrade(req);
		if (success) {
			return undefined;
		}

		// get the search params from the url
		const url = new URL(req.url);

		if (url.pathname == "/favicon.png") {
			return new Response(Bun.file("./src/public/imgs/favicon.png"));
		}
		if (url.pathname.includes("/public/")) {
			const fileName = url.pathname.split("/public/")[1];
			return new Response(Bun.file("./src/public/" + fileName));
		}
		const header = Bun.file("./src/public/head.html");
		const headerText = await header.text();
		if (url.pathname == "/player") {
			const players = await Bun.file("./src/public/player.html").text();
			const returnPage = headerText.replace("%BODY%", players);
			return new Response(returnPage, {
				headers: { "Content-Type": "text/html" },
			});
		}

		// return html with head.html and body.html

		// handle HTTP request normally
		const index = Bun.file("./src/public/index.html");
		const indexText = await index.text();

		const returnPage = headerText.replace("%BODY%", indexText);

		return new Response(returnPage, {
			headers: { "Content-Type": "text/html" },
		});
	},
	websocket: {
		// this is called when a message is received
		async open(ws) {},
		async close(ws) {
			// remove the connection from the map
			if (ws == GameClientWS) {
				GameClientWS = null;
				console.log(`GameClient disconnected`);
			}
			if (ReceivingDataConnections.includes(ws)) {
				ReceivingDataConnections = ReceivingDataConnections.filter(
					(connection) => connection != ws
				);
				console.log(`Data connection disconnected`);
			}
		},
		async message(ws, message: string) {
			const parsed = JSON.parse(message);
			if (parsed.type == "ping") {
				ws.send(JSON.stringify({ type: "pong" }));
				return;
			}
			if (parsed.type == "init") {
				// get the ip of the client
				const ip = ws.remoteAddress;
				if (parsed.id == "gameclient") {
					GameClientWS = ws;
					console.log(`Registered gameclient from IP`, ip);
				}
				if (parsed.id == "data") {
					ReceivingDataConnections.push(ws);
					console.log(`Registered data connection from IP`, ip);
				}
				console.log(
					`Total connections:`,
					ReceivingDataConnections.length
				);
				if (!LAST_DATA_SENT.parser_load) {
					LAST_DATA_SENT.parser_load = {
						totalConnections: ReceivingDataConnections.length,
						lineCount: 0,
						fileName: "RESETTING",
						ramUsage: process.memoryUsage().heapUsed,
						cpuUsage: process.cpuUsage(),
					};
				}
				LAST_DATA_SENT.parser_load.totalConnections =
					ReceivingDataConnections.length;
				LAST_DATA_SENT.parser_load.ramUsage =
					process.memoryUsage().heapUsed;
				LAST_DATA_SENT.parser_load.cpuUsage = process.cpuUsage();

				for (const dataConnection of ReceivingDataConnections) {
					dataConnection.send(JSON.stringify(LAST_DATA_SENT));
				}
			}
			if (ws == GameClientWS) {
				if (parsed.reset) {
					CURRENT = {
						fileName: "",
						lines: [],
					};
					LAST_DATA_SENT = {
						type: "data",
						data: {},
						parser_load: {
							totalConnections: ReceivingDataConnections.length,
							lineCount: 0,
							fileName: "RESETTING",
							ramUsage: process.memoryUsage().heapUsed,
							cpuUsage: process.cpuUsage(),
						},
					};
					for (const dataConnection of ReceivingDataConnections) {
						dataConnection.send(JSON.stringify(LAST_DATA_SENT));
					}
					console.log(`RESET`);
					return;
				}
				if (parsed.msg == "lines") {
					const { lineCount, matchLines, fileName } = parsed;

					// if we already have a filename, confirm that theyre the same
					if (CURRENT.fileName && CURRENT.fileName != fileName) {
						// reset stuff if theyre not
						console.log(`RESET FOR NEW FILE`);
						CURRENT = {
							fileName: "",
							lines: [],
						};
					}

					// check that matchLines and lineCount match
					if (matchLines.length != lineCount) {
						console.error("line count mismatch");
						return;
					}
					// append matchLines to CURRENT.lines
					CURRENT = {
						fileName,
						lines: [...CURRENT.lines, ...matchLines],
					};
					console.log(
						`Saved ${lineCount} lines for ${fileName}`,
						CURRENT.lines.length
					);
					const startTime = Date.now();
					const parsedObj = scrimCsvToObjArray(CURRENT.lines);
					const DTO = createDTO(parsedObj);
					const timeToParse = Date.now() - startTime;
					// send to all data connections
					LAST_DATA_SENT = {
						type: "data",
						data: DTO,
						parser_load: {
							totalConnections: ReceivingDataConnections.length,
							lineCount: CURRENT.lines.length,
							fileName: CURRENT.fileName,
							parseTime: timeToParse,
							ramUsage: process.memoryUsage().heapUsed,
							cpuUsage: process.cpuUsage(),
						},
					};

					for (const dataConnection of ReceivingDataConnections) {
						dataConnection.send(JSON.stringify(LAST_DATA_SENT));
					}
				}
			}

			// send back a message
		},
	},
});

console.log(`Server started on port ${server.port}`);
