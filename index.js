const
  CLIENT_ID = "1416266369233850398",
  
  express = require("express"),
  chalk = require("chalk"),
  server = express(),
  dotenv = require('dotenv'),
  { Client } = require('discord.js-selfbot-v11'),
  client = new Client(),

  statuses = new Map([
    [1, ["playing", chalk.yellowBright.bold]],
    [2, ["listening", chalk.greenBright.bold]],
    [3, ["streaming", chalk.magentaBright.bold]]
  ]);

dotenv.config();

if (!process.env.TOKEN) {
  console.error(`[${chalk.red.bold("-")}] You need to add a token inside the .env file.`);
  process.exit();
}

// Validate token format
const token = process.env.TOKEN.trim();
if (!token.includes('.')) {
  console.error(`[${chalk.red.bold("-")}] Invalid token format. Please check your token in the .env file.`);
  process.exit(1);
}

console.log(`${chalk.cyanBright.bold("Statuscord")} | ${chalk.greenBright.bold("SealedSaucer")}`);

server.all("/", (req, res) => res.send(`<meta http-equiv="refresh" content="0; URL=https://phantom.fr.to/support"/>`));
server.listen(process.env.PORT ?? 3000);

console.log(`\n[${chalk.green.bold("+")}] The webserver is ready.\n`);

console.log(
  `[${chalk.yellow.bold("!")}] Which presence would you like to start?\n`,
  [ ...statuses.entries() ]
  .map(([number, [statusName]]) => "\n" + `[${number}] ${statusName.replace(/^./, m => m.toUpperCase())}`)
  .join("") + "\n"
);

// For now, let's default to "playing" status to test the connection
const number = 1; // Default to playing
const [statusName, style] = statuses.get(number);

console.log(`Selected: ${statusName}`);

const statusModule = require(`./statuses/${statusName}.js`);

client.on("ready", () => {
  console.log(`[${style(statusName.toUpperCase())}] Successfully logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})!`);
  
  // Add a small delay before setting status
  setTimeout(() => {
    statusModule(client, CLIENT_ID)
      .then(() => console.log(`[${chalk.green.bold("+")}] Status set successfully!`))
      .catch(error => {
        console.error(`[${chalk.red.bold("-")}] Status setting failed:`, error.message);
      });
  }, 2000);
});

client.on("error", (error) => {
  console.error(`[${chalk.red.bold("-")}] Discord client error:`, error);
});

console.log(`[${chalk.blue.bold("~")}] Attempting to login...`);
client.login(token)
  .catch(error => {
    console.error(`[${chalk.red.bold("-")}] Login failed:`, error.message);
    if (error.message.includes('TOKEN_INVALID')) {
      console.error(`[${chalk.red.bold("-")}] The token in your .env file appears to be invalid or expired.`);
      console.error(`[${chalk.yellow.bold("!")}] Please verify your Discord token and update the .env file.`);
    }
    process.exit(1);
  });
