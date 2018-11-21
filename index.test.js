const { getTransferFetchTemplate } = require('./lib/getFetchTemplate');
const BottosWalletSDK = require('./src/index');


test('check too long transfer params memo', () => {

  function checkParams() {
    const params = {
      from: 'a',
      to: 'b',
      value: '111',
      memo: 'abcdefghijklmnopqrstuvwxyz1234567'
    }
    getTransferFetchTemplate(params)
  }
  expect(checkParams).toThrow(Error);
  expect(checkParams).toThrow(/long/);
});

test('check invalid transfer params memo', () => {

  function checkParams() {
    const params = {
      from: 'a',
      to: 'b',
      value: '111',
      memo: '手枪'
    }
    getTransferFetchTemplate(params)
  }
  expect(checkParams).toThrow(Error);
  expect(checkParams).toThrow(/invalid/);
});


test('node fetch trx info', done => {
  const sdk = new BottosWalletSDK({
    baseUrl: "http://wallet.bottos.org:8689/v1"
  });
  const Tool = sdk.Tool

  Tool.getTransactionInfo('0e646769af440642e9490944ff63a77bad1dcf1e72716584829d48524e7c343a')
    .then(res => {
      // console.log('res', res)
      expect(res.errcode).toBe(0)
      done()
    })
})