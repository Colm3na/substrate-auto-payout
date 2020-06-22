# Substrate validator auto payout

Claim rewards for your validator automatically for Substrate based blockchains.

Made with ❤️ from ColmenaLabs_SVQ!

## Install

First of all, you need nodejs (>= v10.20.1) installed, check https://nodejs.org/en/download/ to install it in your platform.

Clone the repository and install the needed dependencies:

```
git clone https://github.com/Colm3na/substrate-auto-payout.git
cd polkadot-auto-payout
npm install
```

Go to [Polkadot JS UI](https://polkadot.js.org/apps/#/accounts) and export the account you want to use to json format, then copy the json file/s in the `keystores` folder.

## Usage

```
$ node autopayout.js --help
node autopayout.js -a account.json -p password
```

Example (will ask the password from stdin):

```
node autopayout.js -c keystores/account.json
```

Output:

```

```
