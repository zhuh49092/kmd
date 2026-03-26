
// 小动物动画类
   class AnimalAnimator {
        constructor(imageUrl, edge, startPosition) {
            this.imageUrl = imageUrl;
            this.edge = edge;
            this.startPosition = startPosition;
            this.element = null;
            this.id = 'animal_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        }
        
        // 创建动物元素并确保图片加载完毕
        createElement(callback) {
            this.element = $('<img>')
                .addClass('animal-image')
                .attr('id', this.id)
                .attr('src', this.imageUrl)
                .attr('width',200)
                .hide();
            
            // 等待图片加载完毕后再获取尺寸
            this.element.on('load', () => {
                $('#animationArea').append(this.element);
                if (callback) callback();
            });
            
            // 处理图片加载失败的情况
            this.element.on('error', () => {
                console.error('图片加载失败:', this.imageUrl);
                if (callback) callback();
            });
            
            return this.element;
        }
        
        // 设置初始位置（屏幕外）
        setInitialPosition() {
	        const $element = this.element;
	        const imgWidth = $element.width();
	        const imgHeight = $element.height();
	        const pos = this.startPosition;
	        
	        switch(this.edge) {
	            case 'top':
	                $element.css({
	                    top: `${pos.offsetTop - imgHeight}px`,
	                    left: pos.coord
	                });
	                break;
	            case 'right':
	                $element.css({
	                    top: pos.coord,
	                    right: `-${imgWidth}px`
	                });
	                break;
	            case 'bottom':
	                $element.css({
	                    top: `${pos.offsetTop + imgHeight}px`,
	                    left: pos.coord
	                });
	                break;
	            case 'left':
	                $element.css({
	                    top: pos.coord,
	                    left: `-${imgWidth}px`,
	                    transform: (0.5 - Math.random()) < 0 ? 'scaleX(-1)' : ''
	                });
	                break;
	        }
        }
        
        // 计算目标位置（移入屏幕一半距离）
        getTargetPosition() {
	        const $element = this.element;
	        const imgWidth = $element.width();
	        const imgHeight = $element.height();
	        const halfWidth = imgWidth / 2;
	        const halfHeight = imgHeight / 2;
	        const scrollTop = $(window).scrollTop();
	
	        switch(this.edge) {
	            case 'top':
	                return { top: scrollTop - halfHeight };
	            case 'right':
	                return { right: -halfWidth };
	            case 'bottom':
	                return { top: scrollTop + $(window).height() - halfHeight };
	            case 'left':
	                return { left: -halfWidth };
	        }
        }

                                      
        // 计算退出位置（回到屏幕外）
        getExitPosition() {
          const $element = this.element;
	        const imgWidth = $element.width();
	        const imgHeight = $element.height();
	        const scrollTop = $(window).scrollTop();
	        const scrollBottom = scrollTop + $(window).height();
	
	        switch(this.edge) {
	            case 'top':
	                return { top: `${scrollTop - imgHeight}px` };
	            case 'right':
	                return { right: `-${imgWidth}px` };
	            case 'bottom':
	                return { top: `${scrollBottom}px` };
	            case 'left':
	                return { left: `-${imgWidth}px` };
	        }
        }
        
        // 执行动画
        animate(callback) {
            this.element.show();
            this.setInitialPosition();
            
            // 移入动画
            const targetPos = this.getTargetPosition();
            this.element.animate(targetPos, 1000, 'swing', () => {
                // 停留3秒
                setTimeout(() => {
                    // 移出动画
                    const exitPos = this.getExitPosition();
                    this.element.animate(exitPos, 1000, 'swing', () => {
                        // 动画完成后清理
                        this.element.remove();
                        if (callback) callback();
                    });
                }, 2000);
            });
        }
    }

// 全局变量
   const edges = ['top', 'right', 'bottom', 'left'];           
  // 获取边缘起始位置（根据实际图片尺寸）
    function getStartPosition(edge, imgSize) {
		    const windowWidth = $(window).width();
		    const windowHeight = $(window).height();
		    const scrollTop = $(window).scrollTop(); // 当前滚动位置
		    
		    switch(edge) {
		        case 'top':
		        case 'bottom':
		            return {
		                coord: Math.random() * (windowWidth - imgSize),
		                offsetTop: edge === 'top' ? scrollTop : scrollTop + windowHeight - imgSize
		            };
		        case 'left':
		        case 'right':
		            return {
		                coord: scrollTop + Math.random() * (windowHeight - imgSize), // 垂直方向加上scroll偏移
		                offsetLeft: edge === 'left' ? 0 : windowWidth - imgSize
		            };
		    }
    }        

        // 执行动画
  function startAnimation(animalCount) {            
  const selectedEdges = [];
  
  // 随机选择不重复的边缘
  const shuffledEdges = [...edges].sort(() => 0.5 - Math.random());
  for (let i = 0; i < animalCount; i++) {
      selectedEdges.push(shuffledEdges[i]);
  }        	  
   // 为每个动物创建动画实例      
  let loadedCount = 0;
  const animators = [];
  var availableNumbers = [];
  for (let i = 1; i <= 21; i++) {
        availableNumbers.push(i);
    }
  for (let i = 0; i < animalCount; i++) {
      const edge = selectedEdges[i];
      const imgindex = availableNumbers.splice(GetRnd(0, availableNumbers.length-1), 1)[0];
      const imageUrl = "zoo/A"+imgindex+".png";
      
      // 创建临时图片来获取真实尺寸
      const tempImg = new Image();
      tempImg.src = imageUrl;
      
      tempImg.onload = function() {
          const imgWidth = this.width;
          const imgHeight = this.height;
          const maxSize = Math.max(imgWidth, imgHeight);
          const startPosition = getStartPosition(edge, maxSize);
          
          const animator = new AnimalAnimator(imageUrl, edge, startPosition);
          
          // 确保图片加载完毕后再添加到数组
          animator.createElement(() => {
              animators.push(animator);
              loadedCount++;
              
              // 当所有图片都加载完毕后开始动画
              if (loadedCount === animalCount) {
                  animators.forEach(anim => {
                      anim.animate();
                  });
              }
          });
      };
      
      tempImg.onerror = function() {
          console.error('图片加载失败:', imageUrl);
          loadedCount++;
          if (loadedCount === animalCount && animators.length > 0) {
              animators.forEach(anim => {
                  anim.animate();
              });
          }
      };
  }          
}

    
function GetRnd(min, max) {
    // 确保输入参数为整数
    min = Math.ceil(min);
    max = Math.floor(max);    
    // 生成 [min, max] 范围内的随机整数
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// 发射礼花函数
function launchConfetti() {
    // 创建礼花系统实例
   var confettiSystem = new ConfettiSystem();       	
    confettiSystem.launch();            
    // 3秒后自动停止
    setTimeout(() => {
        confettiSystem.stop();
        confettiSystem=null;
    }, 3000);
}
class ConfettiParticle {
    constructor(canvas, startX, startY, direction) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = startX;
        this.y = startY;
        this.direction = direction; // -1 for left, 1 for right
       // console.log("Particle created");
        // 随机颜色
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机大小
        this.size = Math.random() * 8 + 2;
        
        // 随机速度(两侧)
        this.speedX = (Math.random() * 5 + 3) * direction;
        this.speedY = Math.random() * -8 - 2;
          //从上面
       //  this.speedX = (Math.random() - 0.5) * 2;
       //  this.speedY = Math.random() * 3 + 2;
                
        // 重力和阻力
        this.gravity = 0.1;
        this.friction = 0.98;
        
        // 旋转
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }
    
    update() {
        // 应用重力
        this.speedY += this.gravity;
        
        // 应用阻力
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        
        // 更新位置
        this.x += this.speedX;
        this.y += this.speedY;
        
        // 更新旋转
        this.rotation += this.rotationSpeed;
        
        // 返回是否还在屏幕内
        return this.y < this.canvas.height+50 && 
               this.x > -50 && 
               this.x < this.canvas.width + 50;
    }
    
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        
        // 绘制矩形礼花片
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // 添加高光效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(-this.size/4, -this.size/4, this.size/2, this.size/4);
        
        this.ctx.restore();
    }
}

class ConfettiSystem {
    constructor() {
        this.canvas = $('#confetti-canvas')[0];
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
launch() {
  // 清空现有粒子
  this.particles = [];
  // 从左侧发射
  for (let i = 0; i < 150; i++) {
      this.particles.push(new ConfettiParticle(
          this.canvas,
          -20,
          Math.random() * this.canvas.height,
          1 // 向右
      ));
  }

  // 从右侧发射
  for (let i = 0; i < 150; i++) {
      this.particles.push(new ConfettiParticle(
          this.canvas,
          this.canvas.width + 20,
          Math.random() * this.canvas.height,
          -1 // 向左
      ));
  }	
/*
    // 从上方随机位置落下
  for (let i = 0; i < 300; i++) {
        this.particles.push(new ConfettiParticle(
            this.canvas,
            Math.random() * this.canvas.width,
            -50
        ));
  }
*/        		
  this.animate(); // 直接调用 animate
}

    
    animate() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制所有粒子
        this.particles = this.particles.filter(particle => {
            const isAlive = particle.update();
            if (isAlive) {
                particle.draw();
            }
            return isAlive;
        });
        
        // 如果还有粒子存活，继续动画
        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}