https://github.com/AOEsports/logtime-ws-host/assets/1311244/cdabbb75-6e6a-4300-a91b-14be80baee0f

# Host for Logtime WS

⚠ **Requires Bun** ⚠

For use in conjunction with [the client](https://github.com/AOEsports/logtime-ws-client).

## Config

**Before running, copy the `config.json.template` to `config.json` and modify as needed**

```json
{
	"port": 3000,
	"useTLS": false,
	"hostname": "localhost",
	"certPath": "/etc/letsencrypt/live/yourdomain.com/fullchain.pem",
	"keyPath": "/etc/letsencrypt/live/yourdomain.com/privkey.pem",
	"caPath": "/etc/letsencrypt/live/yourdomain.com/chain.pem"
}
```

Out of the box, TLS support is disabled. To enable it, provide a valid cert, key and chain path.


## Endpoints

> `/data/live/info` - provides the current live match information (map, type of map, team names)

> `/data/live/players` - provides the current live player stats

> `/data/live/players?team=[1|2]` - provides the current live player stats for either team 1 or 2.

> `/data/live/players?player=PlayerName` - provides the current live player stats for the specified player name.

> **You can replace `live` with `historical/[MATCHID]` to access past matches**
> ie; `/data/live/info` becomes `/data/historical/[MATCHID]/info`. 

**Match IDs are stored in `/src/public/matchCache/matches.json`. It is the _key_**

```json
{"b2249efc732e43f2bdf20bd4143d2098":"2023-12-16-12-20-55","9d8cb701a2f1474abab71afce5163de6":"2023-12-18-10-59-43","3ee0a18528ad485d9e8a4f759c6fccd4":"2023-12-18-11-36-47"}
```
example: `/data/historical/3ee0a18528ad485d9e8a4f759c6fccd4/info`

