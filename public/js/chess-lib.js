'use strict';
var Chess = {};


void $(function(){
	
	/**
	* @private
	* shortcut to original methods
	**/
	var indexOf = String.prototype.indexOf;
	var create = Object.create;
	var test = RegExp.prototype.test;
	
	/**
	*@private
	* my helper varibles
	**/

	/* shortcut to find index of a place on board */
	var shortcut = {a:0 ,b: 8,c: 16,d:24,e:32,f:40,g:48,h:56 };

	/* abcmodel: all letters on board..... board: all moves on board*/
	var abcModel = 'abcdefgh';
	var board = 'a1 a2 a3 a4 a5 a6 a7 a8 b1 b2 b3 b4 b5 b6 b7 b8 c1 c2 c3 c4 c5 c6 c7 c8 d1 d2 d3 d4 d5 d6 d7 d8 e1 e2 e3 e4 e5 e6 e7 e8 f1 f2 f3 f4 f5 f6 f7 f8 g1 g2 g3 g4 g5 g6 g7 g8 h1 h2 h3 h4 h5 h6 h7 h8'.split(' ');

	var testBoard = /[a-h][1-8]/;
	var range = test.bind(/^[1-8]$/);

	/* a copy of my virtualDOM to use for predicting next moves in certain instances */
	var trialDOM = null;

	var chessPieces = {};
	var chessPiecesProto = {};
	// all pieces
	chessPieces.children = ['pawn','castle','bishop','horse','king','queen'];

	/* get row number and turn into Number */
	var row = _.compose( Number, _.last );

	var col = _.first;
	var colIndex = _.compose( _.bind(indexOf, abcModel), col );
	var isArea = test.bind(testBoard);

	var _chain = function(arr, next){
		return _.chain(arr).map( next ).compact().flatten().value();
	};

	var isOdd = function(num){ return num % 2 !== 0; };

	var isEven = function(num){	return !isOdd(num); };

	var regExpTestHolder = (function(obj_filled_with_regexp){ 
		var rules = obj_filled_with_regexp;
		return function(current_piece_object, current_move){
			return rules[ current_piece_object.team ].test( current_move );
		}
	});

	var copy = function(item, proto){
		/* copy a existing object */
		let copy = create(proto || Object.prototype);
		for(var key in item) if( item.hasOwnProperty(key) ) copy[key] = item[key];
		return copy
	};

	var toggle = function(item,tru,fal){
		/*
		* toggle items value
		* if tru and fal is presant it will comepare and return with tru and fal
		* if not tru and fal then will compare and return with true and false
		*/
		return (item === (tru || true) ) ? (fal || false) : ( tru || true );
	}

	function checkArea(newArea){
		/* check if newArea is a real spot on chess board.. isArea: boolean, newArea: newArea if real spot else false */
		return { isArea: isArea(newArea), newArea: !_.isNaN(newArea) ? newArea : false }
	}

	function formula(p,num1,num2){
		// area : a-h + 1-8; col: a-h; row: 1-8; 
		
		var a = colIndex(p) + num1, // find col index to add num1
			b = row(p) + num2; // add num2 to current row

		if( ( !_.isNumber(a) && _.isNaN(a) ) || !range(b) ) return;

		// abcModel grab new letter and concat letter and number b together
		return abcModel[ a ] + ( b ) ;

	}

	var verify = _.compose(checkArea,formula);

	var set = function(piece,cb){
		/* save piece and cb for use in _.filter([], cb) */
		return function forEachSetUp(val,i,arr){
			var one = _.first(val);
			var two = _.last(val);
			
			if(!isFinite(one) || !isFinite(two)){ 
				return getLineCord(piece, one , two); 
			}

			let area = verify( piece.position, one , two );
			if( area.isArea ){
				return cb(area.newArea)
			}
			return;
		}
	};

	function getLineCord( piece, one, two ){
		let DOM  = trialDOM || Chess.virtualDOM;
		let _one = ( !isFinite(one) ) ? ( ( one > 0 ) ? 1 : -1 ) : one;
		let _two = ( !isFinite(two) ) ? ( ( two > 0 ) ? 1 : -1 ) : two;
		let area = verify(piece.position, _one, _two );
		let arr  = [];

		while( area.isArea ){	
			/* stop if there is a teammate in the way */
			if( piece.friendlyFire( DOM[area.newArea].team ) ) break;

			arr.push(area.newArea);

			/* stop if a piece is in the way */
			if(DOM[area.newArea].team ) break;

			area = verify(area.newArea, _one, _two );
		}
		return arr;
	
	}
	/*
	* extend jquery methods
	*
	*/
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

	chessPiecesProto.formula = function(piece){
		var use = (piece.type === 'pawn') ? 
							this.solution[piece.team] : ( this.solution || [] );

		return _chain( use, this.next(piece) );
	}

	chessPiecesProto.next = function(piece){
		var DOM = trialDOM || Chess.virtualDOM
		return set( piece, function(newArea){
			if( piece.isEnemy( DOM[newArea].team ) ){
				return newArea
			}

		});
	}

	chessPiecesProto.makeAttacks = function(piece){
		var DOM = trialDOM || Chess.virtualDOM;
		return _.filter(piece.moves, function(val){
				let isDOMEmpty = !DOM.isEmpty(val);
				return isDOMEmpty ? piece.isEnemy( DOM[val].team) : false ;
			});
	}

	/* 
	* if chess Piece doesnt need to use hasMoved attribute then it will use this function
	* to just return true so it wont have conflict with undoing moves;
	*/
	chessPiecesProto.isStartPosition = function(){ return true; }

	_.each(chessPieces.children , function(val){
		chessPieces[val] = create(chessPiecesProto);
	});

	chessPieces.pawn.solution =  { white:[[0,1],[0,2]], black:[[0,-1],[0,-2]] };
	chessPieces.castle.solution = [[0,Infinity],[0, -Infinity],[Infinity,0],[-Infinity,0]]; 
	chessPieces.bishop.solution = [ [Infinity,Infinity], [-Infinity, Infinity], [-Infinity, -Infinity], [Infinity, -Infinity] ]; 
	chessPieces.horse.solution = [[-1,2],[-1,-2],[1,2],[1,-2],[-2,-1],[-2,1],[2,-1],[2,1]]; 
	chessPieces.king.solution = [[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]]; 
	chessPieces.queen.solution = _.union(chessPieces.bishop.solution, chessPieces.castle.solution); 


	// make pawn a queen
	chessPieces.pawn.canBecomeQueen = regExpTestHolder( {white: /8$/ , black:/1$/} );

	chessPieces.pawn.next = (function(){
		var fn = function( newArea ){
			var piece = this;
			var DOM = trialDOM || Chess.virtualDOM;
			var num = (piece.team === 'white') ? 2 : -2;
 			var movedToFar = row( piece.position ) + num === row( newArea );
			if( ( piece.hasMoved && movedToFar ) || !DOM.isEmpty(newArea) ){ return ;}
			return newArea;
		}

		return function(piece){ return set( piece, fn.bind(piece) );	}

	}());


	chessPieces.pawn.makeAttacks = function(piece){
		// debugger;
		var DOM = trialDOM || Chess.virtualDOM;
		let attacks = piece.friendlyFire('black') ? [[1,-1],[-1,-1]] : [[1,1],[-1,1]];
		let next = set( piece, function(newArea){
			if( !DOM.isEmpty(newArea) ) return  piece.friendlyFire( DOM[newArea].team ) ? undefined : newArea;

		});
		return _chain( attacks, next );
	};

	chessPieces.pawn.isStartPosition = regExpTestHolder( {white: /^[a-h]2$/ , black:/^[a-h]7$/} );

	chessPieces.castle.isStartPosition = regExpTestHolder({white:/a1|h1/, black:/a8|h8/});

	chessPieces.king.isStartPosition = regExpTestHolder({white:/^d1$/, black:/^d8$/});

	Chess.isCheckMate = function(){
		if(!Chess.Env.inCheck) return;

		var king = new Chess.Piece( $('.king.' + Chess.Env.turn ) ).eliminateProtection();

		if(king.moves.length === 0){
			let enemys = Chess.seeIfCheck( null,true);

			for(var i = 0; i < enemys.length;i++){
				let curr_piece = new Chess.Piece( $('#' + enemys[i] + '> span') );
				// can kill but will put himself in check ;
				if(Chess.seeIfCheck( curr_piece.position, false, toggle(Chess.Env.turn, 'white','black') )) return alert('die');
			}

			return true;

		} 
		return false;

	};

	Chess.seeIfCheck = (function(){
		const $pieces = $('.queen:first').add('.horse:first');

		return function(position, needHasInCheck,turn ){
			if( _.isBoolean(position) ){
				needHasInCheck = position;
				position = null;
			}
			let haveInCheck = [];
			let DOM = trialDOM || Chess.virtualDOM;
			let currTurn = turn || Chess.Env.turn;
			let kingPosition = position || $('.king.' + currTurn ).parentId();
			let Chess_piece_options = { position: kingPosition , team: currTurn };

			first:
			for(let i = 0; i < $pieces.length; i++){
				let current_piece = new Chess.Piece( $pieces[i] , Chess_piece_options );
				if( current_piece.attacks.length === 0 ) continue first;

				second:
				for(let j = 0; j < current_piece.attacks.length; j++){
					let enemy = new Chess.Piece( $('#' + current_piece.attacks[j] + '> span') );
					if( enemy.attacks.length === 0) continue second;

					if(_.contains(enemy.attacks, kingPosition) ) {
						if(turn && Chess.Env.inCheck && enemy.isType('king') ) return;
						if(needHasInCheck) haveInCheck.push( current_piece.attacks[j] );
						else return true;
					}

				}

			}
				if(haveInCheck.length !== 0 && needHasInCheck) return haveInCheck;
				return false;
		}
	}());

	/**
	*
	* ChessPiece constructor
	*
	**/

	Chess.Piece = function($element,basic,opt){
		if(!$element) throw new Error('no element to get info from');
		if(!( $element instanceof $) )  $element = $($element);
		if( _.isObject(basic) ){ 
			opt = basic;
			basic = false;
		}
		if(!opt) opt = {};
		if( _.isUndefined(basic) ) basic = false;

		this.type = opt.type || $element.getType();
		this.position = opt.position || $element.parentId();
		this.team = opt.team || $element.getTeam();
		this.self = opt.self || $element;

		if(!basic){
			
			this.hasMoved = this.self.attr('hasmoved') === 'true' ? true : false;
			this.isReadytoMove = false;
			this.areMovesActive = false;
			this.moves = chessPieces[this.type].formula(this);
			this.attacks = chessPieces[this.type].makeAttacks(this);

		}
	};

	Chess.Piece.isRelated = function(item){	return item instanceof Chess.Piece };


	/**
	*
	* ChessPiece.prototype
	* ui
	**/

	var cp = Chess.Piece.prototype;
	var moveAttackArray = ['attack','move'];

	var isKingInCheck = function(position){
		let back = copy( trialDOM[position] );
		
		trialDOM.update(position, this);
		let kingPosition = this.type !== 'king' ? null : position;
		let answer = !Chess.seeIfCheck( kingPosition );

		trialDOM[position] = back;
		return answer
	};

	cp.eliminateProtection = function(){
		if(this.attacks.length === 0 && this.moves.length === 0) return this;
		trialDOM = copy(Chess.virtualDOM, dom );

		_.each(moveAttackArray, function(val){
			let _val = val + 's';
			if(this[ _val ].length === 0) return;

			this[ _val ] = _.filter(this[ _val ], isKingInCheck, this);
		},this);

		trialDOM = null;
		return this;
	};

	_.each( moveAttackArray ,function(val){
		var _val = val[0].toUpperCase() + val.slice(1);
		cp['is' + _val] = function(current_move){ return _.contains(this[val + 's'], current_move) };
		cp['can' + _val] = function(current_move){ return this.isReadytoMove && this['is' + _val](current_move) ? true : false; }
	});

	/* check to see if different team*/
	cp.isEnemy = function(team){ return this.team !== team ; };

	/* check to see if same team*/
	cp.friendlyFire = function(team){ return this.team === team; };

	/* change move status*/
	cp.changeStatus = function(){ this.isReadytoMove = this.areMovesActive = toggle(this.areMovesActive); };

	/* move chess piece */
	cp.move = function( current_move ){

		$('#' + this.position + ' > span').appendTo('#' +  current_move);
		Chess.Env.changeTurn();

		if( Chess.Piece.isRelated(this) ){

			if(this.areMovesActive){ this.deactivateMoves(); }
			if(this.self.attr('hasmoved') === 'false'){	this.self.attr('hasmoved','true'); }

			// change pawn to queen if reached other side
			if( this.isType('pawn') && chessPieces.pawn.canBecomeQueen(this, current_move) ){
				console.log("im a queen yeeee");
				this.self.removeClass('pawn').addClass('queen');
			}
		}

	};

	cp.attack = function(current_move){
		$('#' + current_move).empty();
		this.move( current_move );
	};

	cp.isType = function(type){
		return this.type === type;
	};

	cp.deactivateMoves =
	cp.activateMoves = function(){

		this.changeStatus();

		_.each(this.moves,function(val){
			$('#' + val ).toggleClass('active');
		});
		_.each(this.attacks, function(val){
			$('#' + val).toggleClass('activeAttacks');
		});
	};


	/**
	* chess_Env_Prototype
	*
	* rules, check settings , playing setting
	**/
	var cep = {};

	cep.changeTurn = function(){
		this.turn = toggle(this.turn, 'white', 'black');
	};

	cep.isTurn = function($team){
		return this.turn === ( ($team instanceof $) ? $team.getTeam() : $team );
	};

	/* check */
	cep.outOfCheck = function(){
		this.inCheck = false;
	};

	cep.putInCheck = function(){
		this.inCheck = true;
		console.log('check');
	};

	/* check mate */
	cep.CheckMate = function(){
		alert('checkMate');
		this.checkMate = true;
	};

	cep.isCheckMate = function(){
		return this.checkMate;
	};

	/* history */
	cep.lastMoves = function(){
		var num = -2;

		if(this.history.length <= 2) {
			var holder = this.history;
			this.history = [];
			return holder;
		}

		if( isOdd( this.history.length ) ) num = -1;

		return this.history.splice( num );
	}

	/**
	* @public 
	* @param  
	*/
	cep.init = _.once(function(){
		this.turn = 'white';
		this.canCastle = true;
		this.CanPassPawn = true;
		this.canMoveBack = true;
		this.useHistory = true;
		this.history = [];
		this.inCheck = false;
		this.checkMate = false;
		this.saveHistoryTo = "local"; // {String: 'server', 'local'}
		this.typeOfGame = "2 player"; // {String: '2 player', 'computer', "online"}
	});

	Chess.Env = create(cep);

	/**
	*
	 * virtual DOM proto
	*
	**/
	var dom = {};

	dom.init = _.once(function(){
		var fn = function(val){
			var $this = $('#' + val);

			this[val] = $this.get(0).children.length !== 0 ? this.extract( $this.children() ) : this.emptyTemp();
		}

		return function(){ _.each( board , _.bind( fn, this ));	}
	}());

	dom.emptyTemp = function(){
		return { empty:true	};
	}

	dom.extract = function(info){
		if( !(info.type && info.team) && !Chess.Piece.isRelated(info) ){
			info = new Chess.Piece(info,true);
		}
		return _.pick(info,'type','team');
	};


	dom.update = function( moved_to_position, current_piece ){
		this[ current_piece.position ] = this.emptyTemp();
		this[ moved_to_position ] = dom.extract( current_piece );
	};

	dom.isEmpty = function(key){
		return this[ key ].hasOwnProperty('empty');
	};

	dom.updateDom = function( history, reverse){
		if(!history || _.isBoolean(history) ){ return;	}

		// use lastPostion if we are reversing and postion if we are moving fwd
		var use_position = !reverse ? history.position : history.lastPosition;

		Chess.Piece.prototype.move.call( history, use_position );
		Chess.virtualDOM.update(use_position, history );

	};

	dom.moveBack = function(){
		var lastMoves = Chess.Env.lastMoves();
		
		_.each(lastMoves, function(current_history){
			Chess.virtualDOM.updateDom(current_history, true );
			
			// if piece killed something put enemy piece back to origial spot
			if( current_history.killInfo.hasKilled ) {

				Chess.virtualDOM.addKillItem( current_history.position , current_history.killInfo , current_history );
			}

			// put hasMoved flag set to false
			if( current_history.firstMove) $('#' + current_history.lastPosition + "> span" ).attr('hasmoved','false');

		});
	};

	dom.addKillItem = (function(){
		//template for a chess Piece 
		var temp_1 = "<span class='";
		var temp_2 =  "'></span>";
		return function( position , killInfo , curr_item_info){

			var className = killInfo.killed.type + ' ' + killInfo.killed.team;
			$('#' + position).append(temp_1 + className + temp_2);

			Chess.virtualDOM.update(position, killInfo.killed);
		}
	}());

	Chess.virtualDOM = create(dom);
	

	/**
	*
	* history for server side and client
	*
	**/

	/*
	history = {
		lastPosition: { String }
		type: { String }
		team: { String }
		position: { String }
		killInfo : {
			hasKilled: Boolean
			killed: Boolean || String
		}
	}
	*/

	Chess.History = function(current_piece, newArea){
		if(!Chess.Env.useHistory){ 
			throw new Error('Chess.Env.useHistory is set to' + Chess.Env.useHistory);
		}

		var hasKilled =  Chess.virtualDOM.isEmpty( newArea ) ? false : true;
		var killInfo = { hasKilled: hasKilled, killed: false };

		_.extendOwn(this, _.pick( current_piece, 'type', 'team') );

		this.position = newArea;
		this.lastPosition = current_piece.position;
		this.firstMove = !current_piece.hasMoved && chessPieces[this.type].isStartPosition( this, current_piece.position );

		if(killInfo.hasKilled){
			killInfo.killed = copy( Chess.virtualDOM[newArea] );
		}
		this.killInfo = killInfo;

	};

	var historyProto = Chess.History.prototype;

	historyProto.save = function(){
		switch(Chess.Env.saveHistoryTo){
			case 'local':
				return void	Chess.Env.history.push(this);
			case 'server':
				return $.post( this );
			default:
				alert('could not save History');
		}

	}

});

