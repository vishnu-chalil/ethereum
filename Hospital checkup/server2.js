const Web3 = require("web3");
const express = require("express");
var Tx = require("ethereumjs-tx");
var app = express();

var url = "https://ropsten.infura.io/v3/da25855c27944fe18ab683a220251c78";

const web3 = new Web3(new Web3.providers.HttpProvider(url));

const account1 = "0xaB7B7915a58ec33aC3c6fA1825a0115101C62E7A";

const privateKey =
  "fee069363ad9780e2121c3d3fb987ecb268c3177a17b64586a8ccc6c18b9f864";
const privateKey1 = Buffer.from(privateKey, "hex");

web3.eth.defaultAccount = account1;

const ABI = [
  {
    constant: false,
    inputs: [
      { name: "_firstName", type: "string" },
      { name: "_lastName", type: "string" }
    ],
    name: "addPerson",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "id", type: "uint256" },
      { indexed: false, name: "_firstName", type: "string" },
      { indexed: false, name: "_lastName", type: "string" }
    ],
    name: "Dataadded",
    type: "event"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "people",
    outputs: [
      { name: "_id", type: "uint256" },
      { name: "_firstName", type: "string" },
      { name: "_lastName", type: "string" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "peopleCount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];
const contractAddr = "0x14bC47711cf471cD0DB9A9B5817510b3E7526b8F";

const contract = new web3.eth.Contract(ABI, contractAddr);

app.get("/set/:fname/:sname", (req, res) => {
  const fname = req.params.fname;
  const sname = req.params.sname;
  x = setData(fname, sname, res);
  res.send(JSON.stringify(x));
});

app.get("/fetchData", async (req, res) => {
  var response = await getData();
  res.send(response);
});

function setData(fname, sname, res) {
  console.log("HAi");
  web3.eth.getTransactionCount(account1, (err, txCount) => {
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(800000), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      to: contractAddr,
      data: contract.methods.addPerson(fname, sname).encodeABI()
    };
    const tx = new Tx(txObject);
    tx.sign(privateKey1);

    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    web3.eth.sendSignedTransaction(raw, async (err, txHash) => {
      var lastRecord = "None";
      try {
        console.log("err:", err, "txHash:", txHash);
        //const result = await getData();
        //console.log(result)
        //lastRecord = result.datas[result.datas.length - 1]
        //res.send(lastRecord,+'Last record')
        // Use this txHash to find the contract on Etherscan!
      } catch (err) {
        console.log(err);
      }
    });
  });
}

async function getData() {
  var responseData = "None found";
  await contract.getPastEvents(
    "allEvents",
    { fromBlock: 0, toBlock: "latest" },
    (err, events) => {
      try {
        console.log(events);
        console.log(err);
        x = events;
        var response = {};
        var data = [];
        for (x in events) {
          data.push({
            fname: events[x].returnValues._firstName,
            sname: events[x].returnValues._lastName,
            txHash: events[x].transactionHash
          });
          response.datas = data;
        }
        responseData = response;
      } catch (err) {
        console.log(err);
      }
    }
  );
  return responseData;
}

app.listen(8081, () => {
  console.log("Web3 in 8000");
});
