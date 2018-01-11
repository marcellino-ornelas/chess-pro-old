const env = {
	turn: "white",
	history:[]
};



$(function(){

	const rules = {


		verifySpot: //


	};

	// all chess pieces information
	const allGamePieces = ['pawn', 'queen', 'king', 'castle','bishop','horse'];

	const boardSpaces = 'a1 a2 a3 a4 a5 a6 a7 a8 b1 b2 b3 b4 b5 b6 b7 b8 c1 c2 c3 c4 c5 c6 c7 c8 d1 d2 d3 d4 d5 d6 d7 d8 e1 e2 e3 e4 e5 e6 e7 e8 f1 f2 f3 f4 f5 f6 f7 f8 g1 g2 g3 g4 g5 g6 g7 g8 h1 h2 h3 h4 h5 h6 h7 h8'.split(' ');


 	const __pieces__ = {};

 	_.each( allGamePieces, function(pieceName, index, orgArray){
 		__pieces__[pieceName] = {};
 		__pieces__[pieceName].initializeUnique = _.noop;
 	});


	__pieces__.pawn.possibleMoves = [[0,1],[0,2]];
	__pieces__.king.possibleMoves = [[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]]; 
	__pieces__.castle.possibleMoves = [[0,Infinity],[0, -Infinity],[Infinity,0],[-Infinity,0]];
	__pieces__.horse.possibleMoves = [[-1,2],[-1,-2],[1,2],[1,-2],[-2,-1],[-2,1],[2,-1],[2,1]];
	__pieces__.queen.possibleMoves = _.union(__pieces__.bishop.solution, __pieces__.castle.solution); 
	__pieces__.bishop.possibleMoves = [[Infinity,Infinity],[-Infinity, Infinity],[-Infinity, -Infinity],[Infinity, -Infinity]]; 

 	__pieces__.pawn.initializeUnique = function(){};
	__pieces__.castle.initializeUnique = function(){};
	__pieces__.king.initializeUnique = function(){};



 // queen



	function calcMoves($currentPiece){
		let pieceInfo = __pieces__[$currentPiece.type];
		
		pieceInfo.initializeUnique($currentPiece);

		for(let i = 0, tracker = 0; i < pieceInfo.possibleMoves.length; i++){

				let [row,col] = pieceInfo.possibleMoves[i];

			_.noop();

		}




	};



	/*
	 * constructor for single chess Piece
	*/

	function __ChessPiece__(){
		this.type = '';

	};

});



/*

	$.fn.extend({
		getTeam: function(){
			return this.hasClass('white') ? 'white' : 'black';
		},
		getType: function(num){
			var pieces = chessPieces.children
			for(var i = 0; i < pieces.length; i++){
				if(this.hasClass( pieces[i] ) ) return pieces[i];
			}
		},
		parentId: function(){
			return this.parent().get(0).id;
		}
	});


*/
