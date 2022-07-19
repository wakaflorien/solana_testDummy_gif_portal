import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [inputValue, setInputValue] = useState(null)
  const [gifList, setGifList] = useState([])

  const TEST_GIFS = [
    'https://media.giphy.com/media/l1J9tb9W5YNEOPdgA/giphy.gif',
    'https://media.giphy.com/media/l1J9wFU6GJm8fsYco/giphy.gif',
    'https://media.giphy.com/media/3o7aCU1S05Gr77MG2c/giphy.gif',
    'https://media.giphy.com/media/l1J9AkPa5OChzycCs/giphy.gif',
  ]

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
    if(inputValue !== null) {
      console.log("Provided link", inputValue)
      setGifList([...gifList, inputValue])
      setInputValue('')
    } else{
      console.log("no link provided !")
    }
  }

  const renderNotConnectedContainer = () => (
      <button
      className = "cta-button connect-wallet-button"
      onClick={connectWallet}
       >Connect to Wallet</button>
    )
  
  const renderConnectedContainer = () => (
    <div className="connected-container">
      <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit()
      }}
    >
      <input type="text" placeholder="Enter gif link!" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <button type="submit" className="cta-button submit-gif-button">Submit</button>
    </form>
      <div className="flex flex-wrap">
        {gifList.map((gif, index) => (
          <div className="gif-item" key={index}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  )


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
          <p className="header">Stickers GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
         </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()} 
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
