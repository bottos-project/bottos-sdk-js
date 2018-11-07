const { getTransferFetchTemplate } = require('./lib/getFetchTemplate');

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
