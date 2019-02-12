class node{
    constructor(x,y,diameter){
        this.x=x;
        this.y=y;
        this.diameter=diameter;
    }
    show(){
        ellipse(this.x,this.y,this.diameter,this.diameter);
    }
}