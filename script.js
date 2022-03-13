let originalBoard;
const humanPlayer = 'o';
const cpuPlayer = 'x';
const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]

// マス取得
const cells = document.querySelectorAll('.cell');
startGame();

// メッセージ・マス中身・ox文字列・色など全て初期化
function startGame() {
  // メッセージ消去
	document.querySelector(".endgame").style.display = "none";
  // 9つの配列生成キー取得[0, 1, 2, 3, 4, 5, 6, 7, 8,]
	originalBoard = Array.from(Array(9).keys());
  // oxなどの文字列・背景色消去
	for (let i = 0; i < cells.length; i++) {
		cells[i].innerText = '';
    cells[i].style.backgroundColor = 'initial';
    // bubblingフェーズ
		cells[i].addEventListener('click', turnClick, false);
	}
}

// マス押下後の挙動
function turnClick(square) {
	// マス選択前は数値型、マス選択後は○か×で埋められる
	if (typeof originalBoard[square.target.id] == 'number') {
		turn(square.target.id, humanPlayer);
				// ゲーム続行挙動
				// 押下済みの箇所を探し、避け cpuのターンへ
		if (!checkWin(originalBoard, humanPlayer) && !checkTie()) turn(bestSpot(), cpuPlayer);
	}
}

// player切り替え
function turn(squareId, player) {
	originalBoard[squareId] = player;
	document.getElementById(squareId).innerText = player;
		// 勝利挙動
	let gameWon = checkWin(originalBoard, player)
		// どちらかが勝利すれば作動
	if (gameWon) gameOver(gameWon)
}

// let plays = playerがplayしたものを探す
function checkWin(board, player) {
	// elementがPlayerだったら累積値に配列のindexを連結
	// elementがPlayerじゃなかったら累積値を返すだけ
	let plays = board.reduce((accumulator, element, index) =>
		(element === player) ? accumulator.concat(index) : accumulator, []);
	// どちらも勝てなければnull
	let gameWon = null;
	// winCombosの[index, 勝利要素]を取得するループ
	// [key, value]
	// 勝利要素が負以上であるか確認 = 勝利を確認
	for (let [index, win] of winCombos.entries()) {
		if (win.every(elem => plays.indexOf(elem) > -1)) {
			// どっちのplayerがどのwinCombosを通ったかわかる
			gameWon = {index: index, player: player};
			break;
		}
	}
	// どちらかが勝利すれば値が入る
	return gameWon;
}

// gameOver処理
function gameOver(gameWon) {
	// ビンゴマス挙動 人間は青 : CPUは赤
	for (let index of winCombos[gameWon.index]) {
		document.getElementById(index).style.backgroundColor =
			gameWon.player == humanPlayer ? "#488B82" : "#F5776B";
	}
	// gameOver後はクリックできなくなる
	for (let i = 0; i < cells.length; i++) {
		cells[i].removeEventListener('click', turnClick, false);
	}
	declareWinner(gameWon.player == humanPlayer ? "あなたの勝ち" : "あなたの負け");
}

// 勝利宣言
function declareWinner(who) {
	// css発火
	document.querySelector(".endgame").style.display = "block";
	document.querySelector(".endgame .text").innerText = who;
}

// AIプレイ可のマス発見
function emptySquares() {
	// origBoard配列の中身が数値型のものを返す = oxではない
	return originalBoard.filter(squares => typeof squares == 'number');
}

// AIがプレイする箇所
function bestSpot() {
	return minimax(originalBoard, cpuPlayer).index;
}

// 引き分けか確認
function checkTie() {
	if (emptySquares().length == 0) {
		// 引き分け挙動
		for (let i = 0; i < cells.length; i++) {
			cells[i].style.backgroundColor = "#F9C794";
			cells[i].removeEventListener('click', turnClick, false);
		}
		declareWinner("引き分け!")
		return true;
	}
	// 引き分けじゃない挙動
	return false;
}

// AI無敵アルゴリズム
function minimax(newBoard, player) {
	let availSpots = emptySquares();

	// oは-10, xは10 ,プレイ不可で0
	if (checkWin(newBoard, humanPlayer)) {
		return {score: -10};
	} else if (checkWin(newBoard, cpuPlayer)) {
		return {score: 10};
	} else if (availSpots.length === 0) {
		return {score: 0};
	}

	// スコア集計
	let moves = [];
	for (let i = 0; i < availSpots.length; i++) {
		let move = {};
		move.index = newBoard[availSpots[i]];
		newBoard[availSpots[i]] = player;

		if (player == cpuPlayer) {
			let result = minimax(newBoard, humanPlayer);
			move.score = result.score;
		} else {
			let result = minimax(newBoard, cpuPlayer);
			move.score = result.score;
		}
		newBoard[availSpots[i]] = move.index;
		moves.push(move);
	}

	// 動きを最適化
	let bestMove;
	if(player === cpuPlayer) {
		let bestScore = -10000;
		for(let i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	} else {
		let bestScore = 10000;
		for(let i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	return moves[bestMove];
}