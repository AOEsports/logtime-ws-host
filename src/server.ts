import { ServerWebSocket } from "bun";
import { createDTO, scrimCsvToObjArray } from "./parser";
import { logger } from "./Logger";
import { handleDataRequest } from "./datahandler";
import { randomUUID } from "crypto";
import { port, certPath, caPath, keyPath, useTLS } from "../config.json";

let CURRENT: {
	fileName: string;
	lines: string[];
	matchUUID: string;
} = {
	fileName: "",
	lines: [],
	matchUUID: randomUUID(),
};

export let LAST_DATA_SENT: any = {
	default: true,
};

export async function getMatchForUUID(matchUUID: string) {
	// read the matches.json file and find the match with the id
	const matches = Bun.file("./src/public/matchCache/matches.json");
	const matchesJson = await matches.json();
	const matchId = matchesJson[matchUUID];
	const matchFile = Bun.file(`./src/public/matchCache/${matchId}.json`);
	const matchFileJson = await matchFile.json();
	return matchFileJson;
}

export async function getMatchUUID(fileName?: string) {
	if (!fileName) fileName = CURRENT.fileName;
	const CurrentMatchID = fileName.replace("Log-", "").replace(".txt", "");

	const matchesFile = Bun.file("./src/public/matchCache/matches.json");
	const matchesFileJson = await matchesFile.json();
	// check if any of the values are BetterMatchID
	const matchUUIDs = Object.values(matchesFileJson);
	const matchUUIDsKeys = Object.keys(matchesFileJson);
	const matchUUIDIndex = matchUUIDs.indexOf(CurrentMatchID);
	if (matchUUIDIndex != -1) {
		// if so, return the key
		logger.trace(
			`Found matchUUID for ${fileName} - ${CurrentMatchID}`,
			"[UUID]"
		);
		return matchUUIDsKeys[matchUUIDIndex];
	}
	return randomUUID().replace(/-/g, "");
}

async function saveMatch() {
	const CurrentMatchID = CURRENT.fileName
		.replace("Log-", "")
		.replace(".txt", "");
	// @ts-ignore

	// save the current match to a file in /src/public/matchCache
	// delete server_load if it exists from data
	const LAST_DATA_SENT_NO_SERVER_LOAD = LAST_DATA_SENT;
	delete LAST_DATA_SENT_NO_SERVER_LOAD.data.server_load;

	const matchDataString = JSON.stringify(LAST_DATA_SENT_NO_SERVER_LOAD);
	Bun.write(
		`./src/public/matchCache/${CurrentMatchID}.json`,
		matchDataString
	);
	logger.log(
		`Match saved due to request from client`,
		"[WS]",
		CurrentMatchID
	);

	logger.info(`Saving Match ${CurrentMatchID}`, `[SAVE]`);
	// generate a UUID and store the UUID against the filename in a matches.json file
	// so we can find the match later
	const matchesFile = Bun.file("./src/public/matchCache/matches.json");
	const matchesFileJson = await matchesFile.json();

	// check if any of the values are BetterMatchID
	const matchUUIDs = Object.values(matchesFileJson);
	const matchUUIDsKeys = Object.keys(matchesFileJson);
	const matchUUIDIndex = matchUUIDs.indexOf(CurrentMatchID);
	if (matchUUIDIndex != -1) {
		// if so, delete the key
		delete matchesFileJson[matchUUIDsKeys[matchUUIDIndex]];
	}

	matchesFileJson[LAST_DATA_SENT.parser_load.matchUUID] = CurrentMatchID;
	const stringified = JSON.stringify(matchesFileJson);
	Bun.write("./src/public/matchCache/matches.json", stringified);
	return CurrentMatchID;
}

// Key WebSocket Map
let GameClientWS: ServerWebSocket<any> | null = null;
let ReceivingDataConnections: ServerWebSocket<any>[] = [];
let KeepAliveInterval: Timer | null = null;
let KeepAlivePongTracker: Timer | null = null;
let LastGCWSPongTime = Date.now();

const server = Bun.serve({
	tls: useTLS
		? {
				key: Bun.file(keyPath),
				cert: Bun.file(certPath),
				ca: Bun.file(caPath),
		  }
		: undefined,
	port: port,
	async fetch(req, server) {
		// get the search params from the url
		const url = new URL(req.url);
		if (url.pathname == "/socket") {
			const success = server.upgrade(req);
			if (success) {
				return undefined;
			}
		}

		if (url.pathname == "/favicon.png") {
			return new Response(Bun.file("./src/public/imgs/favicon.png"));
		}
		if (url.pathname.includes("/public/")) {
			const fileName = url.pathname.split("/public/")[1];
			return new Response(
				Bun.file("./src/public/" + fileName.replace(/%20/g, " "))
			);
		}

		if (url.pathname.startsWith("/data")) {
			return await handleDataRequest(req, server);
		}

		const header = Bun.file("./src/templates/head.html");
		let headerText = await header.text();

		const topbarTemplate = Bun.file("./src/templates/topbar.html");
		const topbarText = await topbarTemplate.text();
		headerText = headerText.replace("%TOPBAR%", topbarText);

		const navbarTemplate = Bun.file("./src/templates/navbar.html");
		const navbarText = await navbarTemplate.text();
		headerText = headerText.replace("%NAVBAR%", navbarText);

		if (url.pathname == "/player") {
			const players = await Bun.file("./src/public/player.html").text();
			const returnPage = headerText
				.replace("%BODY%", players)
				.replace("%PAGE%", "playerinfo");
			return new Response(returnPage, {
				headers: { "Content-Type": "text/html" },
			});
		}

		if (url.pathname == "/matchinfo") {
			const players = await Bun.file(
				"./src/public/matchinfo.html"
			).text();
			const returnPage = headerText
				.replace("%BODY%", players)
				.replace("%PAGE%", "matchinfo");
			return new Response(returnPage, {
				headers: { "Content-Type": "text/html" },
			});
		}

		if (url.pathname == "/serverload") {
			const players = await Bun.file(
				"./src/public/serverload.html"
			).text();
			const returnPage = headerText
				.replace("%BODY%", players)
				.replace("%PAGE%", "serverload");
			return new Response(returnPage, {
				headers: { "Content-Type": "text/html" },
			});
		}

		if (url.pathname == "/parserload") {
			const players = await Bun.file(
				"./src/public/parserload.html"
			).text();
			const returnPage = headerText
				.replace("%BODY%", players)
				.replace("%PAGE%", "parserload");
			return new Response(returnPage, {
				headers: { "Content-Type": "text/html" },
			});
		}

		// return html with head.html and body.html

		// handle HTTP request normally
		const index = Bun.file("./src/public/index.html");
		const indexText = await index.text();

		const returnPage = headerText
			.replace("%BODY%", indexText)
			.replace("%PAGE%", "home");

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
				logger.log(`GameClient disconnected`, "[WS]");
			}
			if (ReceivingDataConnections.includes(ws)) {
				ReceivingDataConnections = ReceivingDataConnections.filter(
					(connection) => connection != ws
				);
				logger.log(`Data connection disconnected`, "[WS]");
			}

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
		},
		async message(ws, message: string) {
			const parsed = JSON.parse(message);
			if (parsed.type == "pong" && ws == GameClientWS) {
				LastGCWSPongTime = Date.now();
				return;
			}
			if (parsed.type == "ping") {
				ws.send(JSON.stringify({ type: "pong" }));
				return;
			}
			if (parsed.type == "requestLog") {
				ws.send(JSON.stringify({ type: "requestLog", data: CURRENT }));
				return;
			}
			if (parsed.type == "saveMatch") {
				const BetterMatchID = await saveMatch();

				ws.send(
					JSON.stringify({
						type: "matchSaved",
						matchID: BetterMatchID,
						saved: true,
					})
				);
			}
			if (parsed.type == "init") {
				// get the ip of the client
				const ip = ws.remoteAddress;
				if (parsed.id == "gameclient") {
					GameClientWS = ws;
					logger.log(`Registered gameclient from IP`, "[WS]", ip);
					// setup keepalive
					if (KeepAliveInterval) {
						clearInterval(KeepAliveInterval);
					}
					KeepAliveInterval = setInterval(() => {
						if (!GameClientWS) {
							return;
						}
						GameClientWS.send(JSON.stringify({ type: "ping" }));
					}, 2000);
					if (KeepAlivePongTracker) {
						clearInterval(KeepAlivePongTracker);
					}
					LastGCWSPongTime = Date.now();
					KeepAlivePongTracker = setInterval(() => {
						if (!GameClientWS) {
							return;
						}
						if (Date.now() - LastGCWSPongTime > 10000) {
							console.error(`GameClient timed out`);
							try {
								GameClientWS.close();
							} catch (e) {}

							// send notice to other clients
							for (const dataConnection of ReceivingDataConnections) {
								dataConnection.send(
									JSON.stringify({
										type: "gameclientTimeout",
									})
								);
							}
						}
					}, 1000);
				}
				if (parsed.id == "data") {
					ReceivingDataConnections.push(ws);
					logger.log(
						`Registered data connection from IP`,
						"[WS]",
						ip
					);
				}
				logger.log(
					`Total connections:`,
					"[WS]",
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
						matchUUID: "FAKE MATCH UUID",
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
					logger.log(`RESET`, "[WS]");
					return;
				}
				if (parsed.msg == "lines") {
					const { lineCount, matchLines, fileName, totalLineCount } =
						parsed;

					// if we already have a filename, confirm that theyre the same
					if (CURRENT.fileName && CURRENT.fileName != fileName) {
						// reset stuff if theyre not
						logger.log(`RESET FOR NEW FILE`, "[WS]");
						CURRENT = {
							fileName,
							lines: [],
							matchUUID: await getMatchUUID(fileName),
						};
					}

					// check that matchLines and lineCount match
					if (matchLines.length != lineCount) {
						console.error(
							"line count mismatch x1",
							matchLines.length,
							lineCount
						);
						return;
					}
					// append matchLines to CURRENT.lines
					CURRENT = {
						fileName,
						matchUUID: await getMatchUUID(fileName),
						lines: [...CURRENT.lines, ...matchLines],
					};
					// check that CURRENT.lines.length == lineCount
					if (CURRENT.lines.length != totalLineCount) {
						console.error(
							"line count mismatch x2",
							CURRENT.lines.length,
							totalLineCount
						);
						return;
					}
					logger.log(
						`Saved ${lineCount} lines for ${fileName}`,
						"[WS]",
						CURRENT.lines.length,
						totalLineCount,
						// most recent line
						CURRENT.lines[CURRENT.lines.length - 1]
					);
					const startTime = Date.now();
					const parsedObj = scrimCsvToObjArray(matchLines);
					const DTO = createDTO(parsedObj, LAST_DATA_SENT.data);

					const timeToParse = Date.now() - startTime;
					// send to all data connections
					const doSave =
						DTO["round_status"] == "match_end" &&
						LAST_DATA_SENT.data["round_status"] != "match_end";
					LAST_DATA_SENT = {
						type: "data",
						data: DTO,
						parser_load: {
							totalConnections: ReceivingDataConnections.length,
							lineCount: CURRENT.lines.length,
							fileName: CURRENT.fileName,
							matchUUID: CURRENT.matchUUID,
							parseTime: timeToParse,
							ramUsage: process.memoryUsage().heapUsed,
							cpuUsage: process.cpuUsage(),
						},
					};

					// check if DTO["round_status"] = "match_end"
					if (doSave) {
						const BetterMatchID = await saveMatch();

						logger.log(
							`AUTOMATICALLY SAVED MATCH, FOUND MATCH_END`,
							"[WS]",
							BetterMatchID
						);

						for (const dataConnection of ReceivingDataConnections) {
							dataConnection.send(
								JSON.stringify({
									type: "matchEnd",
									matchID: BetterMatchID,
									saved: true,
								})
							);
						}
					}

					for (const dataConnection of ReceivingDataConnections) {
						dataConnection.send(JSON.stringify(LAST_DATA_SENT));
					}
				}
			}

			// send back a message
		},
	},
});

logger.success(
	`Server started on port ${server.port} ${
		useTLS ? "with TLS" : "without TLS"
	}`,
	"[SERVER]"
);
