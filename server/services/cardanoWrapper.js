const { WalletServer, Seed, AddressWallet} = require('cardano-wallet-js');
const { readFileSync, writeFileSync, existsSync } = require('fs');


async function createUserAddress(username)
{
  let walletServer = WalletServer.init('http://localhost:8090/v2');
  let recoveryPhrase, wallet;
  const name = username
  const passphrase = "userwalletpassword"
  recoveryPhrase = Seed.generateRecoveryPhrase();
  writeFileSync('cardanoWallets/'+ username +'-recovery-phrase.txt', recoveryPhrase);
  const mnemonicList = Seed.toMnemonicList(recoveryPhrase)
  wallet = await walletServer.createOrRestoreShelleyWallet(name, mnemonicList, passphrase)
  const addresses = await wallet.getAddresses()
  return addresses[0].id
}

async function getApplicationWallet()
{
  let walletServer = WalletServer.init('http://localhost:8090/v2');
  let recoveryPhrase, wallet;
  const name = "wallet1"
  const passphrase = "wallet1pass"

  if (existsSync("recovery-phrase.txt"))
  {
    recoveryPhrase = readFileSync("recovery-phrase.txt").toString()
    const wallets = await walletServer.wallets();
    const id = wallets[1].id;
    wallet = await walletServer.getShelleyWallet(id);
  }
  else
  {
    recoveryPhrase = Seed.generateRecoveryPhrase();
    writeFileSync('recovery-phrase.txt', recoveryPhrase);
    const mnemonicList = Seed.toMnemonicList(recoveryPhrase)
    console.log(mnemonicList);
    wallet = await walletServer.createOrRestoreShelleyWallet(name, mnemonicList, passphrase)
  }
  return wallet
}

async function saveMetadata(wallet, metadata, receiver)
{
  const passphrase = "wallet1pass"
  let receiverAddress;
  if(!receiver)
  {
    const unusedAddresses = await wallet.getUnusedAddresses();
    receiverAddress = new AddressWallet(unusedAddresses[0].id);
  }
  else
  {
    receiverAddress = new AddressWallet(receiver);
  }
  const amount = 1000000; // 1 ADA
  const transaction = await wallet.sendPayment(passphrase, [receiverAddress], [amount], metadata);
  return transaction.id
}

async function getMetadata(wallet, txId)
{
  let transaction = await wallet.getTransaction(txId)
  return transaction.metadata
}

async function getTxReceivingAddress(wallet, txId)
{
  let transaction = await wallet.getTransaction(txId)
  return transaction.outputs[0].address
}

function metadataToObject(metadata)
{
  let result = {
  }
  result["issuer"] = metadata[0]["string"]
  result["issuerId"] = metadata[1]["string"]
  result["project"] = metadata[2]["string"]
  result["milestone"] = metadata[3]["string"]
  result["mid"] = metadata[4]["string"]
  result["data"] = metadata[5]["string"]
  let supportlist = []
  for( let item of metadata[6]["list"])
  {
    supportlist.push(item["string"])
  }
  result["support"] = supportlist


  return result
}

module.exports = {createUserAddress, getApplicationWallet, saveMetadata, getMetadata, getTxReceivingAddress, metadataToObject}