<template>
  <div class="wrapper">
    <button class="click" @click="connectKeplr()">Connect Keplr</button>
    <br />
    <button class="click" @click="disconnectKeplr()">Disconnect Keplr</button>
    <br />
    <span v-if="kelprWallet !== ''"
      >Keplr wallet connected: {{ kelprWallet }}</span
    >
    <br />
    <button v-if="kelprWallet !== ''" class="click" @click="signKelpr()">
      Sign Arb Keplr
    </button>
    <br />
    <br />
    <br />
    <button class="click" @click="connect()">Connect MetaMask</button>
    <button v-if="wallet !== ''" class="click" @click="signEvm()">
      Sign MetaMask
    </button>
    <br />
    <span v-if="wallet !== ''">MetaMask wallet connected: {{ wallet }}</span>
    <br />
    <span v-if="signedMM">Signature: {{ signedMM }}</span>
    <br />
    <span v-if="validMM">Valid: {{ validMM }}</span>
    <br />
    <br />
    <button
      v-for="connection in availableConnections"
      :key="connection.identifier"
      class="connectButton"
      @click="walletController.connect(connection.type, connection.identifier)"
    >
      <span class="connectionName">Connect {{ connection.name }} </span>
    </button>
    <div v-if="states">
      <button
        v-if="states.status === 'WALLET_CONNECTED'"
        class="click"
        @click="signTerra()"
      >
        Sign TerraArb
      </button>
      <button
        v-if="states.status === 'WALLET_CONNECTED'"
        class="click"
        @click="signTerraTx()"
      >
        Sign TerraTx
      </button>
    </div>
    <div v-if="states">
      <div v-if="states.status === 'WALLET_CONNECTED'" class="addrStart">
        Terra wallet connected: {{ states.wallets[0].terraAddress }}
      </div>
    </div>
    <br />
    <span v-if="signedTerra">Signature: {{ signedTerra }}</span>
    <br />
    <span v-if="validTerra">Valid: {{ validTerra }}</span>
  </div>
</template>

<script>
import Web3 from "web3";
import {
  Connection,
  ConnectType,
  WalletStates,
  WalletStatus,
  verifyBytes,
  createLCDClient,
} from "@terra-money/wallet-controller";
import { initController, getController } from "../static/controller";
import { combineLatest } from "rxjs";
import * as ethUtil from "ethereumjs-util";
import * as sigUtil from "eth-sig-util";
import fetch from "isomorphic-fetch";
import {
  SimplePublicKey,
  MsgSend,
  Coins,
  LCDClient,
} from "@terra-money/terra.js";
import { publicKeyConvert } from "secp256k1";
import { bech32, bech32m } from "bech32";
import { KeplrMobileWallet } from "../utils/keplr-mobile";

export default {
  name: "IndexPage",
  data: () => ({
    instance: null,
    wallet: "",
    walletController: null,
    subscription: null,
    availableConnections: null,
    availableInstallTypes: null,
    states: null,
    signedMM: null,
    signedTerra: null,
    validMM: null,
    validTerra: null,
    kelprWallet: "",
  }),
  created() {
    console.log(wallets);
    // fetch("http://localhost:6060/getProposalSummary/2", {
    //   headers: new Headers({
    //     Authorization:
    //       "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkaXNjb3JkU2VydmVySWQiOiI5NzU3NTEyMzcyNDI4Njc3NDIiLCJhY2Nlc3NUeXBlcyI6WyJnZXRSb2xlcyIsImdldENoYW5uZWxzIiwiY2hhbmdlRGlzY29yZCIsInByb2ZpbGVEZXRhaWxzIiwic2VydmVycyIsImFjdGl2ZVByb3Bvc2FscyIsImxpbmtEaXNjb3JkIiwiYW5ub3VuY2VtZW50cyIsInNlcnZlckRldGFpbHMiLCJteUxpY2Vuc2VzIiwiV0FnZXRVc2Vyc1dhbGxldHMiLCJhc3NpZ25MaWNlbnNlIiwicmVtb3ZlTGljZW5zZSIsImdldFByb3Bvc2FsU3VtbWFyeSIsIldBcmVzZXRWb3RlIiwiV0FjYXN0Vm90ZSIsIldBZ2V0UHJvcG9zYWxSZXN1bHRzIiwiV0FjbG9zZVByb3Bvc2FsIiwiV0FvcGVuUHJvcG9zYWwiLCJXQWdldFByb3Bvc2FscyIsIldBZGVsZXRlUHJvcG9zYWwiLCJXQWNyZWF0ZVByb3Bvc2FsIiwiV0FhZGRBcGlSdWxlIiwiV0FhZGRUb2tlblJ1bGUiLCJXQWFkZFN0YWtlZE5mdFJ1bGUiLCJXQWFkZE5mdFJ1bGUiLCJXQWRlbGV0ZVJ1bGUiLCJXQWdldFJ1bGVzIl0sImFjY291bnRfd2FsbGV0X2lkIjoyLCJzdWIiOiJ1c2VyIiwiaWF0IjoxNjY1NTYwOTI3LCJleHAiOjE2NjYxNjU3Mjd9.7fh_g0Jwjirgz81HBB2Pqk5Av4mcJNLZ1MOfgxQ-3KY",
    //   }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     let csvContent = "data:text/csv;charset=utf-8," + data.message;
    //     var encodedUri = encodeURI(csvContent);
    //     var link = document.createElement("a");
    //     link.setAttribute("href", encodedUri);
    //     link.setAttribute("download", "my_data.csv");
    //     document.body.appendChild(link); // Required for FF

    //     link.click(); // This will download the data file named "my_data.csv".
    //   });

    if (getController() === undefined) {
      initController().then(() => {
        this.walletController = getController();
        this.subscribeWallet();
      });
    } else {
      this.walletController = getController();
      this.subscribeWallet();
    }
  },
  beforeDestroy() {
    this.subscription?.unsubscribe();
  },
  methods: {
    connectKeplr() {
      if (!window.keplr) {
        alert("Please install keplr extension");
      } else {
        const chainId = "stargaze-1";

        // Enabling before using the Keplr is recommended.
        // This method will ask the user whether to allow access if they haven't visited this website.
        // Also, it will request that the user unlock the wallet if the wallet is locked.
        window.keplr.enable(chainId).then(() => {
          window.keplr.getKey(chainId).then((o) => {
            this.kelprWallet = o.bech32Address;
            console.log(JSON.stringify(o.pubKey));
            console.log(o);
          });
        });
      }
    },
    disconnectKeplr() {
      if (window.keplr) {
        const chainId = "stargaze-1";
        window.keplr.disable(chainId).then(() => {
          this.kelprWallet = "";
        });
      }
    },
    signKelpr() {
      const chainId = "stargaze-1";
      window.keplr
        .signArbitrary(
          chainId,
          this.kelprWallet,
          `I am signing this message with my one-time nonce: 1 to cryptographically verify that I am the owner of this wallet`
        )
        .then((o) => {
          console.log(o);
        });
    },
    connect() {
      window.web3 = new this.$Web3(ethereum);

      try {
        // Request account access
        window.ethereum.send("eth_requestAccounts").then(() => {
          console.log("This browser is supported for ethereum");
          this.instance = new Web3(window.ethereum);
          this.instance.eth.getAccounts().then((res) => {
            this.wallet = res[0];
          });
        });
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    signEvm() {
      this.instance.eth.personal.sign(
        this.instance.utils.fromUtf8(
          `I am signing this message with my one-time nonce: 274547 to cryptographically verify that I am the owner of this wallet`
        ),
        this.wallet,
        (err, signature) => {
          if (err) throw new Error(err);
          console.log(signature);

          // Simulate backend
          const msg = `I am signing this message with my one-time nonce: 274547 to cryptographically verify that I am the owner of this wallet`;

          const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"));
          const address = sigUtil.recoverPersonalSignature({
            data: msgBufferHex,
            sig: signature,
          });

          console.log(
            "Signature valid: " +
              (address.toLowerCase() === this.wallet.toLowerCase())
          );
          this.signedMM = signature;
          this.validMM = address.toLowerCase() === this.wallet.toLowerCase();
        }
      );
    },
    signTerra() {
      this.walletController.signBytes(Buffer.from("555492")).then((res) => {
        console.log(res);

        let sigComp = {
          recid: res.result.recid,
          signature: res.result.signature.toString(),
          public_key: res.result.public_key.key ?? null,
        };

        console.log(JSON.stringify(sigComp));
        this.signedTerra = JSON.stringify(sigComp);

        // Simulate backend
        sigComp.public_key = new SimplePublicKey(sigComp.public_key);
        sigComp.signature = Buffer.from(sigComp.signature.split(","));
        console.log(sigComp);

        const result = verifyBytes(Buffer.from("555492"), sigComp);
        console.log("Signature valid: " + result);

        this.validTerra = result;
      });
    },
    signTerraTx() {
      const msg = new MsgSend(
        this.states.wallets[0].terraAddress,
        this.states.wallets[0].terraAddress,
        { uluna: 1 }
      );

      this.walletController
        .post({
          msgs: [msg],
          feeDenoms: ["uluna"],
          memo: "I am posting this message with my one-time nonce: 274547 to cryptographically verify that I am the owner of this wallet",
        })
        .then((res) => {
          console.log(res);
        });
    },
    getTxInfo(lcd, hash, current = 0) {
      const retries = 5;

      return new Promise((resolve, reject) =>
        lcd.tx
          .txInfo(hash)
          .then((status) => {
            console.log(status);
            resolve(status);
          })
          .catch((e) => {
            if (current++ < retries) {
              console.log("trying again", current);
              setTimeout(() => {
                resolve(this.getTxInfo(lcd, hash, current));
              }, 2000);
            } else throw new Error(e);
          })
      );
    },
    subscribeWallet() {
      this.subscription = combineLatest([
        this.walletController.availableInstallTypes(),
        this.walletController.availableConnections(),
        this.walletController.states(),
      ]).subscribe(
        ([_availableInstallTypes, _availableConnections, _states]) => {
          this.availableInstallTypes = _availableInstallTypes;
          this.states = _states;
          const connections = _availableConnections;
          const i = connections.findIndex((e) => e.type === "READONLY");
          if (i > -1) connections.splice(i, 1);
          this.availableConnections = connections;
        }
      );
    },
    makeWalletWindowInvisible() {
      toggleWalletWindowVisibility(false);
    },
  },
};
</script>
