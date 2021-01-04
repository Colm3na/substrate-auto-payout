/**
 * autopayout-cron.js
 *  
 * Claim validator rewards automatically on a new era
 *
 * https://github.com/Colm3na/polkadot-auto-payout
 * 
 * Author: Mario Pino | @mariopino:matrix.org
 */

const BigNumber = require('bignumber.js');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const keyring = require('@polkadot/ui-keyring').default;
keyring.initKeyring({
  isDevelopment: false,
});
const fs = require('fs');
const prompts = require('prompts');
const yargs = require('yargs');

const argv = yargs
  .scriptName("autopayout.js")
  .option('account', {
    alias: 'a',
    description: 'Account json file path',
    type: 'string',
  })
  .option('password', {
      alias: 'p',
      description: 'Account password, or stdin if this is not set',
      type: 'string',
  })
  .option('validator', {
    alias: 'v',
    description: 'Validator address',
    type: 'string',
  })
  .option('log', {
    alias: 'l',
    description: 'log (append) to autopayout.log file',
    type: 'boolean',
  })
  .demandOption(['account'], 'Please provide the account json file path')
  .usage("node autopayout.js -c account.json -p password")
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'V')
  .argv;

// Exported account json file
const accountJSON = argv.account;

// Password param
let password = argv.password || false;

// Validator address
const validator = argv.validator;

// Logging to file param
const log = argv.log || false;

// Node websocket
const wsProvider = `wss://kusama-rpc.polkadot.io`;

const main = async () => {

  console.log("\n\x1b[45m\x1b[1m Substrate auto payout \x1b[0m\n");
  console.log("\x1b[1m - Check source at https://github.com/Colm3na/substrate-auto-payout\x1b[0m");
  console.log("\x1b[32m\x1b[1m - Made with love from ColmenaLabs_SVQ https://colmenalabs.org/\x1b[0m\n");

  let raw = fs.readFileSync(accountJSON, { encoding: 'utf-8' });
  const account = JSON.parse(raw);
  const address = account.address;
  
  // Prompt user to enter password
  if (!password) {
    const response = await prompts({
      type: 'password',
      name: 'password',
      message: `Enter password for ${address}:`
    });
    password = response.password;
  }

  if (password) {

    console.log(`\n\x1b[1m -> Importing account\x1b[0m`, address)
    const signer = keyring.restoreAccount(account, password); 
    signer.decodePkcs8(password);

    // Connect to node
    console.log(`\x1b[1m -> Connecting to\x1b[0m`, wsProvider);
    const provider = new WsProvider(wsProvider);
    const api = await ApiPromise.create({ provider });

    // Check account balance
    const accountBalance = await api.query.system.account(address)
    const totalBalance = accountBalance.data.free
    const freeBalance = BigNumber(totalBalance.toString()).minus(
      accountBalance.data.miscFrozen.toString()
    )
    if (freeBalance === 0) {
      console.log(`\x1b[1m -> Account doesn't have free funds\x1b[0m`);
    }
    console.log(`\x1b[1m -> Account free balance is ${(freeBalance * 1e-12).toFixed(3)} KSM\x1b[0m`);

    // Get session progress info
    const currentEra = await api.query.staking.currentEra();
    console.log(`\x1b[1m -> Current era is ${currentEra}\x1b[0m`);
  
    // Check validator unclaimed rewards
    const stakingInfo = await api.derive.staking.account(validator);
    const claimedRewards = stakingInfo.stakingLedger.claimedRewards;

    let transactions = [];
    let era = currentEra - 84;

    for (era; era < currentEra; era++) {
      const eraPoints = await api.query.staking.erasRewardPoints(era);
      const eraValidators = Object.keys(eraPoints.individual.toHuman());
      if (eraValidators.includes(validator) && !claimedRewards.includes(era)) {
        transactions.push(api.tx.staking.payoutStakers(validator, era));
      }
    }
    if (transactions.length > 0) {
      // Claim rewards tx
      const nonce = (await api.derive.balances.account(address)).accountNonce
      const hash = await api.tx.utility.batch(transactions).signAndSend(signer, { nonce });
      console.log(`\n\x1b[32m\x1b[1mSuccess! \x1b[37mCheck tx in PolkaScan: https://polkascan.io/kusama/transaction/${hash.toString()}\x1b[0m\n`);
      if (log) {
        fs.appendFileSync(`autopayout.log`, `${new Date()} - Claimed rewards, transaction hash is ${hash.toString()}`);
      }
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error);
}