import { LAST_DATA_SENT, getMatchForUUID } from "./server";

async function handleResponse(url: URL, path: string[], match: any) {
	console.log(path);
	const { matchInformation } = match;

	if (path[0] == "info") {
		return new Response(JSON.stringify([matchInformation]), {
			headers: { "Content-Type": "application/json" },
		});
	}

	let playerDatas = Object.values(match.better_player_stats);
	if (path[0] == "players" || path.length == 0) {
		const { team_1, team_2 } = matchInformation;
		// remove any players that start with "Entity "
		playerDatas = playerDatas.filter(
			(player: any) => !player.playerName.startsWith("Entity ")
		);
		if (url.searchParams.has("player")) {
			const playerToFind = url.searchParams.get("player");
			const playerData = playerDatas.find(
				(player: any) => player.playerName == playerToFind
			);
			return new Response(JSON.stringify([playerData]), {
				headers: { "Content-Type": "application/json" },
			});
		}
		// sort players by team 1 and team 2. team 2 players should be last. sort players by tank, dps, support roles

		playerDatas = playerDatas.sort((a: any, b: any) => {
			if (a.role == "support" && b.role != "support") return -1;
			if (a.role != "support" && b.role == "support") return 1;
			return 0;
		});
		playerDatas = playerDatas.sort((a: any, b: any) => {
			if (a.role == "tank" && b.role != "tank") return -1;
			if (a.role != "tank" && b.role == "tank") return 1;
			return 0;
		});
		playerDatas = playerDatas.sort((a: any, b: any) => {
			if (a.role == "dps" && b.role != "dps") return -1;
			if (a.role != "dps" && b.role == "dps") return 1;
			return 0;
		});
		playerDatas = playerDatas.sort((a: any, b: any) => {
			if (a.team == team_1 && b.team == team_2) return -1;
			if (a.team == team_2 && b.team == team_1) return 1;
			return 0;
		});

		if (url.searchParams.has("team")) {
			const isTeam1 = url.searchParams.get("team") == "1";
			const team = isTeam1 ? team_1 : team_2;
			const teamPlayerDatas = playerDatas.filter(
				(player: any) => player.team == team
			);
			// if there are less than 5 players on the team, add empty players
			for (let i = teamPlayerDatas.length; i < 5; i++) {
				teamPlayerDatas.push({
					role: "",
					team,
					playerName: "",
				});
			}

			return new Response(JSON.stringify(teamPlayerDatas), {
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	return new Response(JSON.stringify(playerDatas), {
		headers: { "Content-Type": "application/json" },
	});
}

export async function handleDataRequest(req, server) {
	try {
		if ("default" in LAST_DATA_SENT) throw "No data sent yet";
		const url = new URL(req.url);

		if (url.pathname.startsWith("/data/historical")) {
			const matchId = url.pathname.split("/").slice(3)[0];
			const path = url.pathname.split("/").slice(4);

			// read the matches.json file and find the match with the id
			const match = await getMatchForUUID(matchId);
			return await handleResponse(url, path, match.data);
		}

		if (url.pathname.startsWith("/data/live")) {
			const path = url.pathname.split("/").slice(3);

			return await handleResponse(url, path, LAST_DATA_SENT.data);
		}
		return new Response(JSON.stringify({}), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(JSON.stringify({}), {
			headers: { "Content-Type": "application/json" },
		});
	}
}
