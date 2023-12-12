// @ts-nocheck

const OW_EVENT_KEYS = {
	RND_S: "round_start",
	RND_E: "round_end",
	H_SPN: "hero_spawn",
	H_SWP: "hero_swap",
	OFF_ASS: "offensive_assist",
	DEF_ASS: "defensive_assist",
	ULT_CHG: "ultimate_charged",
	ULT_ST: "ultimate_start",
	ULT_END: "ultimate_end",
	P_STAT: "player_stat",
	M_REZ: "mercy_rez",
	HEALING: "healing",
	DAMAGE: "damage",
	KILL: "kill",
	M_END: "match_end",
	M_START: "match_start",
	ECHO_DUP_S: "echo_duplicate_start",
	ECHO_DUP_E: "echo_duplicate_end",
	SERVER_LOAD: "server_load",
};

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
			if (key === OW_EVENT_KEYS.M_START) {
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

			if (key === OW_EVENT_KEYS.OFF_ASS) {
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

			if (key === OW_EVENT_KEYS.DEF_ASS) {
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
				key === OW_EVENT_KEYS.OFF_ASS ||
				key === OW_EVENT_KEYS.DEF_ASS
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

			if (key === OW_EVENT_KEYS.H_SPN) {
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

			if (key === OW_EVENT_KEYS.H_SWP) {
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
				key === OW_EVENT_KEYS.ULT_CHG ||
				key === OW_EVENT_KEYS.ULT_ST ||
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

			if (key === OW_EVENT_KEYS.ECHO_DUP_S) {
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

			if (key === OW_EVENT_KEYS.P_STAT) {
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
		if (event[OW_EVENT_KEYS.M_START]) {
			console.log("GOT MAP NAME!");
			MAP = event?.[OW_EVENT_KEYS.M_START]?.mapName;
			MODE = event?.[OW_EVENT_KEYS.M_START]?.mode;
			TEAM_1 = event?.[OW_EVENT_KEYS.M_START]?.team1;
			TEAM_2 = event?.[OW_EVENT_KEYS.M_START]?.team2;
		}

		if (event[OW_EVENT_KEYS.H_SPN]) {
			if (event?.[OW_EVENT_KEYS.H_SPN]?.player?.playerName) {
				PLAYERS[event?.[OW_EVENT_KEYS.H_SPN]?.player?.playerName] = {
					...(PLAYERS?.[
						event?.[OW_EVENT_KEYS.H_SPN]?.player?.playerName
					] || {}),
					...event[OW_EVENT_KEYS.H_SPN].player,
				};

				DTO["players"] = { ...PLAYERS };
			}
		}

		if (event[OW_EVENT_KEYS.H_SWP]) {
			if (event?.[OW_EVENT_KEYS.H_SWP]?.player?.playerName) {
				PLAYERS[event?.[OW_EVENT_KEYS.H_SWP]?.player?.playerName] = {
					...PLAYERS[
						event?.[OW_EVENT_KEYS.H_SWP]?.player?.playerName
					],
					...event[OW_EVENT_KEYS.H_SWP].player,
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

		if (event[OW_EVENT_KEYS.OFF_ASS]) {
			if (event?.[OW_EVENT_KEYS.OFF_ASS]?.player?.playerName) {
				if (
					PLAYERS[event?.[OW_EVENT_KEYS.OFF_ASS]?.player?.playerName]
				) {
					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.OFF_ASS]?.player?.playerName
						].off_assists
					) {
						PLAYERS[
							event?.[OW_EVENT_KEYS.OFF_ASS]?.player?.playerName
						].off_assists += 1;
					} else {
						PLAYERS[
							event?.[OW_EVENT_KEYS.OFF_ASS]?.player?.playerName
						].off_assists = 1;
					}

					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.DEF_ASS]) {
			if (event?.[OW_EVENT_KEYS.DEF_ASS]?.player?.playerName) {
				if (
					PLAYERS[event?.[OW_EVENT_KEYS.DEF_ASS]?.player?.playerName]
				) {
					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.DEF_ASS]?.player?.playerName
						].def_assists
					) {
						PLAYERS[
							event?.[OW_EVENT_KEYS.DEF_ASS]?.player?.playerName
						].def_assists += 1;
					} else {
						PLAYERS[
							event?.[OW_EVENT_KEYS.DEF_ASS]?.player?.playerName
						].def_assists = 1;
					}

					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ULT_CHG]) {
			if (event?.[OW_EVENT_KEYS.ULT_CHG]?.player?.playerName) {
				if (
					PLAYERS[event?.[OW_EVENT_KEYS.ULT_CHG]?.player?.playerName]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ULT_CHG]?.player?.playerName
					].ultimate_status = "charged";
					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ULT_ST]) {
			if (event?.[OW_EVENT_KEYS.ULT_ST]?.player?.playerName) {
				if (
					PLAYERS[event?.[OW_EVENT_KEYS.ULT_ST]?.player?.playerName]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ULT_ST]?.player?.playerName
					].ultimate_status = "started";

					if (
						PLAYERS[
							event?.[OW_EVENT_KEYS.ULT_ST]?.player?.playerName
						].ultsUsed
					) {
						PLAYERS[
							event?.[OW_EVENT_KEYS.ULT_ST]?.player?.playerName
						].ultsUsed += 1;
					} else {
						PLAYERS[
							event?.[OW_EVENT_KEYS.ULT_ST]?.player?.playerName
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

		if (event[OW_EVENT_KEYS.ECHO_DUP_S]) {
			if (event?.[OW_EVENT_KEYS.ECHO_DUP_S]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.ECHO_DUP_S]?.player?.playerName
					]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ECHO_DUP_S]?.player?.playerName
					].ultimate_status = "started";
					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.ECHO_DUP_E]) {
			if (event?.[OW_EVENT_KEYS.ECHO_DUP_E]?.player?.playerName) {
				if (
					PLAYERS[
						event?.[OW_EVENT_KEYS.ECHO_DUP_E]?.player?.playerName
					]
				) {
					PLAYERS[
						event?.[OW_EVENT_KEYS.ECHO_DUP_E]?.player?.playerName
					].ultimate_status = "ended";
					DTO["players"] = PLAYERS;
				}
			}
		}

		if (event[OW_EVENT_KEYS.RND_S]) {
			DTO["round_status"] = "round_start";
		}

		if (event[OW_EVENT_KEYS.RND_E]) {
			for (const player of Object.keys(PLAYERS)) {
				if (PLAYERS[player]) {
					// PLAYERS[player].hero = null;
					PLAYERS[player].ultimate_status = null;
				}
			}
			DTO["round_status"] = "round_end";
		}

		if (event[OW_EVENT_KEYS.M_END]) {
			DTO["round_status"] = "match_end";
		}

		if (event[OW_EVENT_KEYS.P_STAT]) {
			const playerName = event?.[OW_EVENT_KEYS.P_STAT]?.playerName;
			if (playerName) {
				const newRoundNo = parseInt(
					event?.[OW_EVENT_KEYS.P_STAT]?.round
				);
				const oldRoundNo = PLAYER_STATS[playerName]?.round || 0;
				const newHero = event?.[OW_EVENT_KEYS.P_STAT]?.hero;
				const oldHero = PLAYER_STATS[playerName]?.hero || "";

				if (PLAYER_STATS[playerName]) {
					if (newRoundNo === oldRoundNo) {
						PLAYER_STATS[playerName].round = newRoundNo;
						PLAYER_STATS[playerName].hero = newHero;
						PLAYER_STATS[playerName].heroList.push(newHero);
						PLAYER_STATS[playerName].eliminations += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.eliminations
						);

						PLAYER_STATS[playerName].final_blows += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.final_blows
						);

						PLAYER_STATS[playerName].deaths += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.deaths
						);

						PLAYER_STATS[playerName].hero_damage += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.hero_damage
						);

						PLAYER_STATS[playerName].healing_dealt += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.healing_dealt
						);

						PLAYER_STATS[playerName].self_healing += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.self_healing
						);

						PLAYER_STATS[playerName].damage_taken += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.damage_taken
						);

						PLAYER_STATS[playerName].damage_mitigated += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.damage_mitigated
						);

						PLAYER_STATS[playerName].defensive_assists += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.defensive_assists
						);

						PLAYER_STATS[playerName].offensive_assists += parseInt(
							event?.[OW_EVENT_KEYS.P_STAT]?.offensive_assists
						);

						PLAYER_STATS[playerName].weapon_accuracy += parseFloat(
							event?.[OW_EVENT_KEYS.P_STAT]?.weapon_accuracy
						);
					} else {
						PLAYER_STATS[playerName] = {
							round: parseInt(
								event?.[OW_EVENT_KEYS.P_STAT]?.round
							),
							hero: event?.[OW_EVENT_KEYS.P_STAT]?.hero,
							heroList: [event?.[OW_EVENT_KEYS.P_STAT]?.hero],
							eliminations: event?.[OW_EVENT_KEYS.P_STAT]
								?.eliminations
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.eliminations
								  )
								: 0,

							final_blows: event?.[OW_EVENT_KEYS.P_STAT]
								?.final_blows
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.final_blows
								  )
								: 0,

							deaths: event?.[OW_EVENT_KEYS.P_STAT]?.deaths
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]?.deaths
								  )
								: 0,

							hero_damage: event?.[OW_EVENT_KEYS.P_STAT]
								?.hero_damage
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.hero_damage
								  )
								: 0,

							healing_dealt: event?.[OW_EVENT_KEYS.P_STAT]
								?.healing_dealt
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.healing_dealt
								  )
								: 0,

							self_healing: event?.[OW_EVENT_KEYS.P_STAT]
								?.self_healing
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.self_healing
								  )
								: 0,

							damage_taken: event?.[OW_EVENT_KEYS.P_STAT]
								?.damage_taken
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.damage_taken
								  )
								: 0,

							damage_mitigated: event?.[OW_EVENT_KEYS.P_STAT]
								?.damage_mitigated
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.damage_mitigated
								  )
								: 0,

							defensive_assists: event?.[OW_EVENT_KEYS.P_STAT]
								?.defensive_assists
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.defensive_assists
								  )
								: 0,

							offensive_assists: event?.[OW_EVENT_KEYS.P_STAT]
								?.offensive_assists
								? parseInt(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.offensive_assists
								  )
								: 0,

							weapon_accuracy: event?.[OW_EVENT_KEYS.P_STAT]
								?.weapon_accuracy
								? parseFloat(
										event?.[OW_EVENT_KEYS.P_STAT]
											?.weapon_accuracy
								  )
								: 0,
						};
					}
				} else {
					PLAYER_STATS[playerName] = {
						round: parseInt(event?.[OW_EVENT_KEYS.P_STAT]?.round),
						hero: event?.[OW_EVENT_KEYS.P_STAT]?.hero,
						heroList: [event?.[OW_EVENT_KEYS.P_STAT]?.hero],
						eliminations: event?.[OW_EVENT_KEYS.P_STAT]
							?.eliminations
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]?.eliminations
							  )
							: 0,

						final_blows: event?.[OW_EVENT_KEYS.P_STAT]?.final_blows
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]?.final_blows
							  )
							: 0,

						deaths: event?.[OW_EVENT_KEYS.P_STAT]?.deaths
							? parseInt(event?.[OW_EVENT_KEYS.P_STAT]?.deaths)
							: 0,

						hero_damage: event?.[OW_EVENT_KEYS.P_STAT]?.hero_damage
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]?.hero_damage
							  )
							: 0,

						healing_dealt: event?.[OW_EVENT_KEYS.P_STAT]
							?.healing_dealt
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]?.healing_dealt
							  )
							: 0,

						self_healing: event?.[OW_EVENT_KEYS.P_STAT]
							?.self_healing
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]?.self_healing
							  )
							: 0,

						damage_taken: event?.[OW_EVENT_KEYS.P_STAT]
							?.damage_taken
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]?.damage_taken
							  )
							: 0,

						damage_mitigated: event?.[OW_EVENT_KEYS.P_STAT]
							?.damage_mitigated
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]
										?.damage_mitigated
							  )
							: 0,

						defensive_assists: event?.[OW_EVENT_KEYS.P_STAT]
							?.defensive_assists
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]
										?.defensive_assists
							  )
							: 0,
						offensive_assists: event?.[OW_EVENT_KEYS.P_STAT]
							?.offensive_assists
							? parseInt(
									event?.[OW_EVENT_KEYS.P_STAT]
										?.offensive_assists
							  )
							: 0,

						weapon_accuracy: event?.[OW_EVENT_KEYS.P_STAT]
							?.weapon_accuracy
							? parseFloat(
									event?.[OW_EVENT_KEYS.P_STAT]
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
