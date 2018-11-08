
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

interface Api {
  chain_id: string;

  request(url: string, params: any, method?: string): Promise<Response>;

  getAbi(contract: string): Promise<Response>;
  getAbi(contract: string, callback: FunctionCallback): void;

  getBlockHeader(): Promise<Response>;
  getBlockHeader(callback: FunctionCallback): void;

}

interface Tool {

  _Api: Api;

  buf2hex(b: Buffer | string): string;

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
  }, privateKey: Buffer | string): Promise<any>;

  stake: StakeLike;
  unstake: StakeLike;
  claim: StakeLike;

  vote: VoteLike;
  cancelVote: VoteLike;
}


interface Contract {
  deployCode(param: {
    vm_type?: number;
    vm_version?: number;
    contract_code: Uint8Array | ArrayBuffer;
  }, senderInfo: SenderInfo): Promise<any>;

  deployABI(param: {
    contract_abi: string | Uint8Array | ArrayBuffer
  }, senderInfo: SenderInfo): Promise<any>;

  callContract(originFetchTemplate: OriginFetchTemplate, privateKey: Buffer | string): Promise<any>;
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