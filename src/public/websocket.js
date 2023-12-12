let WebSockerServer = null;

function connectToWebSocket() {
	if (WebSockerServer) {
		WebSockerServer.close();
	}

	WebSockerServer = new WebSocket(
		`ws://${document.location.hostname}:${location.port}`
	);
	WebSockerServer.onopen = function (event) {
		console.log("Connected to websocket server");
		// send a message to the server
		WebSockerServer.send(
			JSON.stringify({
				type: "init",
				id: "data",
			})
		);
	};
	WebSockerServer.onclose = function (event) {
		console.log("Disconnected from websocket server");
		const dataTargets = document.getElementsByClassName("dataTarget");
		for (let i = 0; i < dataTargets.length; i++) {
			dataTargets[i].innerHTML = "Lost Connection";
		}
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
			passData(parsedData);
		}
	};
}
