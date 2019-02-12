var populationSize=100;
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
var speed=8;
var lifetimeincreasecount=15;
var dynamicObstacle=new Object();
dynamicObstacle.pos=new Object();
dynamicObstacle.pos.x=0;
dynamicObstacle.pos.y=100;
dynamicObstacle.velocity=8;
var dynamicObstacle1=new Object();
dynamicObstacle1.pos=new Object();
dynamicObstacle1.pos.x=770;
dynamicObstacle1.pos.y=160;
dynamicObstacle1.velocity=8;
function setup(){
	createCanvas(800,600);
	background(0);
	target.x=700;
	target.y=height/2;
	// target.x=width/2+300;
	// target.y=10;
	obstacle.x=240;
	obstacle.y=height/2;
	for(var i=0;i<populationSize;i++){
		population[i]=new Object();
		population[i].fitness=0;
		population[i].gene=[];
		population[i].pos=new Object();
		population[i].pos.x=400;
		population[i].pos.y=580;
		population[i].dead=false;
		population[i].deadbyobstacle=false;
		population[i].brain=new NeuralNetwork(5,7,2);
		for(var j=0;j<lifetime;j++){
			population[i].gene[j]=new Object();
			population[i].gene[j].x=random(-speed,speed)
			population[i].gene[j].y=random(-speed,speed);
		}

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
	for(var i=0;i<populationSize;i++){
		if(collideRectRect(population[i].pos.x,population[i].pos.y,10,10,target.x,target.y,10,10)){
			return true;
		}		
	}
	return false;
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
			population[i].fitness=1/dist(population[i].pos.x,population[i].pos.y,target.x,target.y);
		}
	}
}
function findbest(){
	var temp_score=0;
	var temp_population;
	for(var i=0;i<populationSize;i++){
		if(population[i].fitness>temp_score){
			temp_score=population[i].fitness;
			temp_population=population[i];
		}
	}
	bestPopulation=temp_population;
	bestScore=temp_score;
}
function crossover(parenta,parentb){
	var child=new Object();
	child.dead=false;
	child.deadbyobstacle=false;
	child.fitness=0;
	child.pos=new Object();
	child.pos.x=400;
	child.pos.y=580;
	child.gene=[];
	var midpoint=floor(parenta.gene.length/2);
	for(var i=0;i<lifetime;i++){
		child.gene[i]=new Object();
		if(i>midpoint){
			child.gene[i].x=parenta.gene[i].x;
			child.gene[i].y=parentb.gene[i].y;
		}
		else{
			child.gene[i].x=parenta.gene[i].x;
			child.gene[i].y=parentb.gene[i].y;
		}
	}
	if(parenta.fitness>parentb.fitness){
		child.brain=parenta.brain.copy();
	}
	else{
		child.brain=parentb.brain.copy();
	}
	// mutating the current neural network
	child.brain.mutate();
	// mutating child gene
	for(var i=0;i<lifetime;i++){
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
	pool=[];
	population.sort(compare);
	for(var i=0;i<populationSize/2;i++){
		var score=floor(population[i].fitness*100000);
		for(var j=0;j<score;j++)
			pool.push(population[i]);
	}
	pool.sort(compare);
	for(var i=0;i<populationSize;i++){
		var rand=floor(random(0,pool.length/4));
		var parenta=pool[rand];
		var rand=floor(random(0,pool.length/4));
		var parentb=pool[rand];
		var child=crossover(parenta,parentb);
		population[i]=child;		
	}
}
function think(population){
	var inputs=[];
	var temp_x=(population.pos.x-0)/(800-0);
	var temp_y=(population.pos.y-0)/(800-0);
	var temp_dist_to_target=1/(dist(population.pos.x,population.pos.y,target.x,target.y));
	var temp_dist_to_obstacle;
	if(population.pos.x>=240 && population.pos.x<=640 && population.pos.y>=(height/2)+10){
		temp_dist_to_obstacle=1/dist(population.pos.x,population.pos.y,population.pos.x,obstacle.y+10);
	}
	else if(population.pos.y>=(height/2)+10){
		temp_dist_to_obstacle=0.95;	
	}
	else{
		temp_dist_to_obstacle=1;
	}
	inputs[0]=temp_x;
	inputs[1]=temp_y;
	inputs[2]=temp_dist_to_obstacle;
	inputs[3]=1/dist(population.pos.x,population.pos.y,dynamicObstacle.pos.x,dynamicObstacle.pos.y);
	inputs[4]=1/dist(population.pos.x,population.pos.y,dynamicObstacle1.pos.x,dynamicObstacle1.pos.y);
	var outputs=population.brain.query(inputs);
	return outputs;
}
function draw(){
	background(0);
	fill(0,0,255);
	rect(obstacle.x,obstacle.y,300,10);
	rect(dynamicObstacle.pos.x,dynamicObstacle.pos.y,30,30);
	if(dynamicObstacle.pos.x+dynamicObstacle.velocity+30>=800 || dynamicObstacle.pos.x+dynamicObstacle.velocity<=0)
		dynamicObstacle.velocity*=-1;
	dynamicObstacle.pos.x+=dynamicObstacle.velocity;
	rect(dynamicObstacle1.pos.x,dynamicObstacle1.pos.y,30,30);
	if(dynamicObstacle1.pos.x+dynamicObstacle1.velocity+30>=800 || dynamicObstacle1.pos.x+dynamicObstacle1.velocity<=0)
		dynamicObstacle1.velocity*=-1;
	dynamicObstacle1.pos.x+=dynamicObstacle1.velocity;
	
	fill(0,255,0);
	rect(target.x,target.y,10,10);
	fill(255,100,0);
	for(var i=0;i<populationSize;i++){
		if(!population[i].dead){
			var outputs=think(population[i]);
			if(outputs[0]>0.5){
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
			if(outputs[1]>0.5){
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
			if(population[i].pos.x+population[i].gene[step].x<0 ||population[i].pos.x+population[i].gene[step].x>790 ||population[i].pos.y+population[i].gene[step].y>590|| population[i].pos.y+population[i].gene[step].y<0||collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,obstacle.x,obstacle.y,300,10)){
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			else if(collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,dynamicObstacle.pos.x+dynamicObstacle.velocity,dynamicObstacle.pos.y,30,30)){
				console.log("hit");
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			else if(collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,dynamicObstacle1.pos.x+dynamicObstacle1.velocity,dynamicObstacle1.pos.y,30,30)){
				console.log("hit")
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			else
				rect(population[i].pos.x+=population[i].gene[step].x,population[i].pos.y+=population[i].gene[step].y,10,10)
		}
	}
	step++;
	if(step==lifetime-1){
		step=0;
		for(var i=0;i<populationSize;i++){
			population[i].dead=true;
		}
	}
	if(evaluate()){
		if(gamestatus==0){
			gamestatus=1;
			target.x=width/2;
			target.y=10;
		}
		else if(gamestatus==1){
			gamestatus=2;
		}
	}
	fill(255);
	text("Best Score= "+bestScore,0,10);
	text("Generations= "+generations,0,30);
	text("speed= "+speed,0,50);
	if(gamestatus==2){
		fill(0,255,0);
		text("Won",0,70);
	}
	if(alldead()){
		generations++;
		hit=0;
		dynamicObstacle1.pos.x=770;
		dynamicObstacle1.pos.y=160;
		dynamicObstacle.pos.x=0;
		dynamicObstacle.pos.y=100;
		calculateFitness();	
		findbest();
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

}