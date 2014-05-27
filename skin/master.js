(function(window, $) {

	// define some global var
	var gameState = 1;
	var gridRowNum = 30;
	var gridColNum = 30;
	var snakeArr = null;
	var food = null;
	var speed = 200;
	var direction = 39;
	var moveThread = null;
	var score = 0;
	var arrColor = ["food", "brake", "food", "food", "skate", "food"];

	//---------------------------ControlBord start-----------------------------------
	function ControlBord() {};

	ControlBord.prototype.init = function() {
		this.bindEvent();
	};

	ControlBord.prototype.bindEvent = function() {
		//事件代理
		$(document).delegate('#start-game', "click", function(event) {
			$(EventControl).trigger('startNewGame');
			return;

		})
			.delegate("#pause-game", "click", function(event) {
				if ($(this).hasClass("disabled")) {
					return;
				}
				if ($(this).hasClass("paused")) {
					$(this).removeClass("paused")
					$(EventControl).trigger('continueGame');
				} else {
					$(this).addClass("paused")
					$(EventControl).trigger('pauseGame');
				}
				return;

			})
			.delegate("#stop-game", "click", function(event) {
				if ($(this).hasClass("disabled")) {
					return;
				}
				$(EventControl).trigger('stopGame');
				return;

			});
	};
	//--------------------------------ControlBord end-----------------------------------------

	//--------------------------------EventControl start-----------------------------------------

	var EventControl = {};

	$(EventControl).bind({
		startNewGame: function() {
			//自定义行列数和速度
			gridRowNum = parseInt($("#select-gridRowNum").val(), 10);
			gridColNum = parseInt($("#select-gridColNum").val(), 10);
			speed = parseInt($("#select-speed").val(), 10);
			direction = 39;
			snake.initGrid(gridRowNum, gridColNum);
			snake.initsnakeArr();

			snake.drawSnake();

			snake.initFood(true);
			snake.resetMoveThread();
			gameState = 2;
			snake.updateGameStateText();
			snake.updateScore();

			$("#pause-game").removeClass("disabled");
			$("#stop-game").removeClass("disabled");
			$("#pause-game").text("暂停");

		},

		pauseGame: function() {
			clearInterval(moveThread);
			gameState = 3;
			snake.updateGameStateText();
			$("#pause-game").text("开始");
		},

		continueGame: function() {
			snake.resetMoveThread();
			gameState = 2;
			snake.updateGameStateText();
			$("#pause-game").text("暂停");

		},

		stopGame: function() {
			clearInterval(moveThread);
			snake.initsnakeArr();
			snake.drawSnake();
			snake.initFood(false);
			gameState = 1;
			snake.updateGameStateText();
			
			$("#pause-game").addClass("disabled");
			$("#stop-game").addClass("disabled");
		}
	});



	//--------------------------------EventControl end-----------------------------------------


	//--------------------------------Snake start-----------------------------------------
	function Snake() {};

	/**
	 * @description 初始化蛇身
	 */
	Snake.prototype.initsnakeArr = function() {
		snakeArr = [
			[1, 1],
			[2, 1],
			[3, 1]
		];
	};
	/**
	 *@description 初始化背景栅格
	 */
	Snake.prototype.initGrid = function(rows, cols) {
		var gridHTML = [];
		for (var i = 0; i < rows; i++) {
			gridHTML.push('<div class="row clearfix">');
			for (var j = 0; j < cols; j++) {
				gridHTML.push('<div class="col" style="position:relative;"></div>');

			}
			gridHTML.push('</div>');
		}
		$("#snake-grid").html(gridHTML.join(""));
	}

	/**
	 * @description 绘制蛇身
	 */
	Snake.prototype.drawSnake = function() {

		$("#snake-grid .row .col.on").removeClass("on");
		for (var i = 0, len = snakeArr.length; i < len; i++) {
			$("#snake-grid .row:nth-child(" + snakeArr[i][1] + ") .col:nth-child(" + snakeArr[i][0] + ")").addClass("on");
		}
	}

	/**
	 * @discriptyion 方向键控制
	 */
	Snake.prototype.snakeRun = function() {
		if (direction === 37) {
			this.moveLeft();
		} else if (direction === 38) {
			this.moveUp();
		} else if (direction === 39) {
			this.moveRight();
		} else if (direction === 40) {
			this.moveDown();
		}
	};

	/**
	 * @description 运动进程
	 */
	Snake.prototype.resetMoveThread = function() {
		var self = this;
		window.clearInterval(moveThread);
		moveThread = window.setInterval(function() {
			self.snakeRun();
		}, speed);
	};

	/**
	 * @description 穿件获得分数
	 */
	Snake.prototype.createScore = function(classs) {
		var type = classs.split(" ")[1];
		var score;
		switch (type) {
			case "skate":
				score = 3;
				break;
			case "food":
				score = 1;
				break;
			default:
				score = 2;
		}
		return [
			'<div class="s-score" style="width:50px;height:40px;position:absolute;left:0;top:0; background:#f60;z-index:20;">',
			'<p style="text-align:center; color:#fff;">+', score,
			'分</p>',
			'</div>'].join("");
	};

	/**
	 *@description 向上运动
	 */
	Snake.prototype.moveUp = function() {
		var nextNode = [snakeArr[snakeArr.length - 1][0], snakeArr[snakeArr.length - 1][1] - 1];
		if (this.checkEqual(food, nextNode)) {
			var node = $("#snake-grid .row:nth-child(" + nextNode[1] + ") .col:nth-child(" + nextNode[0] + ")");
			snakeArr.push(food);
			node.append(this.createScore(node.attr("class")));
			this.updateScore(node);
			node.removeClass().addClass('on col');
			this.initFood(true);
			setTimeout(function() {
				node.find(".s-score").animate({
					"height": 0,
					"width": 0
				}, 500, function() {
					node.find(".s-score").remove();
				});
			}, 500);

			return;
		}
		var firstNode = snakeArr[snakeArr.length - 1];
		if ((firstNode[1] - 1) < 1 || this.checkExists([firstNode[0], firstNode[1] - 1], snakeArr)) {
			clearInterval(moveThread);
			gameState = 1;
			this.updateGameStateText();
			setTimeout(function() {
				alert("游戏结束")
			}, 1000);
			$("#pause-game").addClass("disabled");
			return;
		}
		$("#snake-grid .row:nth-child(" + snakeArr[0][1] + ") .col:nth-child(" + snakeArr[0][0] + ")").removeClass("on");
		snakeArr.shift();
		$("#snake-grid .row:nth-child(" + (firstNode[1] - 1) + ") .col:nth-child(" + firstNode[0] + ")").addClass("on");
		snakeArr.push([firstNode[0], firstNode[1] - 1]);
	}
	/**
	 * @description 向右运动
	 */
	Snake.prototype.moveRight = function() {
		var nextNode = [snakeArr[snakeArr.length - 1][0] + 1, snakeArr[snakeArr.length - 1][1]];
		if (this.checkEqual(food, nextNode)) {
			var node = $("#snake-grid .row:nth-child(" + nextNode[1] + ") .col:nth-child(" + nextNode[0] + ")");
			node.append(this.createScore(node.attr("class")));
			snakeArr.push(food);
			this.updateScore(node);
			node.removeClass().addClass('on col');
			this.initFood(true);
			setTimeout(function() {
				node.find(".s-score").animate({
					"height": 0,
					"width": 0
				}, 500, function() {
					node.find(".s-score").remove();
				});
			}, 500);
			return;
		}

		// collapse border
		var firstNode = snakeArr[snakeArr.length - 1];
		if ((firstNode[0] + 1) > gridColNum || this.checkExists([firstNode[0] + 1, firstNode[1]], snakeArr)) {
			clearInterval(moveThread);
			gameState = 1;
			this.updateGameStateText();
			alert("游戏结束");
			$("#pause-game").addClass("disabled");
			return;
		}
		$("#snake-grid .row:nth-child(" + snakeArr[0][1] + ") .col:nth-child(" + snakeArr[0][0] + ")").removeClass("on");
		snakeArr.shift();
		$("#snake-grid .row:nth-child(" + firstNode[1] + ") .col:nth-child(" + (firstNode[0] + 1) + ")").addClass("on");
		snakeArr.push([firstNode[0] + 1, firstNode[1]]);

	};
	/**
	 * @description 向下运动
	 */
	Snake.prototype.moveDown = function() {
		var nextNode = [snakeArr[snakeArr.length - 1][0], snakeArr[snakeArr.length - 1][1] + 1];
		if (this.checkEqual(food, nextNode)) {
			var node = $("#snake-grid .row:nth-child(" + nextNode[1] + ") .col:nth-child(" + nextNode[0] + ")");
			node.append(this.createScore(node.attr("class")));
			snakeArr.push(food);
			this.updateScore(node);
			node.removeClass().addClass('on col');
			this.initFood(true);
			setTimeout(function() {
				node.find(".s-score").animate({
					"height": 0,
					"width": 0
				}, 500, function() {
					node.find(".s-score").remove();
				});
			}, 500);
			return;
		}
		var firstNode = snakeArr[snakeArr.length - 1];
		if ((firstNode[1] + 1) > gridRowNum || this.checkExists([firstNode[0], firstNode[1] + 1], snakeArr)) { //鎾炲埌澧欐垨鎾炲埌鑷繁
			clearInterval(moveThread);
			gameState = 1;
			this.updateGameStateText();
			alert("游戏结束");
			$("#pause-game").addClass("disabled");
			return;
		}
		$("#snake-grid .row:nth-child(" + snakeArr[0][1] + ") .col:nth-child(" + snakeArr[0][0] + ")").removeClass("on");
		snakeArr.shift();
		$("#snake-grid .row:nth-child(" + (firstNode[1] + 1) + ") .col:nth-child(" + firstNode[0] + ")").addClass("on");
		snakeArr.push([firstNode[0], firstNode[1] + 1]);
	};
	/**
	 * @description 向左运动
	 */
	Snake.prototype.moveLeft = function() {
		var nextNode = [snakeArr[snakeArr.length - 1][0] - 1, snakeArr[snakeArr.length - 1][1]];

		// get it
		if (this.checkEqual(food, nextNode)) {
			var node = $("#snake-grid .row:nth-child(" + nextNode[1] + ") .col:nth-child(" + nextNode[0] + ")");
			node.append(this.createScore(node.attr("class")));
			snakeArr.push(food);
			this.updateScore(node);
			node.removeClass().addClass('on col');
			this.initFood(true);
			setTimeout(function() {
				node.find(".s-score").animate({
					"height": 0,
					"width": 0
				}, 500, function() {
					node.find(".s-score").remove();
				});
			}, 500);
			return;
		}

		var firstNode = snakeArr[snakeArr.length - 1];
		if ((firstNode[0] - 1) < 1 || this.checkExists([firstNode[0] - 1, firstNode[1]], snakeArr)) {
			clearInterval(moveThread);
			gameState = 1;
			this.updateGameStateText();
			setTimeout(function() {alert("游戏结束")},1000);
			$("#pause-game").addClass("disabled");
			return;
		}
		$("#snake-grid .row:nth-child(" + snakeArr[0][1] + ") .col:nth-child(" + snakeArr[0][0] + ")").removeClass("on");
		snakeArr.shift();
		$("#snake-grid .row:nth-child(" + firstNode[1] + ") .col:nth-child(" + (firstNode[0] - 1) + ")").addClass("on");
		snakeArr.push([firstNode[0] - 1, firstNode[1]]);
	};
	/**
	 *@description 事件绑定
	 */
	Snake.prototype.bindEvent = function() {

		var self = this;
		$(document).bind("keydown", function(event) {
			event.preventDefault();
			if (gameState != 2) {
				return;
			}
			if (event.keyCode === 37) { //left
				if (direction !== 39) {
					self.resetMoveThread();
					direction = event.keyCode;
					self.moveLeft();
				}

			} else if (event.keyCode === 38) { //up
				if (direction !== 40) {
					self.resetMoveThread();
					direction = event.keyCode;
					self.moveUp();
				}
			} else if (event.keyCode === 39) { //right
				if (direction !== 37) {
					self.resetMoveThread();
					direction = event.keyCode;
					self.moveRight();
				}
			} else if (event.keyCode === 40) { //down
				if (direction !== 38) {
					self.resetMoveThread();
					direction = event.keyCode;
					self.moveDown();
				}
			}
		});
	};

	/**
	 * @description  初始化食物
	 */
	Snake.prototype.initFood = function(firstFlag) {
		if (firstFlag) {
			food = null;

			while (true) {
				food = this.getRandomPoint();
				if (!this.checkExists(food, snakeArr)) {
					break;
				}
			}

			var color = Math.ceil(Math.random() * 6);
			$("#snake-grid .row:nth-child(" + food[1] + ") .col:nth-child(" + food[0] + ")").addClass(arrColor[color - 1]);
		}
	};

	/**
	 * @description 获得随机点
	 */
	Snake.prototype.getRandomPoint = function() {
		var x = Math.floor(Math.random() * gridColNum + 1);
		var y = Math.floor(Math.random() * gridRowNum + 1);
		if (x === 1 && y === 1 || x === gridColNum && y === gridColNum || x === 1 && y === gridColNum || x === gridColNum && y === 1) {
			return arguments.callee();
		}
		return [x, y];
	};
	/**
	 * 鍒ゆ柇涓や釜鏁扮粍鏄惁鐩哥瓑
	 * @param arr1
	 * @param arr2
	 */
	Snake.prototype.checkEqual = function(arr1, arr2) {
		return arr1.toString() == arr2.toString();
	};
	/**
	 *
	 * @param arr1
	 * @param arr2
	 */
	Snake.prototype.checkExists = function(arr1, arr2) {
		// 每一个数组项是个二维点
		for (var i = 0, len = arr2.length; i < len; i++) {
			if (this.checkEqual(arr1, arr2[i])) {
				return true;
			}
		}
		return false;
	};

	Snake.prototype.updateGameStateText = function() {
		switch (gameState) {
			case 1:
				$("#game-state").text("游戏结束");
				break;
			case 2:
				$("#game-state").text("游戏进行中");
				break;
			case 3:
				$("#game-state").text("游戏暂停中");
				break;
		}
	};

	/**
	 * show score
	 * @param  {[type]} score [description]
	 * @return {[type]}       [description]
	 */
	Snake.prototype.showScore = function(score) {
		switch (score) {
			case 1:
				break;
			case 2:
				break;
			case 3:
				break;
		}



	}

	/**
	 * @description  更新得分显示
	 */
	Snake.prototype.updateScore = function(node) {
		if (node == null) {
			$("#score-num").text(score);
			$("#speed-num").text(speed);
			return;
		} else if (node) {
			if (node.hasClass('skate')) {
				this.showScore(3);
				score += 2;
				speed > 60 && (speed -= 30);;
			} else if (node.hasClass('brake')) {
				this.showScore(2);
				score += 3;
				speed += 30;
			} else {
				this.showScore(1);
				score += 1;
				speed -= 10;
			}
			$("#score-num").text(score);
			$("#speed-num").text(speed);
		}

	};

	/**
	 *  @description 游戏入口
	 */
	Snake.prototype.init = function() {
		this.initGrid(gridRowNum, gridColNum);
		this.initsnakeArr();
		this.drawSnake();
		this.initFood(false);
		this.bindEvent();
	};
	//------------------------ snake end----------------------------------
	/**
	 * @description  实例化对象
	 */
	var snake = new Snake();
	snake.init();

	/**
	 * @description  实例化控制层
	 */
	var controlBord = new ControlBord();
	controlBord.init();
})(window, jQuery);