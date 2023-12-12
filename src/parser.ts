const OW_EVENT_KEYS = {
	ROUND_START: "round_start",
	ROUND_END: "round_end",
	HERO_SPAWN: "hero_spawn",
	HERO_SWAP: "hero_swap",
	OFFENSIVE_ASSIST: "offensive_assist",
	DEFENSIVE_ASSIST: "defensive_assist",
	ULT_CHARGED: "ultimate_charged",
	ULT_START: "ultimate_start",
	ULT_END: "ultimate_end",
	PLAYER_STAT: "player_stat",
	MERCY_REZ: "mercy_rez",
	HEALING: "healing",
	DAMAGE: "damage",
	KILL: "kill",
	MATCH_END: "match_end",
	MATCH_START: "match_start",
	ECHO_DUPE_START: "echo_duplicate_start",
	ECHO_DUPE_END: "echo_duplicate_end",
	SERVER_LOAD: "server_load",
};

// https://github.com/OverPowered-Network/ow2-scrimtime-ws/blob/main/src/parser.ts

export const scrimCsvToObjArray = (rows: string[], delimiter = ",") => {
	const arr = rows
		.filter((row) => row != "")
		.map(function (row) {
			const values = row.replace("\\n", "").split(delimiter);

			const key = values[1];
			if (key === OW_EVENT_KEYS.SERVER_LOAD) {
				const el = {
					[key]: {
						current: values[2],
						average: values[3],
						peak: values[4],
					},
				};

				return el;
			}
			if (key === OW_EVENT_KEYS.MATCH_START) {
				const el = {
					[key]: {
						mapName: values[3],
						mode: values[4],
						team1: values[5],
						team2: values[6],
						timestamp: values[2],
					},
				};

				return el;
			}

			if (key === OW_EVENT_KEYS.KILL) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
						recievingPlayer: {
							hero: values[8],
							playerName: values[7],
						},
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.DAMAGE) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
						recievingPlayer: {
							hero: values[8],
							playerName: values[7],
						},
						amount: parseFloat(values[10]),
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.HEALING) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
						recievingPlayer: {
							hero: values[8],
							playerName: values[7],
						},
						amount: parseFloat(values[10]),
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.OFFENSIVE_ASSIST) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.DEFENSIVE_ASSIST) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
					},
				};
				return el;
			}

			if (
				key === OW_EVENT_KEYS.OFFENSIVE_ASSIST ||
				key === OW_EVENT_KEYS.DEFENSIVE_ASSIST
			) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.HERO_SPAWN) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.HERO_SWAP) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
					},
				};
				// console.log("SWAP", el);

				return el;
			}

			if (
				key === OW_EVENT_KEYS.ULT_CHARGED ||
				key === OW_EVENT_KEYS.ULT_START ||
				key === OW_EVENT_KEYS.ULT_END
			) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.ECHO_DUPE_START) {
				const el = {
					[key]: {
						timestamp: values[2],
						team: values[3],
						player: {
							hero: values[5],
							playerName: values[4],
						},
						dupHero: values[6],
					},
				};
				return el;
			}

			if (key === OW_EVENT_KEYS.PLAYER_STAT) {
				const el = {
					[key]: {
						team: values[3],
						round: values[3],
						hero: values[6],
						playerName: values[5],
						eliminations: values[7],
						final_blows: values[8],
						deaths: values[9],
						hero_damage: values[12],
						healing_dealt: values[13],
						self_healing: values[15],
						damage_taken: values[16],
						damage_mitigated: values[17],
						defensive_assists: values[18],
						offensive_assists: values[19],
						weapon_accuracy: values[values.length - 2], // 2nd to last value. can't be bothered to find the index
					},
				};

				return el;
			}
			const el = {
				[key]: {
					timestamp: values[2],
					team: values[3],
				},
			};
			return el;
		});

	// return the array
	return arr;
};

export const createDTO = (events: any) => {
	let MAP: string = "";
	let MODE: string = "";
	let TEAM_1: string = "";
	let TEAM_2: string = "";
	const PLAYER_STATS = {};
	const PLAYERS = {};
	const DTO = {};

	for (const event of events) {
		if (event[OW_EVENT_KEYS.SERVER_LOAD]) {
			DTO["server_load"] = event[OW_EVENT_KEYS.SERVER_LOAD];
		}
		if (event[OW_EVENT_KEYS.MATCH_START]) {
			console.log("GOT MAP NAME!");
			MAP = event?.[OW_EVENT_KEYS.MATCH_START]?.mapName;
			MODE = event?.[OW_EVENT_KEYS.MATCH_START]?.mode;
			TEAM_1 = event?.[OW_EVENT_KEYS.MATCH_START]?.team1;
			TEAM_2 = event?.[OW_EVENT_KEYS.MATCH_START]?.team2;
		}

		if (event[OW_EVENT_KEYS.HERO_SPAWN]) {
			if (event?.[OW_EVENT_KEYS.HERO_SPAWN]?.player?.playerName) {
				PLAYERS[event?.[OW_EVENT_KEYS.HERO_SPAWN]?.player?.playerName] =
					{
						...(PLAYERS?.[
							event?.[OW_EVENT_KEYS.HERO_SPAWN]?.player
								?.playerName
						] || {}),
						...event[OW_EVENT_KEYS.HERO_SPAWN].player,
					};

				DTO["players"] = { ...PLAYERS };
			}
		}

		if (event[OW_EVENT_KEYS.HERO_SWAP]) {
			if (event?.[OW_EVENT_KEYS.HERO_SWAP]?.player?.playerName) {
				PLAYERS[event?.[OW_EVENT_KEYS.HERO_SWAP]?.player?.playerName] =
					{
						...PLAYERS[
							event?.[OW_EVENT_KEYS.HERO_SWAP]?.player?.playerName
						],
						...event[OW_EVENT_KEYS.HERO_SWAP].player,
						ultimate_status: null,
					};

				DTO["players"] = { ...PLAYERS };
			}
		}

		if (event[OW_EVENT_KEYS.KILL]) {
			if (event?.[OW_EVENT_KEYS.KILL]?.player?.playerName) {
				if (PLAYERS[event?.[OW_EVENT_KEYS.KILL]?.player?.playerName]) {
					if (
						PLAYERS[event?.[OW_EVENT_KEYS.KILL]?.player?.playerName]
							.kills
					) {
						PLAYERS[
							event?.[OW_EVENT_KEYS.KILL]?.player?.playerName
						].kills += 1;
					} else {
						PLAYERS[
							event?.[OW_EVENT_KEYS.KILL]?.player?.playerName
						].kills = 1;
					}

					// Log deaths of other player
					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.KILL]?.recievingPlayer
								?.playerName
						]
					) {
						if (
							PLAYERS[
								event?.[OW_EVENT_KEYS.KILL]?.recievingPlayer
									?.playerName
							]?.deaths
						) {
							PLAYERS[
								event?.[
									OW_EVENT_KEYS.KILL
								]?.recievingPlayer?.playerName
							].deaths += 1;
						} else {
							PLAYERS[
								event?.[
									OW_EVENT_KEYS.KILL
								]?.recievingPlayer?.playerName
							].deaths = 1;
						}
					} else {
						PLAYERS[
							event?.[
								OW_EVENT_KEYS.KILL
							]?.recievingPlayer?.playerName
						] = {
							...event?.[OW_EVENT_KEYS.KILL]?.recievingPlayer,
							deaths: 1,
						};
					}

					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.DAMAGE]) {
			if (event?.[OW_EVENT_KEYS.DAMAGE]?.player?.playerName) {
				if (
					PLAYERS[event?.[OW_EVENT_KEYS.DAMAGE]?.player?.playerName]
				) {
					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.DAMAGE]?.player?.playerName
						].damageDealt
					) {
						PLAYERS[
							event?.[OW_EVENT_KEYS.DAMAGE]?.player?.playerName
						].damageDealt += event?.[OW_EVENT_KEYS.DAMAGE]?.amount;
					} else {
						PLAYERS[
							event?.[OW_EVENT_KEYS.DAMAGE]?.player?.playerName
						].damageDealt = event?.[OW_EVENT_KEYS.DAMAGE]?.amount;
					}

					// Log dmg received of other player
					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.DAMAGE]?.recievingPlayer
								?.playerName
						]
					) {
						if (
							PLAYERS[
								event?.[OW_EVENT_KEYS.DAMAGE]?.recievingPlayer
									?.playerName
							]?.damageReceived
						) {
							PLAYERS[
								event?.[
									OW_EVENT_KEYS.DAMAGE
								]?.recievingPlayer?.playerName
							].damageReceived +=
								event?.[OW_EVENT_KEYS.DAMAGE]?.amount;
						} else {
							PLAYERS[
								event?.[
									OW_EVENT_KEYS.DAMAGE
								]?.recievingPlayer?.playerName
							].damageReceived =
								event?.[OW_EVENT_KEYS.DAMAGE]?.amount;
						}
					} else {
						PLAYERS[
							event?.[
								OW_EVENT_KEYS.DAMAGE
							]?.recievingPlayer?.playerName
						] = {
							...event?.[OW_EVENT_KEYS.DAMAGE]?.recievingPlayer,
							damageReceived:
								event?.[OW_EVENT_KEYS.DAMAGE]?.amount,
						};
					}

					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.OFFENSIVE_ASSIST]) {
			if (event?.[OW_EVENT_KEYS.OFFENSIVE_ASSIST]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.OFFENSIVE_ASSIST]?.player
							?.playerName
					]
				) {
					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.OFFENSIVE_ASSIST]?.player
								?.playerName
						].off_assists
					) {
						PLAYERS[
							event?.[
								OW_EVENT_KEYS.OFFENSIVE_ASSIST
							]?.player?.playerName
						].off_assists += 1;
					} else {
						PLAYERS[
							event?.[
								OW_EVENT_KEYS.OFFENSIVE_ASSIST
							]?.player?.playerName
						].off_assists = 1;
					}

					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.DEFENSIVE_ASSIST]) {
			if (event?.[OW_EVENT_KEYS.DEFENSIVE_ASSIST]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.DEFENSIVE_ASSIST]?.player
							?.playerName
					]
				) {
					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.DEFENSIVE_ASSIST]?.player
								?.playerName
						].def_assists
					) {
						PLAYERS[
							event?.[
								OW_EVENT_KEYS.DEFENSIVE_ASSIST
							]?.player?.playerName
						].def_assists += 1;
					} else {
						PLAYERS[
							event?.[
								OW_EVENT_KEYS.DEFENSIVE_ASSIST
							]?.player?.playerName
						].def_assists = 1;
					}

					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ULT_CHARGED]) {
			if (event?.[OW_EVENT_KEYS.ULT_CHARGED]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.ULT_CHARGED]?.player?.playerName
					]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ULT_CHARGED]?.player?.playerName
					].ultimate_status = "charged";
					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ULT_START]) {
			if (event?.[OW_EVENT_KEYS.ULT_START]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.ULT_START]?.player?.playerName
					]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ULT_START]?.player?.playerName
					].ultimate_status = "started";

					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.ULT_START]?.player?.playerName
						].ultsUsed
					) {
						PLAYERS[
							event?.[OW_EVENT_KEYS.ULT_START]?.player?.playerName
						].ultsUsed += 1;
					} else {
						PLAYERS[
							event?.[OW_EVENT_KEYS.ULT_START]?.player?.playerName
						].ultsUsed = 1;
					}
				}

				DTO["players"] = PLAYERS;
			}
		}

		if (event[OW_EVENT_KEYS.ULT_END]) {
			if (event?.[OW_EVENT_KEYS.ULT_END]?.player?.playerName) {
				if (
					PLAYERS[event?.[OW_EVENT_KEYS.ULT_END]?.player?.playerName]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ULT_END]?.player?.playerName
					].ultimate_status = "ended";
					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ECHO_DUPE_START]) {
			if (event?.[OW_EVENT_KEYS.ECHO_DUPE_START]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.ECHO_DUPE_START]?.player
							?.playerName
					]
				) {
					PLAYERS[
						event?.[
							OW_EVENT_KEYS.ECHO_DUPE_START
						]?.player?.playerName
					].ultimate_status = "started";
					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ECHO_DUPE_END]) {
			if (event?.[OW_EVENT_KEYS.ECHO_DUPE_END]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.ECHO_DUPE_END]?.player?.playerName
					]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ECHO_DUPE_END]?.player?.playerName
					].ultimate_status = "ended";
					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ROUND_START]) {
			DTO["round_status"] = "round_start";
		}

		if (event[OW_EVENT_KEYS.ROUND_END]) {
			for (const player of Object.keys(PLAYERS)) {
				if (PLAYERS[player]) {
					// PLAYERS[player].hero = null;
					PLAYERS[player].ultimate_status = null;
				}
			}
			DTO["round_status"] = "round_end";
		}

		if (event[OW_EVENT_KEYS.MATCH_END]) {
			DTO["round_status"] = "match_end";
		}

		if (event[OW_EVENT_KEYS.PLAYER_STAT]) {
			const playerName = event?.[OW_EVENT_KEYS.PLAYER_STAT]?.playerName;
			if (playerName) {
				const newRoundNo = parseInt(
					event?.[OW_EVENT_KEYS.PLAYER_STAT]?.round
				);
				const oldRoundNo = PLAYER_STATS[playerName]?.round || 0;
				const newHero = event?.[OW_EVENT_KEYS.PLAYER_STAT]?.hero;
				const oldHero = PLAYER_STATS[playerName]?.hero || "";

				if (PLAYER_STATS[playerName]) {
					if (newRoundNo === oldRoundNo) {
						PLAYER_STATS[playerName].round = newRoundNo;
						PLAYER_STATS[playerName].hero = newHero;
						PLAYER_STATS[playerName].heroList.push(newHero);
						PLAYER_STATS[playerName].eliminations += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.eliminations
						);

						PLAYER_STATS[playerName].final_blows += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.final_blows
						);

						PLAYER_STATS[playerName].deaths += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.deaths
						);

						PLAYER_STATS[playerName].hero_damage += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.hero_damage
						);

						PLAYER_STATS[playerName].healing_dealt += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.healing_dealt
						);

						PLAYER_STATS[playerName].self_healing += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.self_healing
						);

						PLAYER_STATS[playerName].damage_taken += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.damage_taken
						);

						PLAYER_STATS[playerName].damage_mitigated += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.damage_mitigated
						);

						PLAYER_STATS[playerName].defensive_assists += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.defensive_assists
						);

						PLAYER_STATS[playerName].offensive_assists += parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.offensive_assists
						);

						PLAYER_STATS[playerName].weapon_accuracy += parseFloat(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.weapon_accuracy
						);
					} else {
						PLAYER_STATS[playerName] = {
							round: parseInt(
								event?.[OW_EVENT_KEYS.PLAYER_STAT]?.round
							),
							hero: event?.[OW_EVENT_KEYS.PLAYER_STAT]?.hero,
							heroList: [
								event?.[OW_EVENT_KEYS.PLAYER_STAT]?.hero,
							],
							eliminations: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.eliminations
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.eliminations
								  )
								: 0,

							final_blows: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.final_blows
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.final_blows
								  )
								: 0,

							deaths: event?.[OW_EVENT_KEYS.PLAYER_STAT]?.deaths
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.deaths
								  )
								: 0,

							hero_damage: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.hero_damage
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.hero_damage
								  )
								: 0,

							healing_dealt: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.healing_dealt
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.healing_dealt
								  )
								: 0,

							self_healing: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.self_healing
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.self_healing
								  )
								: 0,

							damage_taken: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.damage_taken
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.damage_taken
								  )
								: 0,

							damage_mitigated: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.damage_mitigated
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.damage_mitigated
								  )
								: 0,

							defensive_assists: event?.[
								OW_EVENT_KEYS.PLAYER_STAT
							]?.defensive_assists
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.defensive_assists
								  )
								: 0,

							offensive_assists: event?.[
								OW_EVENT_KEYS.PLAYER_STAT
							]?.offensive_assists
								? parseInt(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.offensive_assists
								  )
								: 0,

							weapon_accuracy: event?.[OW_EVENT_KEYS.PLAYER_STAT]
								?.weapon_accuracy
								? parseFloat(
										event?.[OW_EVENT_KEYS.PLAYER_STAT]
											?.weapon_accuracy
								  )
								: 0,
						};
					}
				} else {
					PLAYER_STATS[playerName] = {
						round: parseInt(
							event?.[OW_EVENT_KEYS.PLAYER_STAT]?.round
						),
						hero: event?.[OW_EVENT_KEYS.PLAYER_STAT]?.hero,
						heroList: [event?.[OW_EVENT_KEYS.PLAYER_STAT]?.hero],
						eliminations: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.eliminations
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.eliminations
							  )
							: 0,

						final_blows: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.final_blows
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.final_blows
							  )
							: 0,

						deaths: event?.[OW_EVENT_KEYS.PLAYER_STAT]?.deaths
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]?.deaths
							  )
							: 0,

						hero_damage: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.hero_damage
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.hero_damage
							  )
							: 0,

						healing_dealt: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.healing_dealt
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.healing_dealt
							  )
							: 0,

						self_healing: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.self_healing
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.self_healing
							  )
							: 0,

						damage_taken: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.damage_taken
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.damage_taken
							  )
							: 0,

						damage_mitigated: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.damage_mitigated
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.damage_mitigated
							  )
							: 0,

						defensive_assists: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.defensive_assists
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.defensive_assists
							  )
							: 0,
						offensive_assists: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.offensive_assists
							? parseInt(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.offensive_assists
							  )
							: 0,

						weapon_accuracy: event?.[OW_EVENT_KEYS.PLAYER_STAT]
							?.weapon_accuracy
							? parseFloat(
									event?.[OW_EVENT_KEYS.PLAYER_STAT]
										?.weapon_accuracy
							  )
							: 0,
					};
				}
			}
		}
	}

	DTO["player_stats"] = PLAYER_STATS;
	DTO["matchInformation"] = {
		map: MAP,
		mode: MODE,
		team_1: TEAM_1,
		team_2: TEAM_2,
	};

	return DTO;
};
