# Substrate validator auto payout

Claim and distribute validator staking rewards for your stakers automagically in Substrate based blockchains.

Made with ❤️ from ColmenaLabs_SVQ!

## Install

Needs nodejs (>= v10.20.1), check https://nodejs.org/en/download/ to install for your platform.

Clone the repository and install the needed dependencies:

```
git clone https://github.com/Colm3na/substrate-auto-payout.git
cd polkadot-auto-payout
yarn
```

Go to [Polkadot JS UI](https://polkadot.js.org/apps/#/accounts) and export the account you want to use to json format, then copy the json file/s in the `keystores` folder.

## Usage

```
node autopayout.js -a keystores/account.json -p password -v validator_stash_address
```

Or simply edit `config.js` with your data and run without any parameter:

```
node autopayout.js
```