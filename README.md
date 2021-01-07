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

Using parameters:

```
node autopayout.js -a keystores/account.json -p password -v validator_stash_address
```

Ask for password:

```
node autopayout.js -a keystores/account.json -v validator_stash_address
```

Or simply edit `config.js` with your data and run without any parameter (cron friendly):

```
node autopayout.js
```
Example output:

```
 Substrate auto payout

 - Check source at https://github.com/Colm3na/substrate-auto-payout
 - Made with love from ColmenaLabs_SVQ https://colmenalabs.org/

 -> Validator stash address is GTzRQPzkcuynHgkEHhsPBFpKdh4sAacVRsnd8vYfPpTMeEY
 -> Importing account FndLuNiewT7uDSB1Ucr3TQHm5vDvZsHfYV3eHivyB8FBAwF
 -> Connecting to wss://kusama-rpc.polkadot.io
 -> Account FndLuNiewT7uDSB1Ucr3TQHm5vDvZsHfYV3eHivyB8FBAwF free balance is 0.558 KSM
 -> Current era is 1730
 -> Claimed eras: [1645,1646,1647,1648,1649,1650,1651,1652,1653,1654,1655,1656,1657,1658,1659,1660,1661,1662,1663,1664,1665,1666,1667,1668,1669,1670,1671,1672,1673,1674,1675,1676,1677,1678,1679,1680,1681,1682,1683,1684,1685,1686,1687,1688,1689,1690,1691,1692,1693,1694,1695,1696,1697,1698,1699,1700,1701,1702,1703,1704,1705,1706,1707,1708,1709,1710,1711,1712,1713,1714,1715,1716,1717,1718,1719,1721,1722,1723,1724,1725,1726,1727,1728]
 -> Unclaimed eras: [1720,1729]

Success! Check tx in PolkaScan: https://polkascan.io/kusama/transaction/0xdb63b74e971d9164fb28678eb7114f5feaeeee9ff760d7dec1acb981060ecdf2

```


NOTE: Set `config.js` file permissions to `600` for better security.

TODO: It doesn't take in account ongoing elections yet!

## Using multiple validators

Edit `validators` array in `config.js` to add the stash address of your validators, then:

```
node autopayout-validators.js
```