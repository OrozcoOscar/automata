let canvas=new Canvas()
canvas.size(700,500)
// variables
let S=null //Estado inicial definido
let F=[]
let delta=[]
let valoresSaltos=[]
//--------------------------------
let grupoEstados=[]
let grupoSaltos=[]
let idEstados=0
let idSaltos=0
let SELECT_MOVE=null
let SELECT=null
let CTRL=false
let SALTO=null
let initEvent=true //estado para saber si ya se presiono la tecla
// eventos
canvas.event("dblclick",createEstado)
/* MOVER */
canvas.event("mousedown",seleccionar)
canvas.event("mousemove",mover)
canvas.event("mouseup",()=>{
    if(!CTRL)SELECT_MOVE=null
})
/* FIN MOVER */
window.addEventListener("keydown",initSalto)
window.addEventListener("keyup",(e)=>{
    if(SELECT){
        CTRL=false
        initEvent=true
        SELECT.color="blue"
        if(SALTO instanceof Salto){
                let est=ScanEstado(SALTO.xf,SALTO.yf)
                if(est instanceof Estado){
                    SALTO.estadoF=est
                    SALTO.value=prompt("Ingrese el valor del salto")
                    grupoSaltos.push(SALTO)  
                }         
        }
        
        SALTO=null
        paint()
        canvas.removeEvent("mousemove",createSalto)
    }
})
// funciones

function initSalto(e){
    
    if((e.key=="Control") && initEvent){
        CTRL=true
        if(initEvent && SELECT){
            initEvent=false
            SELECT_MOVE=null
            SELECT.color="green"
            canvas.event("mousemove",createSalto)
            
        } 
    }else if(e.key=="Shift"){
        if(SELECT instanceof Estado){
            SELECT.isIni=SELECT.isIni?false:true
            if(S){
                S.isIni=false
            }
            if(SELECT.isIni){
                S=SELECT
            }else{
                S=null
            }
                
            
        }
    }else if(e.key=="f"){
        if(SELECT instanceof Estado){
            if(!F.find(e=>e.id == SELECT.id)){
                SELECT.isFin=SELECT.isFin?false:true
                F.push(SELECT)
            }else if(F.length==0){
                SELECT.isFin=SELECT.isFin?false:true
                F.push(SELECT)
            }else{
                SELECT.isFin=false
                let po=F.findIndex(e=>e.id == SELECT.id)
                F.splice(po,1)
            }
            
            document.querySelector(".estadoF").innerHTML=`[${
                F.map(e=>"q"+e.id).toString()
            }]`
        }
    }else if(e.key=="Backspace"){
        if(confirm("¿Desea eliminar este elemento?")){
            if(SELECT instanceof Estado){
                let po=grupoEstados.findIndex(e=>e.id==SELECT.id)
                grupoEstados.splice(po,1)
            }else if(SELECT instanceof Salto){
                let po=grupoSaltos.findIndex(e=>e.id==SELECT.id)
                grupoSaltos.splice(po,1)
    
            }
            
        }
    }
    paint()
}
function createSalto(e){

    let {x,y}=canvas.getMousePosition(e)
    if(!SALTO){
        if(SELECT instanceof Estado){
            SALTO=new Salto(SELECT,x,y,idSaltos,"")
            idSaltos++;
        }
    }else{
        SALTO.xf=x
        SALTO.yf=y
        paint()
        SALTO.paint()
    }
    
    
}
function createEstado(e){
    let {x,y}=canvas.getMousePosition(e)
    resetSelect().then(e=>{
        canvas.ctx.lineWidth=2
        let n=new Estado(x,y,idEstados)
        grupoEstados.push(n)
        SELECT=n
        n.paint()
        idEstados++;
    })
    
}
async function resetSelect(){
    canvas.ctx.lineWidth=1
    grupoSaltos.map(e=>e.select=false);
    grupoEstados.map(e=>e.select=false);
    paint()
}
function createMatrizDelta(){
    /// -------- limpia residuos -----
    F=[]
    S=null
    grupoSaltos.map((s,i)=>{
        let estF=false
        let estI=false
        grupoEstados.map(e=>{
            if(s.estadoF.id == e.id){
                estF=true
            }
            if(s.estadoI.id == e.id){
                estI=true
            }
        })
        if(!estF || !estI){
            grupoSaltos.splice(i,1)
        }
        
    })

    grupoEstados.map(e=>{
        if(e.isFin){
            if(F.length==0){
                F.push(e)
            }else if(!F.find(es=>es.id == e.id)){
                F.push(e)
            }
            
        }
        if(e.isIni)S=e

        
    })
    //----- Extrae los valores de los saltos ---------
    valoresSaltos=[]
    grupoSaltos.map(e=>{
        if(!valoresSaltos.includes(e.value)){
            valoresSaltos.push(e.value)
        }
    })
    //------------ genera finalmente la matriz -------------
    grupoSaltos.sort((a, b) => a.value.localeCompare(b.value))
    delta=[]
    grupoEstados.map(e=>{
        
        grupoSaltos.map(s=>{
            if(e.id==s.estadoI.id){
                let aux={
                    estadoI:e,
                    ...valoresSaltos.map(v=>{
                    if(v==s.value){
                        return {estadoF:s.estadoF,value:v}
                    }else{
                        return null
                    }
                }).filter(e=>e)[0]
            }
                delta.push(aux)
            }
        })
        
    })
    pintarMatriz()
}
function pintarMatriz(){
    document.querySelector("table").innerHTML=""
    document.querySelector("table").innerHTML+=`<tr><th>Δ</th>${
        valoresSaltos.map(e=>`<th>${e}</th>`).toString().replace(/,/g,"")
    }</tr>`
    delta.reverse()
    delta.map(e=>{
        let r=`<td >q${e.estadoI.id}</td>`+valoresSaltos.map(v=>{
            if(e.value==v){
                return `<td>q${e.estadoF.id}</td>`
            }else{
                return `<td class="void">Ø</td>`
            }
        }).toString().replace(/,/g,"")
        document.querySelector("table").innerHTML+=`<tr>${r}</tr>`
    })
    delta.reverse()
}
function paint(){
    createMatrizDelta()
    canvas.clear()
    canvas.ctx.lineWidth=1
    if(grupoEstados.length==0)idEstados=0
    grupoSaltos.map(e=>e.paint());
    grupoEstados.map(e=>e.paint());
    document.querySelector(".estadoF").innerHTML=`[${
        F.map(e=>"q"+e.id).toString()
    }]`
    if(S){
       document.querySelector(".estadoI").innerHTML="q"+S.id 
    }else{
        document.querySelector(".estadoI").innerHTML="no definido"
    }
    
}
function save(){
    const a = document.createElement("a");
    const archivo = new Blob([JSON.stringify(delta)], { type: 'application/json' });
    const url = URL.createObjectURL(archivo);
    a.href = url;
    a.download = "grafo";
    a.click();
    URL.revokeObjectURL(url);
}
/* mover funciones */
function seleccionar(e){
    let {x,y}=canvas.getMousePosition(e)
    if(!SELECT_MOVE && !CTRL){
        let estado=ScanEstado(x,y)
        let salto=ScanSalto(x,y)
        if(estado){
            SELECT_MOVE=estado
            SELECT=estado
            resetSelect()
            estado.select=true
            paint()
        }else if(salto){
            SELECT_MOVE=salto
            SELECT=salto
            resetSelect()
            salto.select=true
            paint()
        }
    }
}
function ScanEstado(x,y){
    let estado=grupoEstados.map(e=>{
        if(distanceBetweenPoints({x,y},e)<=20){
           if(e instanceof Estado){
            return e
           }
        }
    })
    return estado.filter(e=>e)[0]
}
function ScanSalto(x,y){
    let salto=grupoSaltos.map(e=>{
        if(Math.sqrt((x-e.cx)**2+(y-e.cy)**2)<=5){
           if(e instanceof Salto){
            return e
           }
        }
    })
    return salto.filter(e=>e)[0]
}
function mover(e){
   if(SELECT_MOVE && !CTRL){
    let {x,y}=canvas.getMousePosition(e)
   if(SELECT_MOVE instanceof Estado){
    SELECT_MOVE.x=x
    SELECT_MOVE.y=y
   }else if(SELECT_MOVE instanceof Salto){
    SELECT_MOVE.cx=x
    SELECT_MOVE.cy=y
   }
    paint()
   }
}
/* fin mover funciones*/
// clases
class Estado{
    constructor(x,y,id,select=true){
        this.x=x
        this.y=y
        this.select=select
        this.id=id
        this.color="blue"
        this.isIni=false
        this.isFin=false
    }
    load(obj){
        Object.assign(this, obj)
    }
    paint(){
       
        if(this.isIni){
            canvas.line(this.x-20,this.y,this.x-30,this.y-10,2,this.select?this.color:"black")
            canvas.line(this.x-20,this.y,this.x-30,this.y+10,2,this.select?this.color:"black")
            canvas.ctx.lineWidth=1
        }
        canvas.circle(this.x,this.y,20,"white",true)
        canvas.circle(this.x,this.y,20,this.select?this.color:"black",false)
        if(this.isFin){
            canvas.circle(this.x,this.y,16,this.select?this.color:"black",false)
        }
        canvas.text("q"+this.id,this.x-10,this.y+5,12,this.select?"blue":"black")
    }
}

class Salto{
    constructor(estado,xf,yf,id,value="",select=false){
        this.estadoI=estado
        this.estadoF=undefined
        this.select=select
        this.value=value
        this.cx=undefined
        this.cy=undefined
        this.xf=xf
        this.yf=yf
        this.id=id

    }
    load(obj){
        Object.assign(this, obj)
    }
    paint(){
        let x=this.estadoI.x;
        let y=this.estadoI.y;
        if(this.estadoF!=undefined){
            if(this.estadoF.id==this.estadoI.id){
                this.xf=this.estadoF.x+2
                this.yf=this.estadoF.y+2
            }else{
                this.xf=this.estadoF.x
                this.yf=this.estadoF.y
            }
            
        }
        let xf=this.xf;
        let yf=this.yf;
        if(this.estadoF == undefined || (this.cx== undefined || this.cy== undefined)){
            this.cx=(x+(xf-x)/2)+1;
            this.cy=(y+(yf-y)/2)+1;
        }
           
        
        
        let cx=this.cx;
        let cy=this.cy;

        
        let pintarArc=()=>{

            canvas.circle(cx,cy,5,this.select?"blue":"black",true)
            let resultadoE=solveEquations([
                        [x,y,1],
                        [xf,yf,1],
                        [cx,cy,1]
                        ],
                        [-Math.pow(x,2)-Math.pow(y,2),
                        -Math.pow(xf,2)-Math.pow(yf,2),
                        -Math.pow(cx,2)-Math.pow(cy,2)])

            let [c,d,e]=resultadoE
            let h=-c/2
            let k=-d/2
            let r=Math.sqrt(-e+Math.pow(h,2)+Math.pow(k,2))
            
            
            let calcularAnguloCuadrante=(x,y)=>{
                let a=Math.atan((y-k)/(x-h))
                if((x<=h && y<=k) || (x<h&& y>=k)){
                    a=Math.PI+a
                }else if(y<k){
                    a=2*Math.PI+a
                }
                return a
            }
            let a1=calcularAnguloCuadrante(x,y)
            let a2=calcularAnguloCuadrante(xf,yf)

            let m= (y-yf)/(x-xf)
            let fy= (cx-x)*m+y;


            let [p1,p2]=intersectionCircles(h,k,r,xf,yf,20)
            let xi,yi

            if(x<xf){// 1 4
                if(fy<cy){ //  4
                    canvas.arc(h,k,r,a1,a2,this.select?"blue":"black");
                    [xi,yi]=[p1.x,p1.y]
                }else{ // 1
                   canvas.arc(h,k,r,a2,a1,this.select?"blue":"black");
                   [xi,yi]=[p2.x,p2.y]
                }
            }else{// 2 3
                if(fy>cy){//2
                    canvas.arc(h,k,r,a1,a2,this.select?"blue":"black");
                    [xi,yi]=[p1.x,p1.y]
                }else{//3
                   canvas.arc(h,k,r,a2,a1,this.select?"blue":"black");
                   [xi,yi]=[p2.x,p2.y]
                }
                
            }

                
            let angf=Math.atan((yf-yi)/((xf-xi)+0.1))
            if(xi>=xf){
                xi=xi+9*Math.cos(angf)
                yi=yi+9*Math.sin(angf)
            }else{
                xi=xi-9*Math.cos(angf)
                yi=yi-9*Math.sin(angf)
            }
            canvas.polygon(xi,yi,3,10,(xf-xi>0)?toGrad(angf):toGrad(angf)+180,true)

            if(!this.estadoF){
                canvas.line(x,y,xf,yf,2,this.select?"blue":"black")
            }
            let aux=Math.atan(m)
            if(aux>0.5)aux=-20
            canvas.text(this.value=="/l"?"λ":this.value=="/e"?"ϵ":this.value,cx+10+aux,
                    cy-10+aux,12,this.select?"blue":"black")


            
        }
      
    /**-------------------------------------------------- */
    
    pintarArc();

    }
}




