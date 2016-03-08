//Mutable game state
var states = {
	symbol: {
		pl: '',
		com: ''
	},
	turn: '',
	board: ['', '', '',
			'', '', '',
			'', '', '']
};

$(function () {
	//Initialization
	$('.btn-pick').click(onSelectSymbol);
	$('#newGame').click(startNewGame);
	$('td').click(playerMove);
	startNewGame();
});

function startNewGame () {
	//Clear the states, have the player choose side again
	states = {
		symbol: {
			pl: '',
			com: ''
		},
		turn: '',
		board: ['', '', '',
				'', '', '',
				'', '', '']
	};
	$("td").text("");
	$("td").addClass("open");
	$("#pickSymbol").modal("show");
}

function onSelectSymbol (e) {
	//Start the game once the player has picked a side
	e.preventDefault();
	var symbol = $(e.target).data("symbol");
	states.symbol['pl'] = symbol;
	$("#pickSymbol").modal("hide");
	if (symbol == 'O') {
		states.symbol['com'] = 'X';
		states.turn = 'com';
		comStart();
	} else {
		states.symbol['com'] = 'O';
		states.turn = 'pl';
	}
}

function playerMove (e) {
	e.preventDefault();
	if (states.turn === 'pl') {
		if ($(e.target).hasClass('open')) {
			$(e.target).text(states.symbol['pl']);
			var index = Number(e.target.id);
			states.board[index] = states.symbol['pl'];
			$(e.target).removeClass('open');
			if (checkWinCondition ('pl', states.board)) {
				alert('player has won')
			} else if (states.board.indexOf('') === -1) {
				alert('draw')
			} else {
				states.turn = 'com';
				comMove();
			}
		}
	}
}

function comMove () {
	var cloneStates = JSON.parse(JSON.stringify(states));
	var move = minimax(cloneStates).choice;
	$('#' + move).text(states.symbol['com'])
	states.board[move] = states.symbol['com'];
	$('#' + move).removeClass('open');
	if (checkWinCondition ('com', states.board)) {
		alert('com has won')
	} else if (states.board.indexOf('') === -1) {
		alert('draw')
	} else {
		states.turn = 'pl';
	}
}

function comStart() {
	var potFirstMove = [0, 2, 6, 8];
	var rni = Math.floor(Math.random() * 4);
	var move = potFirstMove[rni];
	$('#' + move).text(states.symbol['com'])
	states.board[move] = states.symbol['com'];
	$('#' + move).removeClass('open');
	states.turn = 'pl';
}

function minimax(states) {
	if (checkWinCondition('com', states.board) ||
		checkWinCondition('pl', states.board) ||
		states.board.indexOf('') === -1) {
		return {
			score: calculateScore(states.board)
		};
	}

	var scores = [];
	var moves = [];

	var potMoves = getAvailableMoves(states.board);
	potMoves.forEach(function(move) {
		var newStates = mutateStates(states, move);
		var newResult = minimax(newStates);
		scores.push(newResult.score);
        moves.push(move);
	});

	if (states.turn === 'com') {
		//Maximizing
		var maxScoreIndex = getIndexOfMaxValue(scores);
        return {
        	choice: moves[maxScoreIndex],
        	score: scores[maxScoreIndex]
        };
	} else {
		//Minimizing
		var minScoreIndex = getIndexOfMinValue(scores);
        return {
        	choice: moves[minScoreIndex],
        	score: scores[minScoreIndex]
        };
	}
}

function mutateStates(states, move) {
	var newStates = JSON.parse(JSON.stringify(states));
	newStates.board[move] = newStates.symbol[newStates.turn];
	if (newStates.turn === 'pl') {
		newStates.turn = 'com';
	} else {
		newStates.turn = 'pl';
	}
	return newStates;
}

function getAvailableMoves(board) {
	//return an array of board indices that are empty
	var moves = [];
	for (var i = 0; i < board.length; i++) {
		if (board[i] === '') {
			moves.push(i);
		}
	}
	if (moves.length === 9) {
		return [0, 1, 4];
	} else {
		return moves;
	}
}

function calculateScore (board) {
	if (checkWinCondition('com', board)){
        return 1
	} else if (checkWinCondition('pl', board)) {
        return -1
    } else {
        return 0
    }
}

function checkWinCondition (side, board) {
	//Check Verticles
	for (var i = 0; i < 3; i++) {
		if (board[i] == board[i + 3] && board[i] == board[i + 6] && board[i] == states.symbol[side]) {
			return true;
		}
	}
	//Check Horizontals
	for (var j = 0; j < 9; j += 3) {
		if (board[j] == board[j + 1] && board[j] == board[j + 2] && board[j] == states.symbol[side]) {
			return true;
		}
	}
	//Check Diagonals
	if (board[0] === board[4] && board[0] === board[8] && board[0] === states.symbol[side] ||
		board[2] === board[4] && board[2] === board[6] && board[2] === states.symbol[side]) {
		return true;
	}
	return false;
}

function getIndexOfMaxValue(array) {
	var max = array[0];
	var index = 0;
	for (var i = 1; i < array.length; i++) {
		if (array[i] > max) {
			max = array[i];
			index = i;
		}
	}
	return index;
	//return randomMaxOrMin(max, array);
}

function getIndexOfMinValue(array) {
	var min = array[0];
	var index = 0;
	for (var i = 1; i < array.length; i++) {
		if (array[i] < min) {
			min = array[i];
			index = i;
		}
	}
	return index;
	//return randomMaxOrMin(min, array);
}

function randomMaxOrMin(m, array){
	var indices = array.map(function(value, index) {
		if (value === m) {
			return index;
		}
	}).filter(function(value) {
		return typeof value != 'undefined';
	});
	var rni = Math.floor(Math.random() * indices.length);
	return indices[rni];
}