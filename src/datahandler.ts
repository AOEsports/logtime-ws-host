import { LAST_DATA_SENT } from "./server";

export async function handleDataRequest(req, server) {
	try {
		if ("default" in LAST_DATA_SENT) throw "No data sent yet";
		const url = new URL(req.url);

		if (url.pathname.startsWith("/data/historical")) {
			const matchId = url.pathname.split("/").slice(3)[0];
			console.log(matchId);

			return new Response(JSON.stringify({}), {
				headers: { "Content-Type": "application/json" },
			});
		}

		if (url.pathname == "/data/live") {
			const playerDatas = Object.values(
				LAST_DATA_SENT.data.better_player_stats
			);
			if (url.searchParams.has("player")) {
				const playerToFind = url.searchParams.get("player");
				const playerData = playerDatas.find(
					(player: any) => player.playerName == playerToFind
				);
				return new Response(JSON.stringify([playerData]), {
					headers: { "Content-Type": "application/json" },
				});
			} else {
				return new Response(JSON.stringify(playerDatas), {
					headers: { "Content-Type": "application/json" },
				});
			}
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
