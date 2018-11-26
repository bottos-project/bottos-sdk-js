
type FunctionCallback = (err: any, result: any) => void;

interface OriginFetchTemplate {
  version: 1;
  sender: string;
  contract: string;
  method: string;
  param: any;
  sig_alg: 1;
}

interface PostTxRes {
  errcode: number;
  msg: string;
  result: any;
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

type StakeLike = (amount: number, senderInfo: SenderInfo) => Promise<PostTxRes>;

type VoteLike = (delegate: string, senderInfo: SenderInfo) => Promise<PostTxRes>;

interface Api {
  chain_id: string;

  request(url: string, params: any, method?: string): Promise<Response>;

  getAbi(contract: string): Promise<any>;
  getAbi(contract: string, callback: FunctionCallback): void;

  getBlockHeader(): Promise<any>;
  getBlockHeader(callback: FunctionCallback): void;

}

interface Tool {

  _Api: Api;

  buf2hex(b: Buffer | string): string;

  getTransactionInfo(trx_hash: string): Promise<PostTxRes>;

  getRequestParams(originFetchTemplate: OriginFetchTemplate, privateKey: Buffer | string): Promise<any>;

}

interface Wallet {

  createKeys(): Keypairs;

  createAccountWithIntro(params: {
    account: string;
    publicKey: Buffer | string;
  }, referrerInfo: SenderInfo): Promise<any>;

  createAccountByIntro(params: {
    account: string;
    password: string;
    privateKey: Buffer | string;
  }): KeystoreStructure;

  recover(password: string, keyObject: KeystoreStructure): Buffer;

  getAccountInfo(account: string): Promise<any>;

  sendTransaction(params: {
    from: string;
    to: string;
    value: string | number;
    memo?: string;
  }, privateKey: Buffer | string): Promise<PostTxRes>;

  stake(params: {
    amount: number;
    target: string;
  }, senderInfo: SenderInfo): Promise<PostTxRes>;

  unstake(params: {
    amount: number;
    source: string;
  }, senderInfo: SenderInfo): Promise<PostTxRes>;

  claim(amount: number, senderInfo: SenderInfo): Promise<PostTxRes>;

  vote: VoteLike;
  cancelVote: VoteLike;
}


interface Contract {
  deployCode(param: {
    vm_type?: number;
    vm_version?: number;
    contract_code: Uint8Array | ArrayBuffer;
  }, senderInfo: SenderInfo): Promise<PostTxRes>;

  deployABI(param: {
    contract_abi: string | Uint8Array | ArrayBuffer;
    filetype?: string;
  }, senderInfo: SenderInfo): Promise<PostTxRes>;

  callContract(originFetchTemplate: OriginFetchTemplate, privateKey: Buffer | string): Promise<PostTxRes>;
}

export interface Config {
  baseUrl?: string;
  version?: number;
  crypto?: any;
}

export interface SDK {
  config: {
    baseUrl: string;
    version: number;
    crypto: any;
  };

  Api: Api;

  Tool: Tool;

  Wallet: Wallet;

  Contract: Contract;
}

interface BottosConstructor {
  new(config?: Config): SDK;
}

declare const BottosWalletSDK: BottosConstructor

export default BottosWalletSDK;