var fallingIntervalDefaultTiming = 500;

var stageMap = [];
var blockObject = {};

window.onload = function() {
	initMainStage();
	blockObject.nextType = randomlyPickBlockObjectType();
	spawnNextBlockObjectToStage();
	stageBlockController("drawBlocks", []);
	blockObject.interval = setInterval(function(){moveBlockObject("fall");}, fallingIntervalDefaultTiming);
}
function initMainStage() {
	for (var i1 = -4; i1 < 20; i1++) {
		stageMap[i1] = Array();
		for (var i2 = 0; i2 < 10; i2++) {
			stageMap[i1][i2] = 0;
			if (i1 >= 0) {
				var newBlock = document.createElement("div");
				newBlock.setAttribute("id", "block-"+i1+"-"+i2);
				newBlock.setAttribute("class", "stage-block-0");
				document.getElementById("main_stage").appendChild(newBlock);
			}
		}
	}
	document.addEventListener("keyup", onKeyUpHandler);
}
function onKeyUpHandler(e) {
	switch (e.keyCode) {
		case 37: moveBlockObject("moveToLeft"); break;
		case 38: moveBlockObject("rotate"); break;
		case 39: moveBlockObject("moveToRight"); break;
		case 40: moveBlockObject("fall"); break;
	}
}
function spawnNextBlockObjectToStage() {
	blockObject.currentType = blockObject.nextType;
	blockObject.nextType = randomlyPickBlockObjectType();
	blockObject.currentState = 0;
	blockObject.blocks = generateBlockObjectByType(blockObject.currentType);
	stageBlockController("drawBlocks", blockObject.blocks);
}
function moveBlockObject(moveMethod) {
	var fallingObjectFell = [], fallingObjectOrigin = [];
	var shallRedrawBlocks = false;
	copyBlockObjectDataToArray(fallingObjectFell, blockObject.blocks);
	copyBlockObjectDataToArray(fallingObjectOrigin, blockObject.blocks);

	if (moveMethod === "fall") {
		for (var i = 0, j = blockObject.blocks.length; i < j; i++) {
			fallingObjectFell[i][0]++;
		}
		if (checkIfBlockObjectCanMove(fallingObjectFell)) {
			shallRedrawBlocks = true;
		} else {
			clearInterval(blockObject.interval);
			if (checkIfGameOver()) {
				clearInterval(blockObject.interval);
				document.removeEventListener("keyup", onKeyUpHandler);
			} else {
				checkCompletedLines();
			}
		}
	} else if (moveMethod === "moveToLeft" || moveMethod === "moveToRight") {
		var movePos;
		switch (moveMethod) {
			case "moveToLeft": movePos = -1; break;
			case "moveToRight": movePos = 1; break;
		}
		for (var i = 0, j = blockObject.blocks.length; i < j; i++) {
			fallingObjectFell[i][1] += movePos;
		}
		if (checkIfBlockObjectCanMove(fallingObjectFell)) {
			shallRedrawBlocks = true;
		}
	} else if (moveMethod === "rotate") {
		clearInterval(blockObject.interval);
		var rotateRule = getBlockRotateRule(blockObject.currentType);
		blockObject.currentState = blockObject.currentState+1 >= rotateRule.length? 0 : blockObject.currentState+1;
		for (var i = 0, j = fallingObjectFell.length; i < j; i++) {
			fallingObjectFell[i][0] += rotateRule[blockObject.currentState][i][0];
			fallingObjectFell[i][1] += rotateRule[blockObject.currentState][i][1];
		}
		if (checkIfBlockObjectCanMove(fallingObjectFell)) {
			shallRedrawBlocks = true;
		}
		blockObject.interval = setInterval(function(){moveBlockObject("fall");}, fallingIntervalDefaultTiming);
	}
	if (shallRedrawBlocks) {
		stageBlockController("clearBlocks", fallingObjectOrigin);
		stageBlockController("drawBlocks", fallingObjectFell);
		copyBlockObjectDataToArray(blockObject.blocks, fallingObjectFell);
	}
}
function stageBlockController() {
	switch (arguments[0]) {
		case "drawBlocks":
			for (var i = 0, j = arguments[1].length; i < j; i++) {
				if ((arguments[1][i][0] >= 0 && arguments[1][i][1] >= 0) && (arguments[1][i][0] < 20 && arguments[1][i][1] < 10)) {
					var targetBlockId = "block-" + arguments[1][i][0] + "-" + arguments[1][i][1];
					document.getElementById(targetBlockId).className = "stage-block-1 block-color-" + arguments[1][i][2];
				}
				stageMap[arguments[1][i][0]][arguments[1][i][1]] = arguments[1][i][2];
			}
			break;
		case "drawAllBlocks":
			for (var i1 = 0, j1 = stageMap.length; i1 < j1; i1++) {
				for (var i2 = 0, j2 = stageMap[i1].length; i2 < j2; i2++) {
					var targetBlockId = "block-" + i1 + "-" + i2;
					if (stageMap[i1][i2] !== 0) {
						document.getElementById(targetBlockId).className = "stage-block-1 block-color-" + stageMap[i1][i2];
					} else {
						document.getElementById(targetBlockId).className = "stage-block-0";
					}
				}
			}
			break;
		case "clearBlocks":
			for (var i = 0, j = arguments[1].length; i < j; i++) {
				if ((arguments[1][i][0] >= 0 && arguments[1][i][1] >= 0) && (arguments[1][i][0] < 20 && arguments[1][i][1] < 10)) {
					var targetBlockId = "block-" + arguments[1][i][0] + "-" + arguments[1][i][1];
					document.getElementById(targetBlockId).className = "stage-block-0";
				}
				stageMap[arguments[1][i][0]][arguments[1][i][1]] = 0;
			}
			break;
		case "clearLines":
			for (var i1 = 0, j1 = arguments[1].length; i1 < j1; i1++) {
				for (var i2 = 0; i2 < 10; i2++) {
					var targetBlockId = "block-" + arguments[1][i1] + "-" + i2;
					document.getElementById(targetBlockId).className = "stage-block-1 block-color-X";
				}
			}
			var linesWillClear = arguments[1];
			setTimeout(function() {
				stageBlockController("doClearLines", linesWillClear);
			}, 1000);
			break;
		case "doClearLines":
			for (var i1 = 0, j1 = arguments[1].length; i1 < j1; i1++) {
				for (var i2 = 0; i2 < 10; i2++) {
					var targetBlockId = "block-" + arguments[1][i1] + "-" + i2;
					document.getElementById(targetBlockId).className = "stage-block-0";
					stageMap[arguments[1][i1]][i2] = 0;
				}
			}
			rearrangeStageMapAfterClearLines(arguments[1]);
			break;
	}
}
function rearrangeStageMapAfterClearLines(clearedLines) {
	var shiftLine = clearedLines.length;
	for (var i = 0, j = clearedLines.length; i < j; i++) {
		stageMap.splice(clearedLines[i] - i, 1);
	}
	for (var i1 = 0; i1 < shiftLine; i1++) {
		var insertArray = [];
		for (var i2 = 0; i2 < 10; i2++) {
			insertArray[i2] = 0;
		}
		stageMap.unshift(insertArray);
	}
	stageBlockController("drawAllBlocks");
	console.log(stageMap);
	if (blockObject.isPaused) {
		spawnNextBlockObjectToStage();
		blockObject.interval = setInterval(function(){moveBlockObject("fall");}, fallingIntervalDefaultTiming);
		document.addEventListener("keyup", onKeyUpHandler);
	}
}
function checkIfBlockObjectCanMove(targetObject) {
	for (var i1 = 0, j1 = targetObject.length; i1 < j1; i1++) {
		var canMove = true;
		if (targetObject[i1][0] >= 20 || targetObject[i1][1] >= 10) {
			canMove = false;
			break;
		} else {
			if (stageMap[targetObject[i1][0]][targetObject[i1][1]] !== 0) {
				canMove = false;
				isSelfBlock = [0, 0, 0, 0];
				for (var i2 = 0, j2 = blockObject.blocks.length; i2 < j2; i2++) {
					if (blockObject.blocks[i2][0] === targetObject[i1][0] && blockObject.blocks[i2][1] === targetObject[i1][1]) {
						isSelfBlock[i2] = 1;
						canMove = true;
					}
				}
				if(!canMove) break;
			}
		}
	}
	return canMove;
}
function checkCompletedLines() {
	var linesToClear = [];
	for (var i1 = 0, j1 = 20; i1 < j1; i1++) {
		for (var i2 = 0; i2 < 10; i2++) {
			if (stageMap[[i1]][i2] === 0) {
				break;
			} else if (i2 === 9) {
				linesToClear.push(i1);
			}
		}
	}
	if (linesToClear.length > 0) {
		clearInterval(blockObject.interval);
		document.removeEventListener("keyup", onKeyUpHandler);
		blockObject.isPaused = true;
		stageBlockController("clearLines", linesToClear);
	} else {
		spawnNextBlockObjectToStage();
		blockObject.interval = setInterval(function(){moveBlockObject("fall");}, fallingIntervalDefaultTiming);
		document.addEventListener("keyup", onKeyUpHandler);
	}
}
function checkIfGameOver() {
	var isGameOver = false;
	for (var i = 0, j = stageMap[0].length; i < j; i++) {
		if (stageMap[0][i] !== 0) {
			isGameOver = true;
		}
	}
	return isGameOver;
}
function randomlyPickBlockObjectType() {
	return Math.floor((Math.random() * 7));
}
function copyBlockObjectDataToArray(targetArray, sourceArray) {
	for(var i = 0, j = sourceArray.length; i < j; i++) {
		targetArray[i] = sourceArray[i].slice(0);
	}
}
function arrangeDuplicatedValuesInArray(sourceArray) {
	var resultArray = sourceArray.reduce(function(a, b) {
		if (a.indexOf(b) < 0) a.push(b);
		return a;
	},[]);
	return resultArray;
}
function getBlockRotateRule(type) {
	var rotateRule = [];
	switch (type) {
		case 0:
			rotateRule[0] = [[3,-2],[2,-1],[1,0],[0,1]];
			rotateRule[1] = [[-3,2],[-2,1],[-1,0],[0,-1]];
			break;
		case 1:
			rotateRule[0] = [[-1,-1],[0,0],[1,1],[2,0]];
			rotateRule[1] = [[-1,1],[0,0],[1,-1],[0,-2]];
			rotateRule[2] = [[2,1],[1,0],[0,-1],[-1,0]];
			rotateRule[3] = [[0,-1],[-1,0],[-2,1],[-1,2]];
			break;
		case 2:
			rotateRule[0] = [[0,-1],[1,0],[2,1],[1,2]];
			rotateRule[1] = [[-2,1],[-1,0],[0,-1],[1,0]];
			rotateRule[2] = [[1,1],[0,0],[-1,-1],[0,-2]];
			rotateRule[3] = [[1,-1],[0,0],[-1,1],[-2,0]];
			break;
		case 3:
			rotateRule[0] = [[0,0],[0,0],[0,0],[0,0]];
			break;
		case 4:
			rotateRule[0] = [[0,0],[-1,1],[2,0],[1,1]];
			rotateRule[1] = [[0,0],[1,-1],[-2,0],[-1,-1]];
			break;
		case 5:
			rotateRule[0] = [[-1,-1],[0,0],[1,1],[1,-1]];
			rotateRule[1] = [[-1,1],[0,0],[1,-1],[-1,-1]];
			rotateRule[2] = [[2,1],[1,0],[0,-1],[0,1]];
			rotateRule[3] = [[0,-1],[-1,0],[-2,1],[0,1]];
			break;
		case 6:
			rotateRule[0] = [[1,-2],[0,-1],[1,0],[0,1]];
			rotateRule[1] = [[-1,2],[0,1],[-1,0],[0,-1]];
			break;
	}
	return rotateRule;
}
function generateBlockObjectByType(type) {
	var generatedObject = [];
	switch (type) {
		case 0: // Blue I
			generatedObject = [[-1,4,5],[-1,5,5],[-1,6,5],[-1,7,5]]; break;
		case 1: // Indigo J
			generatedObject = [[-2,4,6],[-2,5,6],[-2,6,6],[-1,6,6]]; break;
		case 2: // Amber L
			generatedObject = [[-1,4,2],[-1,5,2],[-1,6,2],[-2,6,2]]; break;
		case 3: // Yellow O
			generatedObject = [[-1,4,3],[-1,5,3],[-2,4,3],[-2,5,3]]; break;
		case 4: // Green S
			generatedObject = [[-2,5,4],[-2,6,4],[-1,4,4],[-1,5,4]]; break;
		case 5: // Purple T
			generatedObject = [[-2,4,7],[-2,5,7],[-2,6,7],[-1,5,7]]; break;
		case 6: // Red Z
			generatedObject = [[-1,4,1],[-1,5,1],[-2,5,1],[-2,6,1]]; break;
	}
	return generatedObject;
}