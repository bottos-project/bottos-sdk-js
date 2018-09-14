/*
  Copyright 2017~2022 The Bottos Authors
  This file is part of the Bottos Data Exchange Client
  Created by Developers Team of Bottos.

  This program is free software: you can distribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Bottos. If not, see <http://www.gnu.org/licenses/>.
*/

const { BasicPack } = require('bottos-js-msgpack')

exports.messageProtoEncode = (msg) => {
    let pArraySize = BasicPack.PackArraySize(9)
    let pVersion = BasicPack.PackUint32(msg.version)
    let pCursorNum = BasicPack.PackUint64(msg.cursor_num)
    let pCursorLabel = BasicPack.PackUint32(msg.cursor_label)
    let pLifeTime = BasicPack.PackUint64(msg.lifetime)
    let pSender = BasicPack.PackStr16(msg.sender)
    let pContract = BasicPack.PackStr16(msg.contract)
    let pMethod = BasicPack.PackStr16(msg.method)
    let pParam = BasicPack.PackBin16(Uint8Array.from(msg.param))

    let uint8Param = new Uint8Array(pParam.byteLength)
    for (let i = 0; i < pParam.byteLength; i++) {
        uint8Param[i] = pParam[i]
    }
    // console.log({ uint8Param })
    let pSigalg = BasicPack.PackUint32(msg.sig_alg)

    let buf = [...pArraySize, ...pVersion, ...pCursorNum, ...pCursorLabel, ...pLifeTime, ...pSender, ...pContract, ...pMethod, ...uint8Param, ...pSigalg]

    return buf

    // const ProtoMsg = new protojs.Message()

    // ProtoMsg.setVersion(msg.version)
    // ProtoMsg.setCursorNum(msg.cursor_num)
    // ProtoMsg.setCursorLabel(msg.cursor_label)
    // ProtoMsg.setLifetime(msg.lifetime)
    // ProtoMsg.setSender(msg.sender)
    // ProtoMsg.setContract(msg.contract)
    // ProtoMsg.setMethod(msg.method)
    // ProtoMsg.setParam(Uint8Array.from(msg.param))
    // ProtoMsg.setSigAlg(msg.sig_alg)

    // return ProtoMsg.serializeBinary();
}

// exports.queryProtoEncode = (protojs,msg)=>{
//     const ProtoMsg = new protojs.Message()

//     ProtoMsg.setUsername(msg.username)
//     ProtoMsg.setRandom(msg.random)

//     return ProtoMsg.serializeBinary()
// }
