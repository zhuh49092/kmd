
// 自定义缓动函数：先慢后快
$.easing.easeInCustom = function (x, t, b, c, d) {
    return c * (t /= d) * t * t + b;
};

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
                .attr('width',200) // 图片宽度（像素）
                .css({
                    position: 'absolute',
                    zIndex: 1000
                })
                .hide();
            
            // 等待图片加载完毕后再获取尺寸
            this.element.on('load', () => {
                $('#animationArea').append(this.element);
                // 确保图片已经渲染完成
                setTimeout(() => {
                    if (callback) callback();
                }, 200); // 延迟时间（毫秒），确保图片完全渲染
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
	        let imgWidth = $element.width();
	        let imgHeight = $element.height();
	        
	        // 如果图片尺寸为0，使用默认值
	        if (imgWidth === 0) imgWidth = 200;
	        if (imgHeight === 0) imgHeight = 200;
	        
	        const pos = this.startPosition;
	        const windowWidth = $(window).width();
	        
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
	                    left: `${windowWidth + imgWidth}px`
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
	                    left: `-${imgWidth}px`
	                });
	                break;
	        }
        }
        
        // 执行动画
        animate(callback) {
            this.element.show();
            this.setInitialPosition();
            
            if (this.edge === 'left' || this.edge === 'right') {
                // 左侧或右侧：从屏幕上加速穿过
                const windowWidth = $(window).width();
                let imgWidth = this.element.width();
                if (imgWidth === 0) imgWidth = 200;
                
                const targetX = this.edge === 'left' ? windowWidth + imgWidth : -imgWidth * 2;
                
                this.element.animate({
                    left: targetX
                }, {
                    duration: 3000, // 动画持续时间（毫秒）
                    easing: 'easeInCustom',
                    complete: () => {
                        this.element.remove();
                        if (callback) callback();
                    }
                });
            } else if (this.edge === 'top') {
                // 上边：自由落体而下
                const windowHeight = $(window).height();
                const imgHeight = this.element.height();
                const targetY = windowHeight + imgHeight;
                
                this.element.animate({
                    top: targetY
                }, {
                    duration: 1500, // 动画持续时间（毫秒）
                    easing: 'swing',
                    complete: () => {
                        this.element.remove();
                        if (callback) callback();
                    }
                });
            } else if (this.edge === 'bottom') {
                // 下方：礼花式弹出，先升起再分散落下
                const windowHeight = $(window).height();
                const imgHeight = this.element.height();
                const windowWidth = $(window).width();
                const imgWidth = this.element.width();
                
                // 从底部随机位置开始升起
                const startX = Math.random() * (windowWidth - imgWidth);
                const startY = windowHeight + imgHeight;
                
                // 升起到随机高度（屏幕高度的20%-50%）
                const peakHeight = windowHeight * (0.2 + Math.random() * 0.3);
                
                // 随机选择向左或向右落下，以及落下的距离
                const direction = Math.random() > 0.5 ? 1 : -1;
                const fallDistance = (windowWidth / 4) + Math.random() * (windowWidth / 4);
                const targetX = startX + direction * fallDistance;
                const targetY = windowHeight + imgHeight; // 落到屏幕下方
                
                // 礼花动画：先升起再落下
                let startTime = null;
                const riseDuration = 600; // 升起阶段持续时间（毫秒）
                const fallDuration = 1200; // 落下阶段持续时间（毫秒）
                const totalDuration = riseDuration + fallDuration; // 总动画时间
                
                const animateFirework = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    
                    if (elapsed < riseDuration) {
                        // 第一阶段：升起
                        const progress = elapsed / riseDuration;
                        const currentY = startY - (startY - peakHeight) * progress;
                        
                        this.element.css({
                            left: startX,
                            top: currentY,
                            transform: `rotate(${progress * 180}deg)`
                        });
                        
                        requestAnimationFrame(animateFirework);
                    } else if (elapsed < totalDuration) {
                        // 第二阶段：分散落下
                        const fallProgress = (elapsed - riseDuration) / fallDuration;
                        
                        // 抛物线运动：x匀速，y加速
                        const currentX = startX + (targetX - startX) * fallProgress;
                        const currentY = peakHeight + (targetY - peakHeight) * fallProgress * fallProgress;
                        
                        this.element.css({
                            left: currentX,
                            top: currentY,
                            transform: `rotate(${180 + fallProgress * 540}deg)`
                        });
                        
                        requestAnimationFrame(animateFirework);
                    } else {
                        // 动画结束
                        this.element.remove();
                        if (callback) callback();
                    }
                };
                
                requestAnimationFrame(animateFirework);
            }
        }
    }

// 全局变量
const edges = ['top', 'right', 'bottom', 'left'];

function getStartPosition(edge, imgSize) {
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();
    const scrollTop = $(window).scrollTop();
    
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
                coord: scrollTop + Math.random() * (windowHeight - imgSize),
                offsetLeft: edge === 'left' ? 0 : windowWidth - imgSize
            };
    }
}        

function startAnimation(animalCount) {
    let selectedEdges = [];
    
    if (animalCount === 1) {
        selectedEdges.push(edges[Math.floor(Math.random() * edges.length)]);
    } else {
        for (let i = 0; i < animalCount; i++) {
            selectedEdges.push('bottom');
        }
    }
    
    let loadedCount = 0;
    const animators = [];
    const availableNumbers = [];
    
    for (let i = 1; i <= 21; i++) {
        availableNumbers.push(i);
    }
    
    for (let i = 0; i < animalCount; i++) {
        const edge = selectedEdges[i];
        const imgindex = availableNumbers.splice(GetRnd(0, availableNumbers.length - 1), 1)[0];
        const imageUrl = "zoo/A" + imgindex + ".png";
        
        const tempImg = new Image();
        tempImg.src = imageUrl;
        
        tempImg.onload = function() {
            const imgWidth = this.width;
            const imgHeight = this.height;
            const maxSize = Math.max(imgWidth, imgHeight);
            const startPosition = getStartPosition(edge, maxSize);
            
            const animator = new AnimalAnimator(imageUrl, edge, startPosition);
            
            animator.createElement(() => {
                animators.push(animator);
                loadedCount++;
                
                if (loadedCount === animalCount) {
                    animators.forEach((anim, index) => {
                        if (animalCount > 1) {
                            setTimeout(() => {
                                anim.animate();
                            }, index * 100); // 每个动物延迟100ms，产生礼花效果
                        } else {
                            anim.animate();
                        }
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
        this.direction = direction;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.size = Math.random() * 8 + 2;
        this.speedX = (Math.random() * 5 + 3) * direction;
        this.speedY = Math.random() * -8 - 2;
        this.gravity = 0.1;
        this.friction = 0.98;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }
    
    update() {
        this.speedY += this.gravity;
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        return this.y < this.canvas.height + 50 && 
               this.x > -50 && 
               this.x < this.canvas.width + 50;
    }
    
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
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
        this.particles = [];
        
        for (let i = 0; i < 150; i++) {
            this.particles.push(new ConfettiParticle(
                this.canvas,
                -20,
                Math.random() * this.canvas.height,
                1
            ));
        }
        
        for (let i = 0; i < 150; i++) {
            this.particles.push(new ConfettiParticle(
                this.canvas,
                this.canvas.width + 20,
                Math.random() * this.canvas.height,
                -1
            ));
        }
        
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(particle => {
            const isAlive = particle.update();
            if (isAlive) {
                particle.draw();
            }
            return isAlive;
        });
        
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
