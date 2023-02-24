import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toPem from './lib/cryptography';

// Test public key payload
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmxRycbN0VDAMTrJD9iPL
zSmr3I7glfFNncbwpK8jW9+9JXRkQwtED3C9HSEQjOjs3PRRGoadQsWEYWv0dlld
WplJtDnsfMDSqj8+G2Ju1Ni50XqzdEM5h3hIIjyOZM+1t1GvIj6ZqdgCybWmhlr4
mp1Ah25sTtfghte96qR2K6PInXTmMl36+ezifUgE14A0Z3YoLO8Wka8HiLzC2rBG
eD9fy3Fbh3VBxsa3YrQnHA+bInHBLnBW5mNC0qSBVyx+dJK3piAA0ZvoYf5CqEIx
LUZIm7rNDloYmePydTW4ITZzZZhLgB7kVcTshuQlbD6n7vJAkf86m3FaX/8ATYsD
qwIDAQAB
-----END PUBLIC KEY-----`;

const WebSocketServer = 'ws://localhost:5555/';

const App = () => {
  const [message, setMessage] = useState('');
  const [cek, setCek] = useState('');

  const [client, setClient] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [wSocket, setWSocket] = useState();

  const decryptFile = (encryptedCEK, encryptionIV) => {
    // 1) Obtain encrypted_cek, iv parameters within EncryptionDetails via recordingStatusCallback or
    // by performing a GET on the recording resource
    //const audioFile = document.getElementById('inputFile').files[0];
    //const privateKeyFile = document.getElementById('privateKeyFile').files[0];
    //const encryptedCEK = encCEK;
    //const encryptionIV = document.getElementById('iv').value.trim();

    // 2) Retrieve customer private key corresponding to public_key_sid and use it to decrypt base 64 decoded
    // encrypted_cek via RSAES-OAEP-SHA256-MGF1
    importPrivateKey(privateKeyFile)
      .then((importedKey) => {
        console.log('importedKey', importedKey);

        return decryptCEK(encryptedCEK, importedKey);
      })
      .then((decryptedCEK) => {
        console.log('decryptedCEK', decryptedCEK);

        return importCEK(decryptedCEK);
      })
      // 3) Initialize a AES256-GCM SecretKey object with decrypted CEK and base 64 decoded iv
      // and decrypt encrypted recording.
      .then((importedCEK) => {
        console.log('importedCEK', importedCEK);
        return decryptAudio(audioFile, importedCEK, encryptionIV);
      })
      .then((decryptedAudio) => {
        console.log('audio decrypted!');
        init();
        playByteArray(decryptedAudio);
      })
      .catch((err) => {
        console.log('error decrypting audio', err);
      });
  };

  const connect = () => {
    const socket = new WebSocket(WebSocketServer);
    socket.onopen = () => {
      console.log('WebSocket Client Connected');
      setClient(socket);
      setIsConnected(true);
      setIsStarted(false);
    };
    socket.onmessage = (event) => {
      setMessage(event.data);
    };
    socket.onclose = (event) => {
      console.log('WebSocket Client Closed');
      setIsConnected(false);
    };
    socket.onerror = (error) => {
      console.log('WebSocket Client Error!', { error });
    };
    setWSocket(socket);

    return () => {
      socket.close();
      setIsConnected(false);
      setWSocket(null);
    };
  };

  const disconnect = () => {
    wSocket.close();
    setIsConnected(false);
    setWSocket(null);
    setIsStarted(false);
  };

  const sendMessage = (command) => {
   
    const payload = {
      TransactionId: uuidv4(),
      TransactionDate: Date.now().toString(),
      UploadUrl: 'https://localhost',
      InteractionPublicKey: publicKey,
      Command: command,
      FrameRate: 1,
      Quality: 1,
      SplitFiles: true,
      SplitSize: 60,
      CaptureAudioInput: true,
      CaptureAudioOutput: true,
    };
    if (client && isConnected) {
      client.send(JSON.stringify(payload));
      setRecording(!recording);
      setIsStarted(!isStarted);
    }
  };

  const generate = () => {
    /* //const encryptedMessage = CryptoJS.AES.encrypt('test', publicKey, { iv: 'initialvector' }).toString();

    const encryptedMessage = crypto.publicEncrypt(publicKey, 'test');

    console.log({ encryptedMessage });

     var original = CryptoJS.AES.decrypt(encryptedMessage, privateKey, { iv: 'initialvector' }).toString(
      CryptoJS.enc.Utf8
    ); 

    const original = crypto.privateDecrypt(privateKey, encryptedMessage);

    console.log({ original: original }); */
  };

  const generateKeyPair = () => {
   /*  setStartTime(Date.now);
    window.crypto.subtle
      .generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: { name: 'SHA-256' },
        },
        true,
        ['encrypt', 'decrypt']
      )
      .then((keyPair) => {
        //
        window.crypto.subtle
          .exportKey('pkcs8', keyPair.privateKey)
          .then((exportedKey) => {
            //
            const privateKey = toPem(exportedKey, 'PRIVATE');
            setMessage(privateKey);
            setEndTime(Date.now);
          })
          .catch((err) => {
            setMessage(err.message);
          });

        window.crypto.subtle
          .exportKey('spki', keyPair.publicKey)
          .then((exportedKey) => {
            //
            const publicKey = toPem(exportedKey, 'PUBLIC');
            setMessage1(publicKey);
            setEndTime(Date.now);
          })
          .catch((err) => {
            setMessage1(err.message);
          });

        generateCEK(publicKey);
      }); */
  };

  const generateCEK = () => {
    /* const CEK = CryptoJS.lib.WordArray.random(128 / 8).toString();

    const encryptedCEK = window.crypto.subtle.encrypt(CEK, publicKey, {
      mode: enc.Base64,
      padding: enc.pk,
    });


    setIV(encryptedCEK.iv.toString());
    return { CEK, encryptedCEK }; */
  };

  const ConnectButton = (text, callback) => {
    const className = 'px-4 py-2 rounded-md text-white font-bold ';
    const modifier = isConnected ? 'bg-red-600 hover:bg-red-800' : 'bg-green-600 hover:bg-green-800';
    return (
      <button className={className + modifier} onClick={callback}>
        {text}
      </button>
    );
  };

  const RecordButton = (text, callback) => {
    const className = 'px-4 py-2 rounded-md text-white font-bold ';
    const modifier = isStarted ? 'bg-red-600 hover:bg-red-800' : 'bg-green-600 hover:bg-green-800';
    return (
      <button className={className + modifier} onClick={callback}>
        {text}
      </button>
    );
  };

  return (
    <div className='flex flex-col w-full h-full '>
      <div className='flex flex-row w-full  justify-between '>
        {!isConnected && ConnectButton('Connect', connect)}
        {isConnected && ConnectButton('Disconnect', disconnect)}

        {isConnected && !isStarted && RecordButton('Start Recording', () => sendMessage('start'))}
        {isConnected && isStarted && RecordButton('Stop Recording', () => sendMessage('stop'))}
      </div>

      <div className='mt-4 border border-dashed border-slate-500 p-4 flex'>
        <label>LOG</label>:{message}
      </div>
      <div className='mt-4 border border-dashed border-slate-500 p-4 flex'>
        <label>CEK</label>:{cek}
      </div>
    </div>
  );
};

export default App;
