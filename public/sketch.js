var inputnodes=[];
var hiddennodes=[];
var outputnodes=[];
var populationSize=150;
var population=[];
var target=new Object();
var obstacle=new Object();
var lifetime=100;
var step=0;
var generations=0;
var pool=[];
var mutationRate=0.01;
var bestPopulation;
var bestScore=0;
var gamestatus=0;
var speed=7;
var obstaclevelocity=8;
var lifetimeincreasecount=15;
var wincount=0;
var showonlybestpopulation=false;
var dynamicObstacle=new Object();
dynamicObstacle.pos=new Object();
dynamicObstacle.pos.x=0;
dynamicObstacle.pos.y=140;
dynamicObstacle.velocity=obstaclevelocity;
var dynamicObstacle1=new Object();
dynamicObstacle1.pos=new Object();
dynamicObstacle1.pos.x=770;
dynamicObstacle1.pos.y=240;
dynamicObstacle1.velocity=obstaclevelocity;
var dynamicObstacle2=new Object();
dynamicObstacle2.pos=new Object();
dynamicObstacle2.pos.x=0;
dynamicObstacle2.pos.y=340;
dynamicObstacle2.velocity=obstaclevelocity;
var dynamicObstacle3=new Object();
dynamicObstacle3.pos=new Object();
dynamicObstacle3.pos.x=770;
dynamicObstacle3.pos.y=440;
dynamicObstacle3.velocity=obstaclevelocity;
function setup(){
	createCanvas(800,600);
	background(0);
	// target.x=700;
	// target.y=height/2;
	target.x=width/2-50+300;
	target.y=10;
	// obstacle.x=240;
	// obstacle.y=height/2;
	for(var i=0;i<populationSize;i++){
		population[i]=new Object();
		population[i].fitness=0;
		population[i].gene=[];
		population[i].pos=new Object();
		population[i].pos.x=width/2-5;
		population[i].pos.y=580;
		population[i].dead=false;
		population[i].deadbyobstacle=false;
		population[i].won=false;
		population[i].brain=new NeuralNetwork(6,7,2);
		population[i].best=false;
		for(var j=0;j<lifetime;j++){
			population[i].gene[j]=new Object();
			population[i].gene[j].x=random(-speed,speed)
			population[i].gene[j].y=random(-speed,speed);
		}

	}
	var temp=200;
	for(var i=0;i<6;i++){
		inputnodes[i]=new node(250,temp,10,10);
		temp+=50;
	}
	temp=175;
	for(var i=0;i<7;i++){
		hiddennodes[i]=new node(470,temp,10,10);
		temp+=50;
	}
	temp=300;
	for(var i=0;i<2;i++){
		outputnodes[i]=new node(660,temp,10,10);
		temp+=50;
	}
}
function alldead(){
	for(var i=0;i<populationSize;i++){
		if(!population[i].dead)
			return false;
	}
	return true;
}
function evaluate(){
	var count=0;
	for(var i=0;i<populationSize;i++){
		if(collideRectRect(population[i].pos.x,population[i].pos.y,10,10,target.x,target.y,100,80)){
			population[i].won=true;
			count++;
		}		
	}
	if(count==0){
		return [false,count];
	}
	else{
		return [true,count];
	}
}
function manhattan(x1,y1,x2,y2){
	return (abs(x2-x1)+abs(y2-y1));
}
function calculateFitness(){
	for(var i=0;i<populationSize;i++){
		if(population[i].deadbyobstacle){
			population[i].fitness=0.0000001;
		}
		else{
			if(population[i].won){
				population[i].fitness=1/manhattan(population[i].pos.x,population[i].pos.y,target.x+50,target.y+80)*10;
			}
			else
				population[i].fitness=1/manhattan(population[i].pos.x,population[i].pos.y,target.x+50,target.y+80);
		}
	}
}
function findbest(){
	var temp_score=0;
	var temp_population;
	var temp_population_id;
	for(var i=0;i<populationSize;i++){
		if(population[i].fitness>temp_score){
			temp_score=population[i].fitness;
			temp_population=population[i];
			temp_population_id=i;
		}
	}
	bestPopulation=temp_population;
	bestScore=temp_score;
	population[temp_population_id].best=true;
}
function crossover(parent){
	var child=new Object();
	child.dead=false;
	child.deadbyobstacle=false;
	child.fitness=0;
	child.pos=new Object();
	child.pos.x=width/2-5;
	child.pos.y=580;
	child.gene=[];
	child.best=false;
	// var midpoint=floor(parenta.gene.length/2);
	for(var i=0;i<parent.gene.length;i++){
		child.gene[i]=new Object();
		// if(i>midpoint){
		// 	child.gene[i].x=parenta.gene[i].x;
		// 	child.gene[i].y=parentb.gene[i].y;
		// }
		// else{
			child.gene[i].x=parent.gene[i].x;
			child.gene[i].y=parent.gene[i].y;
		// }
	}
	// if(parenta.fitness>parentb.fitness){
		child.brain=parent.brain.copy();
	// }
	// else{
	// 	child.brain=parentb.brain.copy();
	// }
	// mutating the current neural network
	child.brain.mutate();
	// mutating child gene
	for(var i=0;i<parent.gene.length;i++){
		if(random(1)<mutationRate){
			child.gene[i].x=random(-speed,speed);
			child.gene[i].y=random(-speed,speed);
		}
	}
	return child;
}
function compare(a,b){
	if (a.fitness > b.fitness)
     	return -1;
  	if (a.fitness < b.fitness)
    	return 1;
  	return 0;
}
function naturalSelection(){
	// pool=[];
	// population.sort(compare);
	// for(var i=0;i<populationSize/2;i++){
	// 	var score=floor(population[i].fitness*100000);
	// 	for(var j=0;j<score;j++)
	// 		pool.push(population[i]);
	// }
	// pool.sort(compare);
	for(var i=0;i<populationSize;i++){
		// var rand=floor(random(0,pool.length/4));
		// var parent=pool[rand];
		// var rand=floor(random(0,pool.length/4));
		// var parentb=pool[rand];
		// var child=crossover(parenta,parentb);
		if(!population[i].won){
			var child=crossover(bestPopulation);
			population[i]=child;		
		}
	}
}
function keyPressed(key){
	if(key.key=="p"){
		showonlybestpopulation=!showonlybestpopulation;
	}
}
function think(population){
	var inputs=[];
	var temp_x=(population.pos.x-0)/(800-0);
	var temp_y=(population.pos.y-0)/(800-0);
	var temp_dist_to_target=1/(dist(population.pos.x,population.pos.y,target.x+50,target.y+80));
	// var temp_dist_to_obstacle;
	// if(population.pos.x>=240 && population.pos.x<=640 && population.pos.y>=(height/2)+10){
	// 	temp_dist_to_obstacle=1/dist(population.pos.x,population.pos.y,population.pos.x,obstacle.y+10);
	// }
	// else if(population.pos.y>=(height/2)+10){
	// 	temp_dist_to_obstacle=0.95;	
	// }
	// else{
	// 	temp_dist_to_obstacle=1;
	// }
	inputs[0]=temp_x;
	inputs[1]=temp_y;
	inputs[2]=1/manhattan(population.pos.x,population.pos.y,dynamicObstacle.pos.x,dynamicObstacle.pos.y);
	inputs[3]=1/manhattan(population.pos.x,population.pos.y,dynamicObstacle1.pos.x,dynamicObstacle1.pos.y);
	inputs[4]=1/manhattan(population.pos.x,population.pos.y,dynamicObstacle2.pos.x,dynamicObstacle2.pos.y);
	inputs[5]=1/manhattan(population.pos.x,population.pos.y,dynamicObstacle3.pos.x,dynamicObstacle3.pos.y);
	var outputs=population.brain.query(inputs);
	return outputs;
}
function draw(){
	frameRate(20);
	background(0);
	fill(0,0,255);
	// rect(obstacle.x,obstacle.y,300,10);
	rect(dynamicObstacle.pos.x,dynamicObstacle.pos.y,30,30);
	if(dynamicObstacle.pos.x+dynamicObstacle.velocity+30>=800 || dynamicObstacle.pos.x+dynamicObstacle.velocity<=0)
		dynamicObstacle.velocity*=-1;
	dynamicObstacle.pos.x+=dynamicObstacle.velocity;
	rect(dynamicObstacle1.pos.x,dynamicObstacle1.pos.y,30,30);
	if(dynamicObstacle1.pos.x+dynamicObstacle1.velocity+30>=800 || dynamicObstacle1.pos.x+dynamicObstacle1.velocity<=0)
		dynamicObstacle1.velocity*=-1;
	dynamicObstacle1.pos.x+=dynamicObstacle1.velocity;
	rect(dynamicObstacle2.pos.x,dynamicObstacle2.pos.y,30,30);
	if(dynamicObstacle2.pos.x+dynamicObstacle2.velocity+30>=800 || dynamicObstacle2.pos.x+dynamicObstacle2.velocity<=0)
		dynamicObstacle2.velocity*=-1;
	dynamicObstacle2.pos.x+=dynamicObstacle2.velocity;
	rect(dynamicObstacle3.pos.x,dynamicObstacle3.pos.y,30,30);
	if(dynamicObstacle3.pos.x+dynamicObstacle3.velocity+30>=800 || dynamicObstacle3.pos.x+dynamicObstacle3.velocity<=0)
		dynamicObstacle3.velocity*=-1;
	dynamicObstacle3.pos.x+=dynamicObstacle3.velocity;
	fill(0,255,0);
	rect(target.x,target.y,100,80);
	fill(255,100,0);
	for(var i=0;i<populationSize;i++){
		var outputs=think(population[i]);
		if(outputs[0]>=0.5){
			var temp=new Object();
			temp.x=random(0,speed);
			temp.y=0;
			population[i].gene.push(temp);
		}
		else{
			var temp=new Object();
			temp.x=random(-speed,0);
			temp.y=0;
			population[i].gene.push(temp);	
		}
		if(outputs[1]>=0.5){
			var temp=new Object();
			temp.x=0;
			temp.y=random(0,speed);
			population[i].gene.push(temp);
		}
		else{
			var temp=new Object();
			temp.x=0;
			temp.y=random(-speed,0);
			population[i].gene.push(temp);
		}
		if(!population[i].dead){
			if(population[i].pos.x+population[i].gene[step].x<0 ||population[i].pos.x+population[i].gene[step].x>790 ||population[i].pos.y+population[i].gene[step].y>590|| population[i].pos.y+population[i].gene[step].y<0){
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			// else if(collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,obstacle.x,obstacle.y,300,10)){
			// 	population[i].dead=true;
			// 	population[i].deadbyobstacle=true;
			// }
			else if(collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,dynamicObstacle.pos.x+dynamicObstacle.velocity,dynamicObstacle.pos.y,30,30)){
				// console.log("hit");
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			else if(collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,dynamicObstacle1.pos.x+dynamicObstacle1.velocity,dynamicObstacle1.pos.y,30,30)){
				// console.log("hit")
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			else if(collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,dynamicObstacle2.pos.x+dynamicObstacle2.velocity,dynamicObstacle2.pos.y,30,30)){
				// console.log("hit")
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			else if(collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,dynamicObstacle3.pos.x+dynamicObstacle3.velocity,dynamicObstacle3.pos.y,30,30)){
				// console.log("hit")
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			
			else {
				if(!population[i].won && !population[i].dead){
					if(population[i].best){
						fill(0,255,0);
						rect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10)
						population[i].best=false;
					}
					else if(!showonlybestpopulation){
						fill(255,100,0);
						rect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10)
					}
					population[i].pos.x+=population[i].gene[step].x;
					population[i].pos.y+=population[i].gene[step].y;
				}
			}
		}
	}
	step++;
	if(step==lifetime){
		step=0;
		for(var i=0;i<populationSize;i++){
			population[i].dead=true;
		}
	}
	var temp=evaluate();
	if(temp[0]){
		if(gamestatus==0){
			wincount=temp[1];
			gamestatus=1;
			// target.x=width/2;
			// target.y=10;
		}
		// else if(gamestatus==1){
		// 	gamestatus=2;
		// }
	}
	fill(255);
	text("Best Score= "+bestScore,0,10);
	text("Generations= "+generations,0,30);
	text("speed= "+speed,0,50);
	text("Win count= "+wincount,0,70);
	if(gamestatus==1){
		fill(0,255,0);
		text("Won",0,90);
		if(wincount===populationSize){
			alert("All Reached Distination");
			noLoop();
		}
		gamestatus=0;
	}
	calculateFitness();
	findbest();
	if(alldead()){
		generations++;
		dynamicObstacle.pos.x=0;
		dynamicObstacle.pos.y=140;
		dynamicObstacle1.pos.x=770;
		dynamicObstacle1.pos.y=240;
		dynamicObstacle2.pos.x=0;
		dynamicObstacle2.pos.y=340;
		dynamicObstacle3.pos.x=770;
		dynamicObstacle3.pos.y=440;
		// calculateFitness();	
		// findbest();
		// console.log("Best Score= "+bestScore);
		naturalSelection();
		if(generations%2==0){
			for(var i=0;i<populationSize;i++){	
				for(var j=lifetime;j<lifetime+lifetimeincreasecount;j++){
					population[i].gene[j]=new Object();
					population[i].gene[j].x=random(-speed,speed);
					population[i].gene[j].y=random(-speed,speed);
				}	
			}
			lifetime+=lifetimeincreasecount;
		}
	}
	displayNeuralNetwork();
}
function displayNeuralNetwork(){
	for(var i=0;i<inputnodes.length;i++)
		inputnodes[i].show();
	for(var i=0;i<hiddennodes.length;i++){
		hiddennodes[i].show();
		for(var j=0;j<inputnodes.length;j++){
			stroke(157, 158, 160);
			var temp_weight_value=map(bestPopulation.brain.wih.matrix[i][j],-1,1,1,4);
			strokeWeight(temp_weight_value);
			line(hiddennodes[i].x,hiddennodes[i].y,inputnodes[j].x,inputnodes[j].y);
		}
	}
	for(var i=0;i<outputnodes.length;i++){
		outputnodes[i].show();
		for(var j=0;j<hiddennodes.length;j++){
			stroke(157, 158, 160);
			var temp_weight_value=map(bestPopulation.brain.who.matrix[i][j],-1,1,1,4);
			strokeWeight(temp_weight_value);
			line(outputnodes[i].x,outputnodes[i].y,hiddennodes[j].x,hiddennodes[j].y);
		}
	}
	stroke(0);
	strokeWeight(1);
	// noLoop();
}