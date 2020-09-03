import React, { useEffect, useState } from 'react'
import { ethers } from "ethers";
import { Card, Row, Col, List, Input, Button } from 'antd';
import { DownloadOutlined, UploadOutlined, CloseCircleOutlined, CheckCircleOutlined, RocketOutlined, SafetyOutlined } from '@ant-design/icons';
import { useContractLoader, useContractReader, useEventListener, useBlockNumber, useBalance, useTimestamp, useCustomContractLoader } from "./hooks"
import { Transactor } from "./helpers"
import { Address, Balance, Timeline, AddressInput, Blockie } from "./components"

import axios from 'axios';

const { Meta } = Card;
const contractName = "Songs"
var url = require('url');



// error: line 66 theek krni hai.. true aur false khaali placeholder k liye answer ayi ja rha

export default function Songs(props) {

  const [ _song, setSong ] = useState("")




  const tx = Transactor(props.injectedProvider,props.gasPrice)

  const readContracts = useContractLoader(props.localProvider);
  const writeContracts = useContractLoader(props.injectedProvider);


  const songs = useContractReader(readContracts,contractName,"songs",[ethers.utils.formatBytes32String(_song)],1777);
  const songUpdates = useEventListener(readContracts,contractName,"UpdateSong",props.localProvider,1);
  const donors = useEventListener(readContracts,contractName,"GiveProps",props.localProvider,1);
  const profiles = useEventListener(readContracts,contractName,"GetProfile",props.localProvider,1);


  const contractAddress = readContracts?readContracts[contractName].address:""
  const owner = useContractReader(readContracts,contractName,"owner",1777);
  const contractBalance = useBalance(contractAddress,props.localProvider)



  const updateSong = (added)=>{
    return ()=>{
      tx(writeContracts['Songs'].updateSong(
        ethers.utils.formatBytes32String(_song), added
      ))
      setSong("")
      let p = ethers.utils.formatBytes32String(_song);
      console.log("ethers song: ", p);
      console.log("songs: ",songs);
    }
  }



  // Mai display for songs jha song add krney hain
  let userDisplay = []
   userDisplay.push(
      <Row align="middle" gutter={4}>
        <Col span={8} style={{textAlign:"right",opacity:0.333,paddingRight:6,fontSize:24}}>Song:</Col>
        <Col span={10}>
          <input type="text" placeholder="song" onChange={(e) => (setSong(e.target.value))} />
        </Col>
        <Col span={6}>
          <Button style={{marginLeft:4}} onClick={updateSong(true)} shape="circle" icon={<CheckCircleOutlined />} />
          <Button style={{marginLeft:4}} onClick={updateSong(false)} shape="circle" icon={<CloseCircleOutlined />} />
        </Col>
      </Row>
   )

   let display
   if(readContracts && readContracts[contractName]){
     display = (
       <div>
         <Row align="middle" gutter={4}>
           <Col span={8} style={{textAlign:"right",opacity:0.333,paddingRight:6,fontSize:24}}>
             Deployed to:
           </Col>
           <Col span={16}>
             <Address value={contractAddress} />
           </Col>
         </Row>
         {userDisplay}
       </div>
     )
   }





   // Songs ki List mei se issey call ayegi individual song k liye
   let spotifySong = (s) => {

     // s is bytes32Song
     let utfSong = ethers.utils.parseBytes32String(s._song)
     let creator = s._sender

     return (
       <div>
         <iframe src={"https://open.spotify.com/embed/track/"+utfSong} width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
         <Blockie address={creator} size={8} scale={3}/>{s.added?"✅":"❌"}
         <Button size="2" style={{}} onClick={()=>{
               console.log("Account to Pay:",creator)
               console.log("song payed: ", s._song)

               tx( writeContracts['Songs'].giveProps(creator,s._song,{value: ethers.utils.parseEther('0.001')} ));

               console.log("TX done")
               tx(writeContracts['Songs'].getProfile(creator))
               console.log("get Profile done")
               }}>
               Give Props
         </Button>
       </div>
     )
   }



   return (
     <div>
       <Card
         title={(
           <div>
             📄🎸🎹🎵 Roxstar playlist
             <div style={{float:'right',opacity:owner?0.77:0.33}}>
               <Balance
                 address={contractAddress}
                 provider={props.localProvider}
                 dollarMultiplier={props.price}
               />
             </div>
           </div>
         )}
         size="large"
         style={{ width: 550, marginTop: 25 }}>
           <Meta
             description={(
               <div>
                 {display}
               </div>
             )}
           />
       </Card>
       <List
         style={{ width: 550, marginTop: 25}}
         header={<div><b>Playlist</b></div>}
         bordered
         dataSource={songUpdates}
         renderItem={item => (
           <List.Item style={{ fontSize:22 }}>
             {spotifySong(item)}
           </List.Item>
         )}
      />
      <List
        style={{ width: 550, marginTop: 25, }}
        header={<div><b>transactions</b></div>}
        bordered
        dataSource={donors}
        renderItem={item => (
          <List.Item style={{ fontSize:10 }}>
            <Address
              ensProvider={props.ensProvider}
              value={item._from}
            /> sent 0.01 ETh ◼️◼️ to
            <Address
              ensProvider={props.ensProvider}
              value={item._to}
            />
          </List.Item>
        )}
     />
   </div>
   );
}
