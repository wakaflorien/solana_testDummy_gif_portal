import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from './idl.json'
import kp from './keypair.json'

import { Icon } from '@iconify/react';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const { SystemProgram, Keypair } = web3;

// let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

console.log("baseAccount", baseAccount.publicKey.toString())
const userAddress = baseAccount.publicKey.toString()

const programID = new PublicKey(idl.metadata.address)

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}



const TEST_GIFS = [
  'https://media.giphy.com/media/l1J9tb9W5YNEOPdgA/giphy.gif',
  'https://media.giphy.com/media/l1J9wFU6GJm8fsYco/giphy.gif',
  'https://media.giphy.com/media/3o7aCU1S05Gr77MG2c/giphy.gif',
  'https://media.giphy.com/media/l1J9AkPa5OChzycCs/giphy.gif',
]

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [inputValue, setInputValue] = useState(null)
  const [gifList, setGifList] = useState([])
  
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }
  
  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setGifList(account.gifList)
  
    } catch (error) {
      console.log("Error in getGifList: ", error)
      setGifList(null);
    }
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider)
      console.log("ping")
    
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
      
    } catch (error) {
      console.log("Erro creating BaseAccount account:", error)
    }
  }

  useEffect(() => {
    if(walletAddress){
      console.log('Fetching GIF list');
      getGifList()
    }
  }, [walletAddress])


  const checkIfWalletIsconnected = async () => {
  try {
      const { solana } = window;
      
      if(solana){
        // console.log("solana",solana)
        if(solana.isPhantom){
          console.log('Phantom wallet found! ')

          const response = await solana.connect({ onlyIfTrusted: true })
          console.log('Connected with Public Key :', response.publicKey.toString())
          setWalletAddress(response.publicKey.toString())
        }
      } else{
        alert('Solana object not found! Get a Phantom Wallet 👻')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async () => {
    const { solana } = window

    if(solana){
      const response = await solana.connect()
      console.log('Connected with Public Key :', response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  }

  const handleSubmit = async () => {
    if(inputValue.length === 0){
      console.log("No gif link provided")
      return 
    }
    setInputValue('')
    console.log("Gif link", inputValue)
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)

    await getGifList();
    } catch (error) {
      console.log("Error successfully sent to program", error)
    }
  }

  const renderNotConnectedContainer = () => (
      <button
      className = "cta-button connect-wallet-button"
      onClick={connectWallet}
       >Connect to Wallet</button>
    )
  
  const renderConnectedContainer = () => {
    if(gifList === null){
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization for GIF Program Account
          </button>
        </div>
      )
    } else {
      return (
        <div className="connected-container">
            <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit()
            }}
          >
            <input type="text" className="w-1/2 px-10 mr-2 my-5 py-3 border border-primary-200 rounded-xl" placeholder="Enter gif link!" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button type="submit" className="bg-primary-200 text-white text-xl px-10 py-2 rounded-xl">Submit</button>
          </form>
          <div className="flex flex-wrap items-center justify-center">
            {gifList.map((gif, index) => (
              <div className="relative mx-10 my-5 imgClass" key={index}>
                <div className="transition ease-in-out delay-150 absolute bottom-20 text-primary-200 font-bold px-2 opacity-0 duration-75 addClass">
                  <span className="text-2xl">Posted by : </span>
                  <h3 className="text-sm ">{userAddress}</h3>
                </div>
                <img src={gif.gifLink} alt={gif} className="w-96 h-72 rounded-md shadow-xl hover:cursor-pointer hover:opacity-30" />
                <div className="flex justify-start mt-5">
                  <div className="flex flex-row text-xl font-bold text-primary-200"><Icon icon="icon-park-outline:like" color="#202735" height="24" /><Icon icon="icon-park-solid:like" color="#202735" height="24" />181</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }


  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsconnected()
    };
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if(walletAddress){
      setGifList(TEST_GIFS)
    }
  }, [walletAddress])

  return (
    <div className="App">
      <div className={walletAddress? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="text-3xl font-extrabold my-2 text-primary-200">Dummy Test Stickers Portal ✨</p>
          {/* <h1 className="text-3xl font-bold my-4 text-primary-100">
            View your GIF collection in the metaverse ✨
         </h1> */}
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()} 
        </div>
        {/* <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div> */}
      </div>
    </div>
  );
};

export default App;
