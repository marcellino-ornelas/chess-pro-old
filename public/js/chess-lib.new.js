$(function(){
"use strict";

const env = {
  turn: "white",
  history:[],
  isGameOver: false,
  board: $("#board"),
  popUpDisplay: $(".pop-up"),
  boardType: "real",
  activePiece: null,
  isInCheck: false,
  fadeTime: 1000,
  putInCheck: function(){
    this.isInCheck = true;
    this.display("Check");
  },
  takeOutOfCheck: function(){
    this.isInCheck = false;
  },
  gameOver: function(){
    this.isGameOver = true;
    this.display("Check Mate")
  },
  changeTurn: function(){
    this.turn = (this.isTurn("white") ? "black" : "white");
    this.activePiece =null;
  },
  isTurn: function(team){
    return this.turn === team
  },
  changeBoards: function(type){
    let answer = type;
    if(!answer){ answer = (this.boardType === "real" ? "virtual" : "real"); }
    this.boardType = answer;
  },
  display: function(text){
    let me = this;
    me.popUpDisplay
      .css("z-index","2")
      .children(".pop-up-content")
      .text(text)
      .fadeIn(me.fadeTime / 2, function(){
        me.popUpDisplay.children(".pop-up-content").fadeOut(me.fadeTime,function(){
          me.popUpDisplay.css("z-index","0");
        });
      });
  }

};

$.fn.extend({
  hasMoved:function(){
    return this.attr("data-hasMoved") === "false" ? false : true
  },
  isChessRelated: function(){
    return  this.is(".chess-square,.chess-piece");
  },
  getTeam: function(){
    let $me = this;
    if($me.isChessRelated()){
      if( !$me.is(".chess-piece" ) ) $me = $me.children(".chess-piece");
      if($me.length){
        return ($me.hasClass('white') ? 'white' : 'black');
      }
    }
    return "";
  },
  getPieceType: function(){
    let $me = this;

    // must be a chess container or a chess piece
    if( $me.isChessRelated() ){

      if( $me.is(".chess-square") ){ $me = $me.children('.chess-piece') }
      if($me.length !== 0){

        let classNames = _.object($me.get(0).classList,true);

        for (let i = 0; i < chessPieces.allGamePieces.length; i++) {
          let pieceName = chessPieces.allGamePieces[i];
          if( classNames.hasOwnProperty(pieceName) ){
            return pieceName;
          }
        }
      }
    }
    return "";
  },
  getSquareId: function(){
    let $this = this.get(0);
    return ($this.nodeName === "SPAN" ? $this.parentElement : $this).id || "";
  }
});

/*
 * chess Pieces
 * This object will hold information about each piece
 * and special methods that will update the Chess Piece object
*/
const chessPieces = {};

chessPieces.allGamePieces = ['pawn', 'queen', 'king', 'castle','bishop','horse'];


// chess pieces data constructor
chessPieces.Data = function(){};

chessPieces.Data.prototype.possibleMoves = [];
chessPieces.Data.prototype.initializeUnique = _.noop;
chessPieces.Data.prototype.afterCalculations = _.noop;

_.each( chessPieces.allGamePieces, function(pieceName, index, orgArray){
  chessPieces[pieceName] = new chessPieces.Data();
});

chessPieces.all = new chessPieces.Data();

chessPieces.pawn.possibleMoves   = {white:[[0,1],[0,2]], black:[[0,-1],[0,-2]]};
chessPieces.king.possibleMoves   = [[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]];
chessPieces.castle.possibleMoves = [[0,Infinity],[0, -Infinity],[Infinity,0],[-Infinity,0]];
chessPieces.horse.possibleMoves  = [[-1,2],[-1,-2],[1,2],[1,-2],[-2,-1],[-2,1],[2,-1],[2,1]];
chessPieces.bishop.possibleMoves = [[Infinity,Infinity],[-Infinity, Infinity],[-Infinity, -Infinity],[Infinity, -Infinity]];
chessPieces.queen.possibleMoves  = chessPieces.bishop.possibleMoves.concat(chessPieces.castle.possibleMoves);
chessPieces.all.possibleMoves = chessPieces.queen.possibleMoves.concat(chessPieces.horse.possibleMoves)


chessPieces.pawn.initializeUnique = function(chessPiece){
  let possibleMoves = this.possibleMoves[chessPiece.team];
  let stopSliceAt = chessPiece.hasMoved ? 1 : possibleMoves.length;
  chessPiece.possibleMoves = possibleMoves.slice(0, stopSliceAt);
};

chessPieces.castle.initializeUnique = function(){};
chessPieces.king.initializeUnique = function(){};


chessPieces.pawn.afterCalculations = function(chessPiece){
  chessPiece.attacks = [];
  // step will be 1 or -1 depending on what team we are on
  let step = chessPiece.possibleMoves[0][1];
  let attackPositions = [[1,step],[-1,step]];

  _.each(attackPositions, function(item){
    let [row,col] = item;
    let newPosition = Board.calcNewSquare(chessPiece.currentSquare, row, col);

    if( !board.isOpen(newPosition) && chessPiece.isEnemy( board.get(newPosition).team ) ){
      chessPiece.attacks.push(newPosition)
    }
  });

};

// This constructor will make a object model of the chess board
function Board(){}

// see if square is empty
Board.prototype.isOpen = function(squareId){
  return this.hasOwnProperty(squareId) && this[squareId].type === "";
};

Board.prototype.get = function(position){
  if(!position || !Board.isValidPosition(position) ){
    return this
  }
  return this[position] || {};
}

Board.prototype.set = function(id, data){
  this[id] = data;
  this[id].currentSquare = id;
}

Board.prototype.updateBoard = function(newSquare,oldSquare,data){
  let holder = this.get(newSquare);
  this[newSquare] = this.get(oldSquare);
  this[newSquare].currentSquare = newSquare;
  this.empty(oldSquare);
  return holder
}

Board.prototype.empty = function(squareId){
  this[squareId] = new Board.squareData(squareId);
}


Board.prototype.replicate = function(oldBoard){
  for(var key in oldBoard){
    if( oldBoard.hasOwnProperty(key) ){
      let currentBoardSquare = oldBoard[key];
      this[key] = (new Board.squareData(key,currentBoardSquare.type, currentBoardSquare.team, currentBoardSquare.hasMoved));
    }
  }
};

// static methods
Board.getRowIdNumber = (function(){
  const rowIdNumber = {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7};
  return (function(rowLetter){
    return rowIdNumber[rowLetter];
  });
}());

Board.getRowLetter = (function(){
  const rowLetter = ['a','b','c','d','e','f','g','h'];
  return (function(rowNumber){
    return rowLetter[rowNumber];
  });
}());

Board.isValidPosition = RegExp.prototype.test.bind(/^[a-h][1-8]$/);

Board.calcNewSquare = function(oldSquare,addToRow,addToCol){

  let [row,col] = oldSquare;

  if(addToRow){ row = this.getRowLetter(this.getRowIdNumber(row) + addToRow); }
  if(addToCol){ col = (Number(col) + addToCol); }

  let newPosition = row + col;

  return Board.isValidPosition(newPosition) ? newPosition : false;
};

Board.squareData = function(currentSquare,type,team, hasMoved){
  this.currentSquare = currentSquare;
  this.type = type || "";
  this.team = team || "";
  this.hasMoved = hasMoved || false;
}

Board.makeId = function(squareId){ return "#" + squareId; }

let isKingInCheck = function(kingSquareId){
  let kingData = new ChessPiece( kingSquareId, true);
  kingData.data = chessPieces.all;
  kingData.possibleMoves = chessPieces.all.possibleMoves;

  kingData.calcMoves();

  for(let i = 0; i < kingData.attacks.length; i++){
    let currentAttack = kingData.attacks[i];

    let opponitePiece = new ChessPiece(currentAttack,true);
    opponitePiece.calcMoves();
    if( _.contains( opponitePiece.attacks, kingSquareId ) ){
      return true;
    }
  }

  return false;

}

Board.checkCheckMate = function(squareId){
/*
 * This will check if current team is in checkmate
*/
    let terminate = function(answer){
      env.changeBoards("real");
      board.virtual = new Board();
      return answer;
    }

    let canBeKilled = function(currentId,kingSquareId){
        let opponitePiece = new ChessPiece( currentId );
        return _.contains(opponitePiece.attacks, kingSquareId);
    }

    // save what board we are using before we switch into virtual
    let boardType = env.boardType;

    // switch to virtual board
    board.virtual.replicate( board.get());
    env.changeBoards("virtual");

    // can anything kill the king
    if(isKingInCheck(squareId)){

      env.putInCheck();

      let realking = new ChessPiece( squareId );
      let allMoves = realking.moves.concat(realking.attacks);

      // king can move to new spot
      if( !_.isEmpty( allMoves ) ){ return terminate(false); }

      // save just in case something breaks
      // for(let j = 0; j < allMoves.length; j++){
      //   // can the king move to a new spot
      //   let newSquare = allMoves[j];
      //   let oldKingSpot = squareId;
      //   let holder = board.updateBoard(newSquare, squareId);

      //   let canKingMoveToPossibleSquare = false;

      //   if(!isKingInCheck(newSquare)){ canKingMoveToPossibleSquare = true;}

      //   board.updateBoard( oldKingSpot, newSquare);
      //   board.set(newSquare, holder);

      //   if(canKingMoveToPossibleSquare) { return terminate(false); }

      // }

      let allTeamPieces = _.where(board.get(), {team: env.turn}).map(function(item){
        return new ChessPiece( item.currentSquare,true );
      });

      for(let index = 0; index < allTeamPieces.length; index++ ){
        // debugger;
        // can any piece move in front of the attacker
        let currentTeamMember = allTeamPieces[index];
        currentTeamMember.calcMoves();
        if(currentTeamMember.type === "king"){ continue };
        let currentTeamMemberMoves = currentTeamMember.moves.concat(currentTeamMember.attacks);

        for(let z = 0; z < currentTeamMemberMoves.length; z++){
          // all moves for  current team mate
          let teamMemberMoveSquareId = currentTeamMemberMoves[z];
          let teamMemberId = currentTeamMember.currentSquare
          let teamMemberHolder = board.updateBoard(teamMemberMoveSquareId, teamMemberId );

          if(!isKingInCheck(squareId)){ return terminate(false)}

          board.updateBoard(teamMemberId,teamMemberMoveSquareId);
          board.set(teamMemberMoveSquareId,teamMemberHolder);
        }

      }
      return terminate(true);
    }
    return terminate(false);
  };

Board.allSpaces = 'a1 a2 a3 a4 a5 a6 a7 a8 b1 b2 b3 b4 b5 b6 b7 b8 c1 c2 c3 c4 c5 c6 c7 c8 d1 d2 d3 d4 d5 d6 d7 d8 e1 e2 e3 e4 e5 e6 e7 e8 f1 f2 f3 f4 f5 f6 f7 f8 g1 g2 g3 g4 g5 g6 g7 g8 h1 h2 h3 h4 h5 h6 h7 h8'.split(' ');


const board = {
  real: new Board(),
  virtual: new Board(),
}

_.each(_.keys(Board.prototype), function(method){
  /*
   * Assign all methods from Board prototype to use with this board
   * the reason for this is when we want to predict future moves or see if a item can get attack
   * on a certain square we wont use the real board we want to use virtual.
   * env.boardType will point to what board we will use.
  */
  board[method] = function(){
    let me = board[env.boardType]
    return me[method].apply(me, arguments);
  }
});


_.each(Board.allSpaces, function(squareId){
  // populate the Board object model
  let $squareData = $("#" + squareId);

  let type = $squareData.getPieceType();
  let team = $squareData.getTeam();
  let hasMoved = $squareData.children(".chess-piece").hasMoved();

  board.real[squareId] = new Board.squareData(squareId, type, team, hasMoved);

});

/*
 * Chess Piece
 * This constructor will make a new chess piece
*/

function ChessPiece(squareId,dontCalculate){
   // debugger;
  let boardData = board.get(squareId);
  let me = this;

  this.$node = $("#" + squareId + " > .chess-piece");
  this.team = boardData.team;
  this.type = boardData.type;
  this.currentSquare = squareId;
  this.hasMoved = boardData.hasMoved;
  this.attacks = [];
  this.moves = [];

  this.data = chessPieces[this.type];
  this.possibleMoves = chessPieces[this.type].possibleMoves;

  // calculate moves and attacks for this piece
  // if dontCalculate is false
  if(!dontCalculate){
    this.calcMoves();

      function filterOutMoves(newSquareId){
        let holder = board.updateBoard(newSquareId, squareId);
        let answer = !isKingInCheck(kingsPosition.currentSquare);
        board.updateBoard(squareId,newSquareId);
        board.set(newSquareId,holder);
        return answer;
      }

      let boardType = env.boardType;

      if(env.boardType !== "virtual") {
        board.virtual.replicate( board.get() );
        env.changeBoards("virtual");
      }

      let kingsPosition = _.findWhere(board.get(), { team: this.team, type: "king"});
      this.attacks = this.attacks.filter(filterOutMoves);
      this.moves = this.moves.filter(filterOutMoves);

      env.changeBoards(boardType);
      if(boardType !== "virtual"){
        board.virtual = new Board();
      }
  }

};

ChessPiece.prototype.empty = function(){
  this.attacks = [];
  this.moves = [];
}


ChessPiece.prototype.isEnemy = function(teamName){
  return (!!teamName && this.team !== teamName);
}

ChessPiece.prototype.calcMoves = function(firstLevel){

  let parseInfinity = function(num){ return num < 0 ? -1 : 1; }
  // pawn king and castle have unique values that can be added
  // other piece types will have a empty function to stop error
  this.data.initializeUnique(this);

  for(let i = 0, tracker = 0; i < this.possibleMoves.length; i++){

    let [row,col] = this.possibleMoves[i];

    const isRowInfinity = !isFinite(row);
    const isColInfinity = !isFinite(col);

    let newPosition = this.currentSquare;
    let stopper = 1;

    if(isRowInfinity || isColInfinity ){
      // keep loop going until there is no newPosition
      // used for queen castle bishop
      stopper = Infinity;

      if( isRowInfinity ){ row = parseInfinity(row); }
      if( isColInfinity ){ col = parseInfinity(col); }
    }

    do{
      newPosition = Board.calcNewSquare(newPosition, row, col);
      // check to see if position is not false
      if( newPosition ){

        // set the destination to the moves array
        let square = board.get(newPosition);
        let dest = this.moves

        // check to see if new position has a piece on it
        if( !board.isOpen(newPosition) ){

          // break if theres a team mate at the new position
          if(!this.isEnemy( square.team )){ break; }

          // set destination to attacks because there is a enemy on it
          dest = this.attacks;
          // set stopper to 0 to end loop
          // loop should not continue if there is a piece in the way
          stopper = 0;
        }

        dest.push(newPosition);
        tracker++

      } else{ break; }

    } while( tracker < stopper)

    this.data.afterCalculations(this);
  }
}

ChessPiece.prototype.canMoveTo = function(squareId){
  return( _.contains(this.moves, squareId ) || _.contains(this.attacks, squareId ));
}

ChessPiece.prototype.CanAttack = function(squareId){
  return _.contains(this.attacks, squareId )
}


ChessPiece.prototype.move = function(squareId){
  // save old squareId
  let oldSquare = this.currentSquare;


  if(!this.hasMoved){
    board.get(this.currentSquare).hasMoved = true;
    this.hasMoved = true;
  }
  //  move the piece
  this.$node.appendTo( "#" + squareId );

  // turn off highlighted squares
  this.deactivateAllMoves();

  board.updateBoard(squareId, oldSquare);
  env.changeTurn();

}

ChessPiece.prototype.attack = function(squareId){
  $("#" + squareId).empty();
  this.move(squareId);
}


ChessPiece.prototype.activateAllMoves = function(){
  _.each(this.moves,function(squareId){
    $("#" + squareId).addClass("active-moves");
  });

  _.each(this.attacks, function(squareId){
    $("#" + squareId).addClass("active-attacks");
  });
}

ChessPiece.prototype.deactivateAllMoves = function(){
  _.each(this.moves,function(squareId){
    $("#" + squareId).removeClass("active-moves");
  });

  _.each(this.attacks, function(squareId){
    $("#" + squareId).removeClass("active-attacks");
  });
}
/************************
^^^^^^^ GAME LOGIC ^^^^^^
*************************/



env.board[0].addEventListener('click', function(event){

  let $target = $(event.target || event.srcElement);
  let piece = env.activePiece;

  if(!$target.isChessRelated() || env.isGameOver ){ return; }



  // if a enemy piece is selected
  if(env.activePiece && $target.is(".chess-piece") && env.activePiece.isEnemy($target.getTeam()) ){
    $target = $target.parent(".chess-square");
  }
  let squareId = $target.getSquareId();

  switch($target.get(0).nodeName){
    case "DIV":
      if( !piece ){ return; }


      if(piece.canMoveTo(squareId)){


        if( $("#" + squareId).is(".active-attacks") && piece.CanAttack(squareId) ){
          piece.attack(squareId);
        } else {
          piece.move(squareId);
        }

        let teamKingId = $(".king." + env.turn).parent().getSquareId();
        if(Board.checkCheckMate(teamKingId)){ return env.gameOver(); }
        if( env.isInCheck ){ env.takeOutOfCheck(); }
      }

      break;

    case "SPAN":
      if(!env.isTurn( $target.getTeam() )){return;}

      if(env.activePiece){
        env.activePiece.deactivateAllMoves();
      }

      env.activePiece = new ChessPiece(squareId);

      env.activePiece.activateAllMoves();
      break;
  }

});

});



