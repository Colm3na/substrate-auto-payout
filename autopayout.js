/**
 * autopayout.js
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
const wsProvider = `ws://localhost:9944`;

const main = async () => {

  let savedEra = 0;

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

    // Subscribe to new blocks
    console.log(`\x1b[1m -> Subscribing to new blocks\x1b[0m`);
    await api.rpc.chain.subscribeNewHeads(async () => {
  
      // Get session progress info
      const currentEra = await api.query.staking.currentEra();

      if (currentEra > savedEra) {
        console.log(`\x1b[1m -> Current era is ${currentEra}, waiting era change ...\x1b[0m`);
        savedEra = currentEra;

        // Check validator unclaimed rewards
        const stakingInfo = await api.derive.staking.account(validator);
        const claimedRewards = stakingInfo.stakingLedger.claimedRewards;
        const lastClaimedReward = claimedRewards[claimedRewards.length - 1];
        console.log(`\x1b[1m -> Last claimed era is ${lastClaimedReward}\x1b[0m`);
        if (lastClaimedReward < currentEra) {
          console.log(`\x1b[1m -> ${currentEra - lastClaimedReward - 1} unclaimed era rewards\x1b[0m`);
          let transactions = [];
          let era = parseInt(lastClaimedReward) + 1;
          for (era; era < currentEra; era++) {
            // Check if validator was active at era
            const eraPoints = await api.query.staking.erasRewardPoints(era);
            const eraValidators = Object.keys(JSON.parse(JSON.stringify(eraPoints.individual))).map(validator => {
              return validator;
            });
            if (eraValidators.includes(validator)) {
              transactions.push(api.tx.staking.payoutStakers(validator, era));
            }
          }

          // Claim rewards tx
          const nonce = (await api.derive.balances.account(address)).accountNonce
          const hash = await api.tx.utility.batch(transactions).signAndSend(signer, { nonce });
          console.log(`\n\x1b[32m\x1b[1mSuccess! \x1b[37mCheck tx in PolkaScan: https://polkascan.io/pre/kusama/transaction/${hash.toString()}\x1b[0m\n`);
          if (log) {
            fs.appendFileSync(`autopayout.log`, `${new Date()} - Current era ${currentEra}, claimed rewards for last ${currentEra - lastClaimedReward - 1} eras, tx hash is ${hash.toString()}`);
          }
        }
      }
    });
  }
}

try {
  main();
} catch (error) {
  console.error(error);
}