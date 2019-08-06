const Web3 = require("web3");
const express = require("express");
var Tx = require("ethereumjs-tx");
var app = express();

var url = "https://ropsten.infura.io/v3/da25855c27944fe18ab683a220251c78";

var rpcUrl = "";

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
      { name: "_fName", type: "string" },
      { name: "_age", type: "uint256" }
    ],
    name: "setInstructor",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "age", type: "uint256" }
    ],
    name: "Instructor",
    type: "event"
  },
  {
    constant: true,
    inputs: [],
    name: "getInstructor",
    outputs: [{ name: "", type: "string" }, { name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];

const contractAddr = "0x3afdb4caa52d4720e900599c5566043c6a2f0c0b";

const contract = new web3.eth.Contract(ABI, contractAddr);

app.get("/set/:name/:age", (req, res) => {
  const name = req.params.name;
  const age = req.params.age;
  x = setInstructorName(name, parseInt(age), res);
  res.send(x);
});

app.get("/fetchData", async (req, res) => {
  var response = await getInstructorDatas();
  res.send(response);
});

function setInstructorName(name, age, res) {
  console.log("HAi");
  web3.eth.getTransactionCount(account1, (err, txCount) => {
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(800000), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      to: contractAddr,
      data: contract.methods
        .setInstructor(name, web3.utils.toHex(age))
        .encodeABI()
    };

    const tx = new Tx(txObject);
    tx.sign(privateKey1);

    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    web3.eth.sendSignedTransaction(raw, async (err, txHash) => {
      try {
        console.log("err:", err, "txHash:", txHash);
        //const result = await getInstructorDatas();
        //console.log(result)
        //const lastRecord = result.datas[result.datas.length - 1]
        return txHash;
        //res.send(lastRecord,+'Last record')
        // Use this txHash to find the contract on Etherscan!
      } catch (err) {
        console.log(err);
      }
    });
  });
}

async function getInstructorDatas() {
  var responseData;
  await contract.getPastEvents(
    "allEvents",
    { fromBlock: 0, toBlock: "latest" },
    (err, events) => {
      try {
        console.log(events);
        console.log(err);

        var response = {};
        var data = [];
        for (x in events) {
          data.push({
            name: events[x].returnValues.name,
            age: events[x].returnValues.age.toString(),
            txHash: events[x].transactionHash
          });
          response.datas = data;
        }
      } catch (err) {
        console.log(err);
      }
      responseData = response;
    }
  );
  return responseData;
}

app.listen(8081, () => {
  console.log("Web3 in 8000");
});
