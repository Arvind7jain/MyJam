pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";

contract Songs {

  struct creator{
    uint256 amount;
    bytes32 song;
    address fan;
    bool exist;
  }

  mapping(bytes32 => bool) public songs;
  mapping(address => creator) public creators; //*_*//


  constructor() public { }



  event UpdateSong(address _sender,bytes32 _song,bool added);

  function updateSong(bytes32 _song, bool added) public {

    songs[_song] = added;

    console.log("Song bool set to",added);
    emit UpdateSong(msg.sender,_song,added);

    //////////////////////*_*//////////////////

    if(!creators[msg.sender].exist){
       creators[msg.sender].exist = true;
    }

    creators[msg.sender].song = _song;
  }





  event GiveProps(address _to,address _from, bytes32 _song, uint256 _value);

  function giveProps(address payable _to, bytes32 _song) public payable {
    /* require(
      msg.value>=5000000000000000,
      "Songs:giveProps Not Enough Value"
    ); */
    _to.transfer(msg.value);
    console.log("amount given", msg.value);
    emit GiveProps(_to, msg.sender,_song,msg.value);

    ////////////////////*_*/////////////////////////////

    creators[_to].fan = msg.sender;
    creators[_to].amount += 1;

  }



  ///////////////////////*_*////////////////////////
  //event GetProfile(address _creator,uint _amount, bytes32 _song, address _fan);

  function getProfile(address _creator) public returns (uint256, bytes32, address){
    creator memory p = creators[_creator];
    //emit GetProfile(_creator, p.amount, p.song, p.fan);
    return (p.amount, p.song, p.fan);
  }

}
