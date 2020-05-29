//"use strict";
var c=document.getElementById("myCanvas");
var cxt=c.getContext("2d");
cxt.fillStyle="#FF0000";

var WIDTH = c.width, HEIGHT = c.height;
var FPS = 30;

Balls = []

function draw_ball(id) {
	cxt.beginPath();
	cxt.arc(Balls[id].pos.x,Balls[id].pos.y,Balls[id].r,0,Math.PI*2,true);
	cxt.closePath();
	cxt.fill();
}

function creat_ball(x,y,r=20,m=1,vx=0,vy=0, e=0) {
	//创建球
	Balls.push({
		pos: {
			x: x,
			y: y
		},    // 直角坐标位置
		r: r, // 半径
		m: m, // 质量
		v: {
			x: vx,
			y: vy
		},    //速度（分解后）
		move: function(){
			// 单次移动函数
			this.pos.x += this.v.x;
			this.pos.y += this.v.y;
		},
        e: e
	});
}

function clear_screen() {
	// 清屏
	cxt.clearRect(0,0,WIDTH,HEIGHT);
}

function update() {
	//更新画布
	clear_screen();
	for (var ball_id = 0; ball_id < Balls.length; ball_id++) {
		draw_ball(ball_id);
	}
}

function solvefunc(a, b, c) {
	// 求解二次函数
    var delta = Math.sqrt(b*b-4*a*c);
    return [(-b+delta)/(2*a), (-b-delta)/(2*a)];
}

function force(b1, b2, pro) {
	// b1,b2传入id, pro传入字符串表示属性，例如：force(1,2,"m")
	// 解形如k*q1*q2/R^2的受力
    var x = Balls[b1].pos.x - Balls[b2].pos.x;
    var y = Balls[b1].pos.y - Balls[b2].pos.y;
    distance = x*x + y*y;
    if (dis == 0){
        return [0,0];
    }
    f = Balls[b1][pro] * Balls[b2][pro] / distance;
    fx = f / Math.sqrt(distance) * x;
    fy = f / Math.sqrt(distance) * y;
    return [-fx, -fy];
}

function dis(p1, p2) {
	//传入{x:x,y:y}
    return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
}

function hited(b1, b2) {
    // 是否碰撞
    
    if (b1 >= Balls.length || b2 > Balls.length) return false;
    var dv_x = Balls[b1].v.x-Balls[b2].v.x;
    var dv_y = Balls[b1].v.y-Balls[b2].v.y;
    return (dv_x*dv_x+dv_y*dv_y!=0) && dis(Balls[b1].pos, Balls[b2].pos) <= Balls[b1].r + Balls[b2].r - 1e-8;
    //1e-8是为了防止浮点数计算误差，下同。
}

function hit(b1, b2) {
    // 基于pyton3代码修改，可读性极差建议直接看py3源码...
    // 运算符重载一时爽, Javascript重写火葬场
    // 弹性碰撞处理
    var dv_x = Balls[b1].v.x-Balls[b2].v.x;
    var dv_y = Balls[b1].v.y-Balls[b2].v.y;

    if (dv_x*dv_x+dv_y*dv_y==0) {
        // 速度差为0
        return;
    }
    if (hited(b1,b2) == false){
        return;
    }

    var dp_x = Balls[b2].pos.x-Balls[b1].pos.x;
    var dp_y = Balls[b2].pos.y-Balls[b1].pos.y;
    // 位置差
    var dt = 0;
    // 当前时间与碰撞确切时间差

    if (Math.sqrt(dp_x*dp_x + dp_y*dp_y) < Balls[b1].r+Balls[b2].r) {
        var a = dv_x*dv_x + dv_y*dv_y;
        var b = -2 * (dv_x * dp_x + dv_y * dp_y);
        var c = dp_x**2 + dp_y**2 - (Balls[b1].r+Balls[b2].r)**2;
        dt = solvefunc(a, b, c)[1];
        Balls[b1].pos.x += dt * Balls[b1].v.x;
        Balls[b1].pos.y += dt * Balls[b1].v.y;
        Balls[b2].pos.x += dt * Balls[b2].v.x;
        Balls[b2].pos.y += dt * Balls[b2].v.y;
        //一堆乱七八糟的公式自己推吧
    }
    // 球恢复到“碰撞瞬间”
    
    Balls[b1].v.x-=Balls[b2].v.x;
    Balls[b1].v.y-=Balls[b2].v.y;

    dp_x = Balls[b2].pos.x-Balls[b1].pos.x;
    dp_y = Balls[b2].pos.y-Balls[b1].pos.y;

    alpha = 0;
    // 角度
    if (Math.abs(dp_x) <= 1e-8) {
        if (dp.y > 0) {
            alpha = Math.asin(1);
        } else {
            alpha = Math.asin(-1);
        }
    } else {
        alpha = Math.atan(dp_y/dp_x);
    }

    function mul(a,b) {
    	return a.x*b.x + a.y*b.y;
    	// 向量点积
    }
    function imul(a,b) {
        //向量数量积
        return {x:b.x*a, y:b.y*a};
    }
    function add(a,b) {
        //向量和
        return {x:b.x+a.x, y:b.y+a.y};
    }

    v0 = mul(Balls[b1].v , {x:Math.cos(alpha), y: Math.sin(alpha)});
    v0c = add(Balls[b1].v, imul(-v0, {x:Math.cos(alpha), y:Math.sin(alpha)}));
    
    //下面这段可读性实在太差了……
    Balls[b1].v = Balls[b2].v;
    Balls[b2].v = add(Balls[b2].v, imul(((2*Balls[b1].m)/(Balls[b1].m+Balls[b2].m)), imul(v0, {x:Math.cos(alpha), y:Math.sin(alpha)})));
    Balls[b1].v = add(add(Balls[b1].v, imul(((Balls[b1].m-Balls[b2].m)/(Balls[b1].m+Balls[b2].m)), imul(v0, {x:Math.cos(alpha), y:Math.sin(alpha)}))), v0c);
    // 球弹开
    dt = -dt
    Balls[b1].pos = add(Balls[b1].pos, imul(dt, Balls[b1].v));
    Balls[b2].pos = add(Balls[b2].pos, imul(dt, Balls[b2].v));
}

function move_all() {
    // 初次计算移动
    for (var ball_id = 0; ball_id < Balls.length; ball_id++) {
        Balls[ball_id].move();
        if (Balls[ball_id].pos.x - Balls[ball_id].r <= 0) {
            Balls[ball_id].v.x *= -1;
            Balls[ball_id].pos.x = 1 + Balls[ball_id].r;
        }
        if (Balls[ball_id].pos.x + Balls[ball_id].r >= WIDTH) {
            Balls[ball_id].v.x *= -1;
            Balls[ball_id].pos.x = WIDTH - 1 - Balls[ball_id].r;
        }
        if (Balls[ball_id].pos.y - Balls[ball_id].r <= 0) {
            Balls[ball_id].v.y *= -1;
            Balls[ball_id].pos.y = 1 + Balls[ball_id].r;
        }
        if (Balls[ball_id].pos.y + Balls[ball_id].r >= HEIGHT) {
            Balls[ball_id].v.y *= -1;
            Balls[ball_id].pos.y = HEIGHT - 1 - Balls[ball_id].r;
        }
    }
}

function count_hit() {
    hits = [];
    for (var i = 0; i < Balls.length; i++) {
        for (var j = i + 1; j < Balls.length; j++) {
            if (hited(i,j)) {
                hits.push({deep: Balls[i].r + Balls[j].r - dis(Balls[i].pos, Balls[j].pos), a:i, b:j});
            }
        }
    }
    hits.sort(function(a,b){return a.r-b.r});
    return hits;
}

function make_fouce(pro, k) {
    // 受力统一计算
    for (var i = 0; i < Balls.length; i++) {
        for (var j = 0; j < Balls.length; j++) {
            if (i != j) {
                if (Balls[i][pro] == 0) continue;
                if (Balls[j][pro] == 0) continue;

                var fc = force(i, j, pro);
                Balls[i].v.x += 1/Balls[i][pro] * fc[0] * k;
                Balls[i].v.y += 1/Balls[i][pro] * fc[1] * k;

            }
        }
    }
}

function main_function(){
    move_all();
    hitlist = count_hit() 
    while (hitlist.length != 0) {
        for (var i = 0; i < hitlist.length; i++){
            hit(hitlist[i].a, hitlist[i].b);
        }
        hitlist = count_hit();
    }
    make_fouce("m", 1000); //重力场， 1000为引力常数
	update();
    //main_loop
    setTimeout(function(){main_function()},1000/FPS);
}

creat_ball(100,200,20,1,1,2);
creat_ball(200,300,20,1,-2,-1);

c.addEventListener('click', function(){creat_ball(event.clientX, event.clientY);});

main_function();



