<template>
  <div class="wrapper">
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
} from "@terra-money/wallet-controller";
import { initController, getController } from "../static/controller";
import { Subscription, combineLatest } from "rxjs";
import * as ethUtil from "ethereumjs-util";
import * as sigUtil from "eth-sig-util";
import { SimplePublicKey, Fee, MsgSend } from "@terra-money/terra.js";
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
  }),
  created() {
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

        sigComp.public_key = new SimplePublicKey(sigComp.public_key);
        sigComp.signature = Buffer.from(sigComp.signature.split(","));
        console.log(sigComp);

        const result = verifyBytes(Buffer.from("555492"), sigComp);
        console.log("Signature valid: " + result);

        this.validTerra = result;
      });
    },
    signTerraTx() {
      this.walletController
        .sign({
          fee: new Fee(0, "0uusd"),
          msgs: [
            new MsgSend(
              this.states.wallets[0].terraAddress,
              this.states.wallets[0].terraAddress,
              { uusd: 0 }
            ),
          ],
          memo: "test",
        })
        .then((res) => {
          console.log(res);
        });
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
