

type FunctionCallback = (err: any, result: any) => void;

interface OriginFetchTemplate {
  version: 1;
  sender: string;
  contract: string;
  method: string;
  param: any;
  sig_alg: 1;
}

export interface KeystoreStructure {
  account: string;
  crypto: object;
  id: string;
  version: 3;
}

interface Keypairs {
  privateKey: string
  publicKey: string
}

export interface SenderInfo {
  account: string;
  privateKey: Buffer | string;
}

type StakeLike = (amount: number, senderInfo: SenderInfo) => Promise<any>;

type VoteLike = (delegate: string, senderInfo: SenderInfo) => Promise<any>;

declare namespace Api {
  let chain_id: string;

  function request(url: string, params: any, method?: string): Promise<Response>;

  function getAbi(contract: string): Promise<Response>;
  function getAbi(contract: string, callback: FunctionCallback): void;

  function getBlockHeader(): Promise<Response>;
  function getBlockHeader(callback: FunctionCallback): void;

}

declare namespace Tool {

  const _Api: Api;

  function buf2hex(b: Buffer | string): string;

  function getRequestParams(originFetchTemplate: OriginFetchTemplate, privateKey: Buffer | string): Promise<any>;

}

declare namespace Wallet {

  function createKeys(): Keypairs;

  function createAccountWithIntro(params: {
    account: string;
    publicKey: Buffer | string;
  }, referrerInfo: SenderInfo): Promise<any>;

  function createAccountByIntro(params: {
    account: string;
    password: string;
    privateKey: Buffer | string;
  }): KeystoreStructure;

  function recover(password: string, keyObject: KeystoreStructure): Buffer;

  function getAccountInfo(account: string): Promise<any>;

  function sendTransaction(params: {
    from: string;
    to: string;
    value: string | number;
    memo?: string;
  }, privateKey: Buffer | string): Promise<any>;

  const stake: StakeLike;
  const unstake: StakeLike;
  const claim: StakeLike;
  
  const vote: VoteLike;
  const cancelVote: VoteLike;
}


declare namespace Contract {
  function deployCode(param: {
    vm_type?: number;
    vm_version?: number;
    contract_code: Uint8Array | ArrayBuffer;
  }, senderInfo: SenderInfo): Promise<any>;

  function deployABI(param: {
    contract_abi: string | Uint8Array | ArrayBuffer
  }, senderInfo: SenderInfo): Promise<any>;

  function callContract(originFetchTemplate: OriginFetchTemplate, privateKey: Buffer | string): Promise<any>;
}

declare namespace BottosWalletSDK {
  let config: {
    baseUrl: string;
    version: number;
    crypto: any;
  };

  const Api: Api;

  const Tool: Tool;

  const Wallet: Wallet;

  const Contract: Contract;
}

export = BottosWalletSDK;