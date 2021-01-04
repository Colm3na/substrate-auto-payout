module.exports = {
  nodeWS: 'wss://kusama-rpc.polkadot.io',
  denom: 'KSM',
  decimalPlaces: 12,
  validator: 'GTzRQPzkcuynHgkEHhsPBFpKdh4sAacVRsnd8vYfPpTMeEY',
  validators: [
    'GTzRQPzkcuynHgkEHhsPBFpKdh4sAacVRsnd8vYfPpTMeEY', // 🤖 POLKASTATS
    'EPStAMtjApGg8Ap6xKe9gyuinjmetz1MNhzu1cPmLQkWKUA', // 🤖 POLKASTATS/2
    'DSpbbk6HKKyS78c4KDLSxCetqbwnsemv2iocVXwNe2FAvWC', // DRAGONSTAKE 🐲
    'DSA55HQ9uGHE5MyMouE8Geasi2tsDcu3oHR4aFkJ3VBjZG5', // DRAGONSTAKE 🐲/02
    'J4XkgJjMP6c1pqneV5KogJvJLM1qReXP9SAMJt33prnDdwB', // DRAGONSTAKE 🐲/03
  ],
  password: '',
  accountJSON: './keystores/account.json',
  log: true,
}