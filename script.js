const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width = 800;
const canvasHeight = canvas.height = 600;
const bubbleRadius = 20;
// 赤　緑　青　オレンジ　紫
const bubbleColors = ['#ff7f7f', '#7fff7f', '#7fbfff', '#ffbf7f', '#bf7fff'];
let bubbles = [];
// 各色に対応する番号を格納するオブジェクト
const bubbleColorIndexes = {}; 
// プレイヤーの下に追加されたバブルを管理する配列
let playerBubbles = [];
// ゲームが実行中かどうかを示すフラグ
let gameRunning = false; 
// requestAnimationFrame の ID を格納する変数
let animationId; 
// setInterval の ID を格納する変数
let bubbleIntervalId; 
let score = 0;
// ゲームの制限時間（秒）
let timeLeft = 60; 


// 各色に対応する番号を付与する
bubbleColors.forEach((color, index) => {
    bubbleColorIndexes[color] = index;
});

// 各色に対応する番号を取得する関数
function getBubbleColorIndex(color) {
    return bubbleColorIndexes[color];
}

// プレイヤーの色をランダムに選択する
let player = {
    x: canvasWidth / 2,
    y: canvasHeight - bubbleRadius * 2,
    radius: bubbleRadius,
    color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)]
};
// ゲーム開始時にインデックスを設定するので、ここで初期化のみ
let playerColorIndex; 

startGame();

function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = 'Time: ' + timeLeft;
    
    if (timeLeft > 0) {
        timeLeft--;
        // 1秒ごとに時間を更新
        timerId = setTimeout(updateTimer, 1000); 
    } else {
        // 時間切れ時にゲーム終了処理を実行
        gameOver(); 
    }
}

//  player.color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

function startGame() {
    const gameMessage = document.getElementById('gameMessage');
    gameMessage.textContent = 'クリックしてスタート';
    gameMessage.style.display = "block"; // メッセージを表示
    
    // プレイヤーの色をセットし、その色のインデックスを取得
    player.color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    playerColorIndex = getBubbleColorIndex(player.color);

console.log("Bubble color indexes:", bubbleColorIndexes);
 console.log("Player color index:", playerColorIndex);


    canvas.addEventListener('click', function () {
        // ゲームが実行中でない場合のみゲームを開始する
        if (!gameRunning) {
            gameRunning = true;
            gameLoop();
            bubbleIntervalId = setInterval(createBubble, 1000);
            gameMessage.style.display = "none"; 
            updateTimer();
        }
    });
}


function gameLoop() {
    if (gameRunning) {
        clearCanvas(); 
        drawPlayer();
        drawPlayerBubbles();
        drawBubbles();
        animationId = requestAnimationFrame(gameLoop);
    }
}   

function handleKeyPress(event) {
    if (event.key === 'ArrowLeft' && player.x > bubbleRadius) {
        player.x -= 5;
        // プレイヤーが移動したときに、newBubble もプレイヤーに追随するように位置を更新する
        playerBubbles.forEach(bubble => {
            bubble.x -= 5;
        });
    } else if (event.key === 'ArrowRight' && player.x < canvasWidth - bubbleRadius) {
        player.x += 5;
        // プレイヤーが移動したときに、newBubble もプレイヤーに追随するように位置を更新する
        playerBubbles.forEach(bubble => {
            bubble.x += 5;
        });
    }
}

document.addEventListener('keydown', handleKeyPress);

function createBubble() {
    const randomColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

    const bubble = {
        x: Math.random() * canvasWidth,
        y: 0,
        radius: bubbleRadius,
        color: randomColor
    };
    
    bubbles.push(bubble);
}


function handleBubbleCollision(playerBubble, randomBubble) {
    // バブルの色のIDを取得
    const randomColorIndex = getBubbleColorIndex(randomBubble.color); 
    // randomColorIndexをログに表示
    console.log("Random bubble color index:", randomColorIndex); 

    const Up = document.getElementById('Up');
    // 音量を半分に設定する例
    Up.volume = 0.5; 
    const But = document.getElementById('But');
    // 音量を半分に設定する例
    But.volume = 0.5; 
    // scoreIncrement を宣言
    let scoreIncrement; 

    if (playerColorIndex === randomColorIndex) {
        // 同じ色のバブルにぶつかった場合、新しいバブルを追加する
        const newBubble = {
            x: playerBubble.x,
            y: playerBubble.y , // プレイヤーの下に追加
            radius: bubbleRadius,
            color: player.color // プレイヤーの色と同じ色に設定する
        };
        player.y -= bubbleRadius * 2; 
        playerBubbles.push(newBubble);
        // 衝突したバブルを配列から削除する
        bubbles.splice(bubbles.indexOf(randomBubble), 1);
        // 新しいバブルの数を数える
        const newBubbleCount = playerBubbles.length;

        // スコアの基準値に新しいバブルの数を加算
        scoreIncrement =100 * newBubbleCount;

        // スコアに反映
        score += scoreIncrement;

        // スコアを更新する
        updateScore();
    
        // 再生位置をリセット
        Up.currentTime = 0; 
        // SE1再生
        Up.play(); 
    } else {
        // 異なる色のバブルにぶつかった場合、プレイヤーを初期位置に戻す
        player.y = canvasHeight - bubbleRadius * 2;
        // プレイヤーの色をランダムに選択する
        player.color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
        playerColorIndex = getBubbleColorIndex(player.color);
        // プレイヤーが保持しているバブルの配列を空にする
        playerBubbles = [];
        // 衝突したバブルを配列から削除する
        bubbles.splice(bubbles.indexOf(randomBubble), 1);
        // 異なる色のバブルに触れたので、スコアの上がり方を初期化する
        scoreIncrement = 0; // ここで初期化する
        // 再生位置をリセット
        But.currentTime = 0; 
        // SE1再生
        But.play(); 
    }
    
}


function drawPlayerBubbles() {
    playerBubbles.forEach((bubble, index) => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawBubbles() {
    bubbles.forEach((bubble, index) => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.closePath();

        bubble.y += 1; 

        if (isColliding(bubble, player)) {
            handleBubbleCollision(player, bubble);
        }

        if (bubble.y + bubble.radius < 0) {
            // 画面上部から出たバブルを配列から削除
            bubbles.splice(index, 1); 
        }

    });
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
}

function isColliding(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

const ClearSE = document.getElementById('ClearSE');


function gameOver() {
    // 音量を半分に設定する例
    ClearSE.volume = 0.75; 
    // SE1再生
    ClearSE.play(); 
    // タイマーを停止する
    clearTimeout(timerId);
// アニメーションを停止する
    cancelAnimationFrame(animationId); 
    // setInterval の実行を停止する
    clearInterval(bubbleIntervalId); 
    const gameMessage = document.getElementById('gameMessage');
    gameMessage.innerHTML = 'ゲーム終了<br> <br><span style="font-size: 30px;">スコア: ' + score + '</span><br> <br>クリックして最初から';

    // メッセージを表示
    gameMessage.style.display = "block"; 
    gameRunning = false;
      // クリックしたらゲーム再開
    canvas.addEventListener('click', startGameOnce);
    bubbles = [];
      // プレイヤーが保持しているバブルの配列を空にする
      playerBubbles = [];
      // ゲームを再開する前にプレイヤーのY座標を初期位置に戻す
      player.y = canvasHeight - bubbleRadius * 2;
}

function startGameOnce() {
    // イベントリスナーを一度だけ実行するため、一度呼び出したらリスナーを削除する
    canvas.removeEventListener('click', startGameOnce);
    gameRunning = false;
  
    // ゲームを再開する
    startGame();
}
function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = 'Score: ' + score;
}