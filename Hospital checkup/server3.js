const Web3 = require("web3");
const express = require("express");

const bodyParser = require("body-parser");
var Tx = require("ethereumjs-tx");
var app = express();
var fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));

var url = "https://ropsten.infura.io/v3/da25855c27944fe18ab683a220251c78";

const web3 = new Web3(new Web3.providers.HttpProvider(url));

const account1 = "0xaB7B7915a58ec33aC3c6fA1825a0115101C62E7A";

const privateKey =
  "fee069363ad9780e2121c3d3fb987ecb268c3177a17b64586a8ccc6c18b9f864";
const privateKey1 = Buffer.from(privateKey, "hex");

web3.eth.defaultAccount = account1;

const ABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "doctorid",
				"type": "uint256"
			},
			{
				"name": "patientid",
				"type": "uint256"
			},
			{
				"name": "patientname",
				"type": "string"
			},
			{
				"name": "vaccinationname",
				"type": "string"
			},
			{
				"name": "vaccinationdate",
				"type": "string"
			}
		],
		"name": "addcheckupDetails",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "doctorid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "patientid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "patientname",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "vaccinationname",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "vaccinationdate",
				"type": "string"
			}
		],
		"name": "Dataadded",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "people",
		"outputs": [
			{
				"name": "id",
				"type": "uint256"
			},
			{
				"name": "doctorid",
				"type": "uint256"
			},
			{
				"name": "patientid",
				"type": "uint256"
			},
			{
				"name": "patientname",
				"type": "string"
			},
			{
				"name": "vaccinationname",
				"type": "string"
			},
			{
				"name": "vaccinationdate",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "peopleCount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
const contractAddr = "0x3fe7ca7693317dd13271ae2ecca9a7612b4eface"; //"0xc923d0a1c467651d8076bcb8052f7fbfdd0f903b";
const contract = new web3.eth.Contract(ABI, contractAddr);
app.get("/", async (req, res) => {
  fs.readFile("index2.html", function(err, data) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
});

app.post("/set", async (req, res) => {
  const doctor_id = parseInt(req.body.doctorid);
  const patient_id = parseInt(req.body.patientid);
  const patient_name = req.body.patientame;
  const vaccination_name = req.body.vacinationname;
  const vaccination_date = req.body.vacinationdate;
  console.log(req.body);

  try {
    x = setData(
      doctor_id,
      patient_id,
      patient_name,
      vaccination_name,
      vaccination_date,
      res
    );
    // res.send(JSON.stringify(x));
  } catch (err) {
    console.log(err);
  }
  var response = await getData();
  res.send(response);
});

app.get("/fetchData", async (req, res) => {
  var response = await getData();
  res.send(response);
});

function setData(
  doctorid,
  patientid,
  patientname,
  vaccinationname,
  vaccinationdate,
  res
) {
  web3.eth.getTransactionCount(account1, (err, txCount) => {
    //patient_name = new Uint8Array(patient_name).join();
    //vaccination_name = new Uint8Array(vaccination_name).join();
    //vaccination_date = new Uint8Array(vaccination_date).join();

    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(1000000), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      to: contractAddr,
      data: contract.methods
        .addcheckupDetails(doctorid,
	patientid,
	patientname,
	vaccinationname,
	vaccinationdate
          //web3.utils.toHex(doctorid),
          //web3.utils.toHex(patientid),
         // web3.utils.toHex(patientname),
         // web3.utils.toHex(vaccinationname),
          //web3.utils.toHex(vaccinationdate)
        )
        .encodeABI()
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
    "Dataadded",
    { fromBlock: 0, toBlock: "latest" },
    (err, events) => {
      try {
        //console.log(events);
        x = events;
	console.log(events);
        var response = {};
        var data = [];
        for (x in events) {
          data.push({
            inner_id: events[x].returnValues.id,
            doctor_id: events[x].returnValues.doctorid,
            patient_id: events[x].returnValues.patientid,
            patient_name: events[x].returnValues.patientname,
            vaccination_name: events[x].returnValues.vaccinationname,
            vaccination_date: events[x].returnValues.vaccinationdate
            //txHash: events[x].transactionHash
            //data: events[x].raw.data
          });
          a = events[x].returnValues.doctorid;
          response.datas = data;
	console.log(data)
        }
        //console.log(data);
        console.log(data);
        responseData = response;
      } catch (err) {
        console.log(err);
      }
    }
  );
  return responseData;
}

app.listen(8001, () => {
  console.log("Web3 in 8000");
});
