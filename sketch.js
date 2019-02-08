var populationSize=250;
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
function setup(){
	createCanvas(800,600);
	background(0);
	target.x=700;
	target.y=height/2;
	obstacle.x=0;
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
		population[i].brain=new NeuralNetwork(4,6,2);
		for(var j=0;j<lifetime;j++){
			population[i].gene[j]=new Object();
			population[i].gene[j].x=random(-2,2)
			population[i].gene[j].y=random(-2,2);
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
			population[i].fitness=0.09*(1/dist(population[i].pos.x,population[i].pos.y,target.x,target.y));
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
function crossover(parent){
	var child=new Object();
	child.dead=false;
	child.deadbyobstacle=false;
	child.fitness=0;
	child.pos=new Object();
	child.pos.x=400;
	child.pos.y=580;
	child.gene=[];
	for(var i=0;i<parent.gene.length;i++){
		child.gene[i]=new Object();
		child.gene[i].x=parent.gene[i].x;
		child.gene[i].y=parent.gene[i].y;
	}
	child.brain=parent.brain.copy();
	child.brain.mutate();
	// mutating child gene
	for(var i=0;i<lifetime;i++){
		if(random(1)<mutationRate){
			child.gene[i].x=random(-2,2);
			child.gene[i].y=random(-2,2);
		}
	}
	return child;
}
// function mutate(child){
// 	for(var i=0;i<lifetime;i++){
// 		if(random(1)<mutationRate){
// 			child.gene[i].x=random(-2,2);
// 			child.gene[i].y=random(-2,2);
// 		}
// 	}
// 	return child;
// }
function compare(a,b){
	if (a.fitness > b.fitness)
     	return -1;
  	if (a.fitness < b.fitness)
    	return 1;
  	return 0;
}
function naturalSelection(){
	pool=[];
	for(var i=0;i<populationSize;i++){
		var score=floor(population[i].fitness*100000);
		for(var j=0;j<score;j++)
			pool.push(population[i]);
	}
	pool.sort(compare);
	for(var i=0;i<populationSize;i++){
		var rand=floor(random(0,pool.length/2));
		var parent=pool[rand];
		var child=crossover(parent);
		population[i]=child;		
	}
}
// Replaced by p5.js collision detection libarary
// function collisioncheck(x,y){
// 	if((x+(10)>=obstacle.x && x+(10)<=obstacle.x+(600)) && (y+(10)>=obstacle.y && y+(10)<=obstacle.y+(10))){
//     	return true;
//     }
//     else if((x>=obstacle.x && x<=obstacle.x+(600))&&(y>=obstacle.y && y<=obstacle.y+(10))){
//     	return true;
//     }
//     return false;
// }
function think(population){
	var inputs=[];
	var temp_x=(population.pos.x-0)/(800-0);
	var temp_y=(population.pos.y-0)/(800-0);
	var temp_dist_to_target=1/(dist(population.pos.x,population.pos.y,target.x,target.y));
	var temp_dist_to_obstacle;
	if(population.pos.x>=0 && population.pos.x<=600 && target.x==700){
		temp_dist_to_obstacle=1/dist(population.pos.x,population.pos.y,population.pos.x,obstacle.y+10);
	}
	else if(target.x==700){
		temp_dist_to_obstacle=0.95;	
	}
	else{
		temp_dist_to_obstacle=1;
	}
	inputs[0]=temp_x;
	inputs[1]=temp_y;
	inputs[2]=temp_dist_to_target;
	inputs[3]=temp_dist_to_obstacle;
	var outputs=population.brain.query(inputs);
	return outputs;
}
function draw(){
	background(0);
	fill(0,0,255);
	rect(obstacle.x,obstacle.y,600,10);
	fill(0,255,0);
	rect(target.x,target.y,10,10);
	fill(255,0,0);
	for(var i=0;i<populationSize;i++){
		if(!population[i].dead){
			var outputs=think(population[i]);
			if(outputs[0]>0.5){
				var temp=new Object();
				temp.x=2;
				temp.y=0;
				population[i].gene.push(temp);
			}
			else{
				var temp=new Object();
				temp.x=-2;
				temp.y=0;
				population[i].gene.push(temp);	
			}
			if(outputs[1]>0.5){
				var temp=new Object();
				temp.x=0;
				temp.y=2;
				population[i].gene.push(temp);
			}
			else{
				var temp=new Object();
				temp.x=0;
				temp.y=-2;
				population[i].gene.push(temp);
			}
			if(population[i].pos.x+population[i].gene[step].x<0 ||population[i].pos.x+population[i].gene[step].x>790 ||population[i].pos.y+population[i].gene[step].y>590|| population[i].pos.y+population[i].gene[step].y<0||collideRectRect(population[i].pos.x+population[i].gene[step].x,population[i].pos.y+population[i].gene[step].y,10,10,obstacle.x,obstacle.y,600,10)){
				population[i].dead=true;
				population[i].deadbyobstacle=true;
			}
			// console.log(population);
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
	if(gamestatus==2){
		fill(0,255,0);
		text("Won",0,50);
	}
	if(alldead()){
		generations++;
		calculateFitness();	
		findbest();
		console.log("Best Score= "+bestScore);
		naturalSelection();
		if(generations%2==0){
			for(var i=0;i<populationSize;i++){	
				for(var j=lifetime;j<lifetime+15;j++){
					population[i].gene[j]=new Object();
					population[i].gene[j].x=random(-2,2);
					population[i].gene[j].y=random(-2,2);
				}	
			}
			lifetime+=15;
		}
	}

}