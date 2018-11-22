const Abi = {
  "structs": [
    {
      "name": "NewAccount",
      "base": "",
      "fields": {
        "name": "string",
        "pubkey": "string"
      }
    },
    {
      "name": "Transfer",
      "base": "",
      "fields": {
        "from": "string",
        "to": "string",
        "value": "uint256",
        "memo": "string"
      }
    },
    {
      "name": "SetDelegate",
      "base": "",
      "fields": {
        "name": "string",
        "pubkey": "string",
        "location": "string",
        "description": "string"
      }
    },
    {
      "name": "GrantCredit",
      "base": "",
      "fields": {
        "name": "string",
        "spender": "string",
        "limit": "uint256"
      }
    },
    {
      "name": "CancelCredit",
      "base": "",
      "fields": {
        "name": "string",
        "spender": "string"
      }
    },
    {
      "name": "TransferFrom",
      "base": "",
      "fields": {
        "from": "string",
        "to": "string",
        "value": "uint256"
      }
    },
    {
      "name": "DeployCode",
      "base": "",
      "fields": {
        "contract": "string",
        "vm_type": "uint8",
        "vm_version": "uint8",
        "contract_code": "bytes"
      }
    },
    {
      "name": "DeployABI",
      "base": "",
      "fields": {
        "contract": "string",
        "contract_abi": "bytes",
        "filetype": "string"
      }
    },
    {
      "name": "RegDelegate",
      "base": "",
      "fields": {
        "name": "string",
        "pubkey": "string",
        "location": "string",
        "description": "string"
      }
    },
    {
      "name": "UnregDelegate",
      "base": "",
      "fields": {
        "name": "string"
      }
    },
    {
      "name": "VoteDelegate",
      "base": "",
      "fields": {
        "voteop": "uint8",
        "voter": "string",
        "delegate": "string"
      }
    },
    {
      "name": "Stake",
      "base": "",
      "fields": {
        "amount": "uint256"
      }
    },
    {
      "name": "Unstake",
      "base": "",
      "fields": {
        "amount": "uint256"
      }
    },
    {
      "name": "Claim",
      "base": "",
      "fields": {
        "amount": "uint256"
      }
    },
    {
      "name": "BlkProdTrans",
      "base": "",
      "fields": {
        "actblknum": "uint64"
      }
    }
  ],
  "actions": [
    {
      "action_name": "newaccount",
      "type": "NewAccount"
    },
    {
      "action_name": "transfer",
      "type": "Transfer"
    },
    {
      "action_name": "grantcredit",
      "type": "GrantCredit"
    },
    {
      "action_name": "cancelcredit",
      "type": "CancelCredit"
    },
    {
      "action_name": "transferfrom",
      "type": "TransferFrom"
    },
    {
      "action_name": "deploycode",
      "type": "DeployCode"
    },
    {
      "action_name": "deployabi",
      "type": "DeployABI"
    },
    {
      "action_name": "regdelegate",
      "type": "RegDelegate"
    },
    {
      "action_name": "unregdelegate",
      "type": "UnregDelegate"
    },
    {
      "action_name": "votedelegate",
      "type": "VoteDelegate"
    },
    {
      "action_name": "stake",
      "type": "Stake"
    },
    {
      "action_name": "unstake",
      "type": "Unstake"
    },
    {
      "action_name": "claim",
      "type": "Claim"
    },
    {
      "action_name": "setdelegate",
      "type": "SetDelegate"
    },
    {
      "action_name": "blkprodtrans",
      "type": "BlkProdTrans"
    }
  ],
  "transactionAbi": {
    "version": "uint32",
    "cursor_num": "uint64",
    "cursor_label": "uint32",
    "lifetime": "uint64",
    "sender": "string",
    "contract": "string",
    "method": "string",
    "param": "string",
    "sig_alg": "uint32",
    "signature": "signature"
  }
}

module.exports = Abi