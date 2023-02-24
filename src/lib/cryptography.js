const arrayBufferToBase64 = (arrayBuffer) => {
  //
  const byteArray = new Uint8Array(arrayBuffer);
  let byteString = '';
  for (var i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i]);
  }
  const b64 = window.btoa(byteString);
  return b64;
};

const addNewLines = (str) => {
  //
  let finalString = '';
  while (str.length > 0) {
    finalString += str.substring(0, 64) + '\n';
    str = str.substring(64);
  }
  return finalString;
};

const toPem = (key, type) => {
  //
  const b64 = addNewLines(arrayBufferToBase64(key));
  const pem = `-----BEGIN ${type} KEY-----\n${b64}\n-----END ${type} KEY-----`;
  return pem;
};

export default toPem;
