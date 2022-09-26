const {ethers} = require("ethers");
const { contractABI } = require("../../SmartContracts/contractABI");
const {readFileSync, writeFileSync} = require("fs")


function getProvider(){
  const provider = new ethers.providers.JsonRpcProvider()
  return provider;
}

function newWallet(username, provider){
  const wallet = ethers.Wallet.createRandom()
  wallet.connect(provider)
  writeFileSync("./ethereumWallets/"+username+"-recovery-phrase.txt", wallet.mnemonic.phrase)
  return wallet;
}

async function fundWallet(wallet, provider){
  const signer = provider.getSigner()
  const tx = await signer.sendTransaction({
    to: wallet.address,
    value: ethers.utils.parseEther("1.0")
  })
  return tx;
}

function getWallet(username, provider){
  const recoveryPhrase = readFileSync("./ethereumWallets/"+username+"-recovery-phrase.txt").toString()
  let wallet = ethers.Wallet.fromMnemonic(recoveryPhrase)
  wallet = wallet.connect(provider)
  return wallet;
}

function getContract(contractAddr, prov)
{
  const contract = new ethers.Contract(contractAddr, contractABI, prov)
  return contract;
}

module.exports = {getProvider, newWallet, getWallet, fundWallet, getContract}