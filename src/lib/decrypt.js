export const formatPrivateKey = pem => {
  const lines = pem.split('\n');
  let encodedString = '';
  for(let i=0; i < lines.length; i++) {
      if (lines[i].indexOf('-----BEGIN PRIVATE KEY-----') < 0 && 
          lines[i].indexOf('-----END PRIVATE KEY-----') < 0) {
          encodedString += lines[i].trim();
      }
  }
  return atob(encodedString);
};

export const stringToArrayBuffer = byteString =>{
  const byteArray = new Uint8Array(byteString.length);
  for(let i=0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
  }
  return byteArray;
};

export const importPrivateKey = keyFile => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsText(keyFile)

      reader.onloadend = e => {
          const key = e.target.result;
          const formattedPrivateKey = formatPrivateKey(key)
          const privateKeyArrayBuffer = stringToArrayBuffer(formattedPrivateKey);
          return window.crypto.subtle.importKey(
                  "pkcs8",
                  privateKeyArrayBuffer,
                  {
                      name: "RSA-OAEP",
                      hash: {name: "SHA-256"}
                  },
                  true,
                  ["decrypt"]
          )
          .then(privateKey => {
              resolve(privateKey)
          })
          .catch(err => reject(err));
      }
  });
};

export const decryptCEK = (cek, cryptoKey) => {
  return window.crypto.subtle.decrypt(
      {
          name: 'RSA-OAEP'
      },
      cryptoKey,
      stringToArrayBuffer(atob(cek))
  );
};

export const importCEK = (cek) => {
  return window.crypto.subtle.importKey(
          "raw",
          cek,
          {
              name: "AES-GCM",
              hash: {name: "SHA-256"}
          },
          true,
          ["decrypt"]
  );
};

export const decryptAudio = (audio, cek, iv) => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(audio);

      reader.onloadend = e => {
          const audioFile = e.target.result;
          window.crypto.subtle.decrypt(
              {
                  name: 'AES-GCM',
                  iv: stringToArrayBuffer(atob(iv)),
              },
              cek,
              audioFile
          )
          .then(decryptedAudio => {
              resolve(decryptedAudio)
          })
          .catch(err => reject(err));
      }
  });
};


