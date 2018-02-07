"use strict";

const env = {
  turn: "white",
  history:[],
  isGameOver: false;
};

$.fn.extend({
  getTeam: function(){
    return this.hasClass('white') ? 'white' : 'black';
  },
  getPieceType: function(num){
    let classNames = _.object(this.get(0).classList,true);

    for (let i = 0; i < chessPieces.allGamePieces.length; i++) {
      let pieceName = chessPieces.allGamePieces[i];
      if( classNames.hasOwnProperty(pieceName) ){
        return pieceName;
      }
    }
    return "";

  },
  getSquareId: function(){
    let $this = this.get(0);
    return ($this.nodeName === "SPAN" ? $this.parentElement : $this).id || "";
  }
});

// $(function(){

const board = {

  verifySquare: /^[a-f][1-8]$/,
// rowIdNumber: {'a': 0,'b':1,'c':2,'d':3,'e':4,'f':5,'g':6},
  node: document.getElementById('board')

};

board.getRowIdNumber = (function(){
  const rowIdNumber = {a:0,b:1,c:2,d:3,e:4,f:5,g:6};
  return (function(rowLetter){
    return rowIdNumber[rowLetter];
  });
}());

board.getRowLetter = (function(){
  const rowLetter = ['a','b','c','d','e','f','g'];
  return (function(rowNumber){
    return rowLetter[rowNumber];
  });
}());

board.isValidPosition = function(newSquare){
  return this.verifySquare.test(newSquare);
};

board.calcNewSquare = function(oldSquare,addToRow,addToCol){

// if( !verifySquare.test(oldSquare) ){ return; }

  let [row,col] = oldSquare;
  let newPosition = null;

  row = this.getRowLetter(this.getRowIdNumber(row) + addToRow);
  col = (Number(col) + addToCol);

  newPosition = row + col;

  return board.isValidPosition(newPosition) ? newPosition : false;

};


const boardSpaces = 'a1 a2 a3 a4 a5 a6 a7 a8 b1 b2 b3 b4 b5 b6 b7 b8 c1 c2 c3 c4 c5 c6 c7 c8 d1 d2 d3 d4 d5 d6 d7 d8 e1 e2 e3 e4 e5 e6 e7 e8 f1 f2 f3 f4 f5 f6 f7 f8 g1 g2 g3 g4 g5 g6 g7 g8 h1 h2 h3 h4 h5 h6 h7 h8'.split(' ');

// all chess pieces information
const chessPieces = {};

chessPieces.allGamePieces = ['pawn', 'queen', 'king', 'castle','bishop','horse'];


_.each( chessPieces.allGamePieces, function(pieceName, index, orgArray){
  chessPieces[pieceName] = {};
  chessPieces[pieceName].initializeUnique = _.noop;
});


chessPieces.pawn.possibleMoves = [[0,1],[0,2]];
chessPieces.king.possibleMoves = [[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]];
chessPieces.castle.possibleMoves = [[0,Infinity],[0, -Infinity],[Infinity,0],[-Infinity,0]];
chessPieces.horse.possibleMoves = [[-1,2],[-1,-2],[1,2],[1,-2],[-2,-1],[-2,1],[2,-1],[2,1]];
chessPieces.bishop.possibleMoves = [[Infinity,Infinity],[-Infinity, Infinity],[-Infinity, -Infinity],[Infinity, -Infinity]];
chessPieces.queen.possibleMoves = chessPieces.bishop.possibleMoves.concat(chessPieces.castle.possibleMoves);

chessPieces.pawn.initializeUnique = function(){};
chessPieces.castle.initializeUnique = function(){};
chessPieces.king.initializeUnique = function(){};



//Private function



/*
* constructor for single chess Piece
*/

function ChessPiece($piece){

  this.team = $piece.getTeam();
  this.type = $piece.getPieceType();
  this.currentSquare = $piece.getSquareId();
  this.attacks = [];
  this.moves = [];

  // calculate moves and attacks for this piece
  // this.calcMoves();
  console.log(this);
};


ChessPiece.prototype.calcMoves = function(){
  let pieceInfo = chessPieces[this.team];
  let currentSquare = this.currentSquare;

  pieceInfo.initializeUnique(moves);

  for(let i = 0, tracker = 0; i < pieceInfo.possibleMoves.length; i++){

    let [row,col] = pieceInfo.possibleMoves[i];

    if(( !isFinity(row) ) || ( !isFinity(col) )){
      _.noop();
    } else {
      let move = this.calcNewSquare(currentSquare, row, col);

      if(move) this.moves.push(move);

    }
  }
}



board.node.addEventListener('click', function(event){

// if(this.nodeName === 'SECTION'){ return; }

  let $target = $(event.target || event.srcElement);

  switch($target.get(0).nodeName){
    case "NAV":
      console.log("this is the nav bar");
      return;
    case "DIV":
      console.log("this is square: ", $target.getSquareId());
      break;
    case "SPAN":
      let activePiece = new ChessPiece($target);
      break;
  }



}, false);

// });



