import axios from "axios";
import csv from "csvtojson";
import config from "./config.json" assert { type: "json" };
import { URL } from "url";
import contract from "./CONTRATO-JSON-COMPLETO.json" assert { type: "json" };
import path from "path";

const login_url = config.api + "/contract-load/login";
const create_contract = config.api + "/contract-load/data-load";

const current_directory = new URL(".", import.meta.url).pathname;
const FILE_PATH = path.join(current_directory, config.file);

async function main() {
  console.log("Iniciando...");
  const {
    data: { access_token: token },
  } = await axios.post(login_url, {
    name: config.api_key,
    key: config.api_key,
  });

  console.log(token);
  console.log(FILE_PATH);
  const data = await csv().fromFile(FILE_PATH);
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const payload = {
      ...contract,
      NumeroContrato: item.contractCode,
      SequenciaContrato: parseInt(item.contractSequence),
      subPreco: item.subPrice,
    };
    console.log(`send ${i + 1}/${data.length}`);
    try {
      const alldata = data.map((item) => ({
        ...contract,
        NumeroContrato: item.contractCode,
        SequenciaContrato: parseInt(item.contractSequence),
        subPreco: item.subPrice,
      }));
      const { data: res } = await axios.post(create_contract, [payload], {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });
      console.log(res[0].id);
      console.log(`done ${i + 1}/${data.length}`);
    } catch (e) {
      console.log(e.message);
      console.log(e.response.data);
    }
  }
}

await main();
