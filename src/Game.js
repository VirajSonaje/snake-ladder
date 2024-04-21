import Dice from './Dice'
import Board from './Board';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, createContext, useRef } from 'react';
import gsap from "gsap";
import {useGSAP} from '@gsap/react';
import Button from './ResetButton';
import diceAudio from './diceAudio.mp3';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

export const playerContext = createContext();
export const ladderContext = createContext();
export const refContext = createContext();
export const diceRefContext = createContext();
export const imageRefContext = createContext();
const numberOfPlayers = 3;

const ladderMap = new Map([
  [10,12],
  [11,33],
  [20,38],
  [6,24],
  [40,59],
  [45,54],
  [64,78],
  [72,91],
  [86,96]

]);
const snakeMap = new Map([
  [19, 4],
  [13, 7],
  [48, 14],
  [57, 36],
  [68, 49],
  [83, 61],
  [87, 66],
  [94, 88],
  [98, 84]
]);

function Header(){
  return(
  
      <div className='translate-y-1/4 translate-x-10 mb-4'>
        <h1 className="text-white font-unbounded text-xl -mb-2 sm:text-3xl">Snakes and Ladders</h1>
        <hr className='border-2 border-white border-dotted -translate-y-full' />
      </div>
    
  );
  }

function Game(){
  const [open, setOpen] = useState(true);
  const handleOpen = () => setOpen(!open);
    const nodeRef = useRef(Array(numberOfPlayers));
    const [diceNum, setDiceNum] = useState(null);
    const [player, setPlayer] = useState(Array(numberOfPlayers).fill(1));
    const [reachedItemFlag, setReachedItemFlag] = useState(false);
    const animStartObj = useRef(null);
    const chance = useRef(0);
    let chanceString = `Player ${chance.current+1}'s chance`;
    const diceRef = useRef(null);
    const imageRef = useRef(null);
  let snlobj = {
    ladders: ladderMap,
    snakes: snakeMap
  };

async function diceAnim(diceRoll){
  var tl = gsap.timeline();
  setDiceNum(diceRoll);
  var audio = document.getElementById("audio");
  audio.play();
  await tl.to(diceRef.current, {rotateX:"270deg", rotateY:"360deg", transformOrigin:"60% 100%", duration:1.5, transition:"ease-in-out"});
  tl.to(diceRef.current, {rotateX:"0deg", rotateY:"0deg", transformOrigin:"60% 100%", duration:2, delay:1});
  setTimeout(()=>{
    setDiceNum(null);
  },1200)
}

async function roll(){
      
      let [diceRoll, nextPlayerPos] = await movePlayer(player, chance.current);
      animStartObj.current = await getPlayerCoords(nodeRef.current[chance.current]);
      diceAnim(diceRoll);
      await setPlayer(nextPlayerPos);
      setTimeout(() => {
        if(ladderMap.has(nextPlayerPos[chance.current]) || snakeMap.has(nextPlayerPos[chance.current])){
          animStartObj.current = getPlayerCoords(nodeRef.current[chance.current]);
            setReachedItemFlag(true);
        }

      }, 500);
      chance.current = await updateChance(chance.current)
      chanceString = `Player ${chance.current+1}'s chance`;
      console.log(nextPlayerPos)
    }

    useGSAP(()=>{
      console.log("usegsap " + chance.current)
      if(animStartObj.current !== null)  {
        const {top, left} = nodeRef.current[chance.current].getBoundingClientRect();
        gsap.from(nodeRef.current[chance.current], {
          x: animStartObj.current.left-left, 
          y: animStartObj.current.top-top, 
          duration: 0.5});
      } 
    },{ dependencies: [player], revertOnUpdate: false});
    
    function resetGame(){
        chance.current = 0;
        setPlayer(Array(numberOfPlayers).fill(1));
        setDiceNum(null);
        setReachedItemFlag(false);
    }
    
    useEffect(() => { 
      // console.log("useeffect item "+ psuedoChance)
        let afterItem = player.slice();
        if(reachedItemFlag && ladderMap.get(afterItem[chance.current])){
          afterItem[chance.current] = ladderMap.get(afterItem[chance.current]);
          setPlayer(afterItem);

        }
        else if(reachedItemFlag && snakeMap.get(afterItem[chance.current])){
          afterItem[chance.current] = snakeMap.get(afterItem[chance.current]);
          setPlayer(afterItem);

        }
        
        setReachedItemFlag(false);

    },[reachedItemFlag, player]);

    // async function utarChadhav(nextPlayerPos) { 
    //   console.log("utrarchadhav item "+ psuedoChance)
    //     let afterItem = player.slice();
    //     if(ladderMap.get(nextPlayerPos[psuedoChance])){
    //       console.log("seedi")
    //       afterItem[psuedoChance] = ladderMap.get(nextPlayerPos[psuedoChance]);
    //       await setPlayer(afterItem);
    //     }
    //     else if(snakeMap.get(nextPlayerPos[psuedoChance])){
    //       console.log("saap");
    //       afterItem[chance] = snakeMap.get(nextPlayerPos[psuedoChance]);
    //       await setPlayer(afterItem);
    //     }
    // }

    return <div className='grid grid-cols-12'>
      <refContext.Provider value={nodeRef}>
        <ladderContext.Provider value={snlobj}>
        <playerContext.Provider value={player}>
          <div className='col-span-12 sm:col-span-8'>
            <Board />
          </div>
        </playerContext.Provider>
      </ladderContext.Provider>
      </refContext.Provider>

    <diceRefContext.Provider value={diceRef}>
    <imageRefContext.Provider value={imageRef}>
    <div className='col-span-12 sm:col-span-4 justify-self-center sm:justify-self-start'>
      <Header/>
      <audio id="audio" src={diceAudio}></audio>
      <Dice number={diceNum} onDiceClick={() => roll()}/>
      <Button onButtonClick = {() => resetGame()}></Button>
      <h2 className='text-white -translate-y-[90px] translate-x-10'>{chanceString}</h2>
    </div> 
    </imageRefContext.Provider>
    </diceRefContext.Provider>
    <Dialog open={open} handler={handleOpen} className='' size='xl' style={{base:{backdrop:{backgroundColor:'white'}}}} animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}>
        <DialogHeader>Its a simple dialog.</DialogHeader>
        <DialogBody>
         Hello there
        </DialogBody>
        <DialogFooter>

          <button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Close</span>
          </button>
        </DialogFooter>
      </Dialog>
  </div>
  }
  
  export default Game;

function getPlayerCoords(domObj){
  let scrWid = window.screen.width;
  let {top, left} = domObj.getBoundingClientRect();
  if(scrWid<=480)
  {
    top = top-24;
  }
  return {top, left};
}

function movePlayer(player, chance){
  let min = 1;
  let max = 6;
  let nextPlayerPos = player.slice();
  let randDice = Math.floor(Math.random() * (max - min +1) ) + min;
  nextPlayerPos[chance] = randDice + player[chance];

  if(nextPlayerPos[chance] > 100) nextPlayerPos[chance] = nextPlayerPos[chance] - randDice;

  return [randDice, nextPlayerPos];
}

function updateChance(chance){
  chance = (chance +1)%numberOfPlayers ;
  return chance;
}
