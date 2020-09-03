import React, { useState } from 'react'
import 'antd/dist/antd.css';
import { ethers } from "ethers";
import "./App.css";
import { Row, Col } from 'antd';
import { useExchangePrice, useGasPrice } from "./hooks"
import { Header, Account, Provider, Faucet, Ramp } from "./components"

import SmartContractWallet from './SmartContractWallet.js'
import Songs from './Songs.js'
import web3 from 'web3';



const mainnetProvider = new ethers.providers.InfuraProvider("mainnet","4af5ff9cd5644861ad8427b071b67929")
const localProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER?process.env.REACT_APP_PROVIDER:"http://localhost:8545")

function App() {

  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = useExchangePrice(mainnetProvider)
  const gasPrice = useGasPrice("fast")

  return (
    <div className="App">
      <Header />
      <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
        <Account
          address={address}
          setAddress={setAddress}
          localProvider={localProvider}
          injectedProvider={injectedProvider}
          setInjectedProvider={setInjectedProvider}
          mainnetProvider={mainnetProvider}
          price={price}
        />
      </div>
      <div style={{padding:40,textAlign: "left"}}>
        <Songs
          address={address}
          injectedProvider={injectedProvider}
          localProvider={localProvider}
          ensProvider={mainnetProvider}
          price={price}
          gasPrice={gasPrice}
        />
      </div>
      <div style={{padding:40,textAlign: "left"}}>
        <SmartContractWallet
          address={address}
          injectedProvider={injectedProvider}
          localProvider={localProvider}
          ensProvider={mainnetProvider}
          price={price}
          gasPrice={gasPrice}
        />
      </div>
      <div style={{position:'fixed',textAlign:'right',right:0,bottom:20,padding:10}}>
        <Row align="middle" gutter={4}>
          <Col span={10}>
            <Provider name={"mainnet"} provider={mainnetProvider} />
          </Col>
          <Col span={6}>
            <Provider name={"local"} provider={localProvider} />
          </Col>
          <Col span={8}>
            <Provider name={"injected"} provider={injectedProvider} />
          </Col>
        </Row>
      </div>
      <div style={{position:'fixed',textAlign:'left',left:0,bottom:20,padding:10}}>
        <Row align="middle" gutter={4}>
          <Col span={9}>
            <Ramp
              price={price}
              address={address}
            />
          </Col>
          <Col span={15}>
            <Faucet
              localProvider={localProvider}
              dollarMultiplier={price}
            />
          </Col>
        </Row>


      </div>

    </div>
  );
}

export default App;
