var currPiece;
$(function(){

	/*
	* Element variables
	*/
	var el = document.getElementById('board');
	var backButton = $('#back');

	/*
	* Start Chess settings
	* make virtualDOM
	*/
	Chess.Env.init();
	Chess.virtualDOM.init();
	
	function initChessDev( postion, currentPiece ){
		if( Chess.Env.useHistory ) {

			var history_for_turn = new Chess.History( currentPiece, postion);

			// save history
			history_for_turn.save();
		}

		Chess.virtualDOM.update( postion, currentPiece );


		if( Chess.seeIfCheck() ) {

			Chess.Env.putInCheck();

			if( Chess.isCheckMate() ){

				Chess.Env.CheckMate();

				// remove event listener
				el.removeEventListener('click', gameEventListener );
			}
		}
	}

	function gameEventListener (e){

		if( Chess.Env.isCheckMate() ) return;

		e.stopPropagation();
		var $this = $(e.target);
		var position = $this.attr('id') || $this.parentId();
		let moved = false;

		 switch( e.target.nodeName ){
		 	case 'SPAN':

				if( Chess.Env.isTurn( $this ) ){
					
					if(currPiece && currPiece.areMovesActive){
						currPiece.deactivateMoves();	

						if(position === currPiece.position) return;
					}

					currPiece = new Chess.Piece($this).eliminateProtection();
					
					currPiece.activateMoves();
					return;
				}

		 	case 'DIV' :
			 	if( _.isUndefined(currPiece) || ( currPiece && !currPiece.areMovesActive )) return;

				if( !currPiece.canAttack(position) && currPiece.canMove(position) ){
					currPiece.move(position);
					moved = true;
				}


		 	default:
				if(currPiece && currPiece.canAttack(position) && !moved ){
					currPiece.attack( position );
					moved = true;
				}
				if(moved){
					if(Chess.Env.inCheck) { Chess.Env.outOfCheck(); console.log('out of check')}
					initChessDev(position, currPiece);
				}

				return;
		 }


	}


	backButton.click(function(){ Chess.virtualDOM.moveBack(); });
	el.addEventListener('click', gameEventListener );
});








