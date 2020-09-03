import React, { useEffect, useState } from 'react'
import { ethers } from "ethers";
import { Card, Row, Col, List, Input, Button } from 'antd';
import { DownloadOutlined, UploadOutlined, CloseCircleOutlined, CheckCircleOutlined, RocketOutlined, SafetyOutlined } from '@ant-design/icons';
import { useContractLoader, useContractReader, useEventListener, useBlockNumber, useBalance, useTimestamp } from "./hooks"
import { Transactor } from "./helpers"
import { Address, Balance, Timeline, AddressInput, Blockie } from "./components"

import axios from 'axios';

const { Meta } = Card;
const contractName = "Songs"
var url = require('url');


export default function Songs(props) {


  const tx = Transactor(props.injectedProvider,props.gasPrice)

  const readContracts = useContractLoader(props.localProvider);
  const writeContracts = useContractLoader(props.injectedProvider);

  const songs = useContractReader(readContracts,contractName,"songs",[props.address],1777);
  const songUpdates = useEventListener(readContracts,contractName,"UpdateSong",props.localProvider,1);
  const donors = useEventListener(readContracts,contractName,"GiveProps",props.localProvider,1);

  const owner = useContractReader(readContracts,contractName,"owner",1777);
  const contractAddress = readContracts?readContracts[contractName].address:""




  console.log(window.location)
  let query =  url.parse(window.location.href);

  let access_token=""
  if(query.hash && query.hash.indexOf("#access_token=")>=0){
    console.log("query.hash",query.hash)
    access_token = query.hash.replace("#access_token=","").trim()
    access_token = access_token.substring(0,access_token.indexOf("&"))
  }


  const [ spotifyIdentity, setSpotifyIdentity] = useState("")
  useEffect(() => {
    axios.get('https://api.spotify.com/v1/me/?access_token='+access_token+'&token_type=Bearer&expires_in=3600')
    .then((response) => {
      console.log("!!!!spotifyIdentity",response.data);
        setSpotifyIdentity(response.data,()=>{
        console.log("!!!spotifyIdentity",spotifyIdentity)
      })
    })
  }, [access_token])



  const [ _song, setSong ] = useState("")
  const updateSong = (added)=>{
    return ()=>{
      tx(writeContracts['Songs'].updateSong(
        ethers.utils.formatBytes32String(_song), added
      ))
      setSong("")
      console.log("ethers song: ", ethers.utils.formatBytes32String(_song));
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



   let p = (item) => {
     console.log("item: ",item);
     return (
       <List.Item style={{ fontSize:22 }}>
           {item._from}
       </List.Item>
     )
   }



   let donorsDisplay = (
     <List
       style={{ width: 300, marginLeft:600, marginTop: 10}}
       header={<div><b>Donors</b></div>}
       bordered
       dataSource={donors}
       renderItem={item => {p(item)}}
    />
   )

   let donorlist = []


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
               tx({
                 to: creator,
                 value: ethers.utils.parseEther('0.001'),
               })
               console.log("TX done")
               donorlist.push(props.address)
               console.log("donorlist: ", donorlist)
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
   </div>
   );
}
