class node{
    constructor(x,y,diameter){
        this.x=x;
        this.y=y;
        this.diameter=diameter;
    }
    show(){
        fill(255);
        stroke(255);
        ellipse(this.x,this.y,this.diameter,this.diameter);
    }
}