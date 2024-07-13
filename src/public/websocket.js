let WebSockerServer = null;
let Reconnecting = false;

let NO_TOASTER = false;

function noToast() {
	NO_TOASTER = true;
}

function requestLog() {
	WebSockerServer.send(
		JSON.stringify({
			type: "requestLog",
		})
	);
}

function connectToWebSocket() {
	if (WebSockerServer) {
		WebSockerServer.close();
	}

	WebSockerServer = new WebSocket(
		`${document.location.protocol == "https:" ? "wss" : "ws"}://${
			document.location.hostname
		}:${location.port}`
	);
	WebSockerServer.onopen = function (event) {
		console.log("Connected to websocket server");
		if (!NO_TOASTER) toastr.success("Connected to WebSocket Server");
		// send a message to the server
		WebSockerServer.send(
			JSON.stringify({
				type: "init",
				id: "data",
			})
		);
		Reconnecting = false;
	};
	WebSockerServer.onclose = function (event) {
		console.log("Disconnected from websocket server");
		const dataTargets = document.getElementsByClassName("dataTarget");
		for (let i = 0; i < dataTargets.length; i++) {
			dataTargets[i].innerHTML = "Lost Connection";
		}
		if (Reconnecting) return;
		Reconnecting = true;
		if (!NO_TOASTER) toastr.error("Lost connection to websocket server");
		// attempt to reconnect every second for the next minute
		let attempts = 0;
		const interval = setInterval(() => {
			attempts++;
			if (attempts > 60) {
				clearInterval(interval);
				return;
			}
			if (WebSockerServer.readyState == 1) {
				clearInterval(interval);
				return;
			}
			console.log(`Attempt ${attempts} to reconnect to WS`);
			connectToWebSocket();
		}, 2000);
		return;
	};
	WebSockerServer.onmessage = function (event) {
		const parsedData = JSON.parse(event.data);
		if (parsedData.type == "gameclientTimeout") {
			if (!NO_TOASTER) toastr.error("GameClient timeout");
		}
		if (parsedData.type == "matchEnd" && parsedData.saved) {
			const matchID = parsedData.matchID;
			if (!NO_TOASTER)
				toastr.success(`
				<div>Match has finished and marked as saved under ID ${matchID}</div>
				<div><button>
					<a href="/public/matchCache/${matchID}.json" target="_blank" download>Download File</a>
				</button></div>
			`);
		}
		if (parsedData.type == "matchSaved") {
			const matchID = parsedData.matchID;
			if (!NO_TOASTER)
				toastr.success(`
				<div>Match has been saved and marked as saved under ID ${matchID}</div>
				<div><button>
					<a href="/public/matchCache/${matchID}.json" target="_blank" download>Download File</a>
				</button></div>
			`);
		}
		if (parsedData.type == "data") {
			const data = parsedData.data;
			if (!data.matchInformation) {
				// reset all  dataTarget elements to "Waiting"
				const dataTargets =
					document.getElementsByClassName("dataTarget");
				for (let i = 0; i < dataTargets.length; i++) {
					dataTargets[i].innerHTML = "Waiting";
				}
				return;
			}
			if (
				parsedData.data.server_load &&
				parsedData.data.server_load.average &&
				parsedData.data.server_load.average > 120
			)
				toastr.error("AVERAGE SERVER LOAD IS HIGH (> 120)");
			try {
				const parserLoad = parsedData.parser_load;
				document.getElementById("parser.ConnectionCount").innerHTML =
					parserLoad.totalConnections;
			} catch (e) {}
			passData(parsedData);
		}
		if (parsedData.type == "requestLog") {
			loadLogs(parsedData.data.lines);
		}
	};
}
