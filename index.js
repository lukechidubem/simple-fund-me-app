import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const balanceAmount = document.getElementById("balanceAmount");

console.log(ethers);

async function connect() {
  if (window.ethereum !== undefined) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.textContent = "Connected!";
    console.log("Metamask connected successfully");
  } else {
    console.log("No Metamask");
  }
}

async function getBalance() {
  if (window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
    balanceAmount.textContent = `Your balance is ${ethers.utils.formatEther(
      balance
    )}`;
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  if (window.ethereum !== undefined) {
    console.log(`Funding with ${ethAmount}`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });

      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining transaction ${transactionResponse.hash}...`);

  // listen for this transaction to finish

  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with transaction ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  if (window.ethereum !== undefined) {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();

      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }
}

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
balanceButton.addEventListener("click", getBalance);
withdrawButton.addEventListener("click", withdraw);
