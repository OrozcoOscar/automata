let canvas = new Canvas()
canvas.size(700, 500)
// variables
let S = null //Estado inicial definido
let F = []
let delta = []
let valoresSaltos = []
//--------------------------------
let grupoEstados = []
let grupoSaltos = []
let idEstados = 0
let idSaltos = 0
let SELECT_MOVE = null
let SELECT = null
let CTRL = false
let SALTO = null
let initEvent = true //estado para saber si ya se presiono la tecla
// eventos
canvas.event("dblclick", createEstado)
/* MOVER */
canvas.event("mousedown", seleccionar)
canvas.event("mousemove", mover)
canvas.event("mouseup", () => {
    if (!CTRL) SELECT_MOVE = null
})
/* FIN MOVER */
window.addEventListener("keydown", initSalto)
window.addEventListener("keyup", (e) => {
    if (SELECT) {
        CTRL = false
        initEvent = true
        SELECT.color = "blue"
        if (SALTO instanceof Salto) {
            let est = ScanEstado(SALTO.xf, SALTO.yf)
            if (est instanceof Estado) {
                SALTO.estadoF = est
                SALTO.value = prompt("Ingrese el valor del salto")
                grupoSaltos.push(SALTO)
            }
        }

        SALTO = null
        paint()
        try {
            canvas.removeEvent("mousemove", createSalto)
        } catch (error) {}
    }
})
// funciones

function initSalto(e) {

    if ((e.key == "Control") && initEvent) {
        CTRL = true
        if (initEvent && SELECT) {
            initEvent = false
            SELECT_MOVE = null
            SELECT.color = "green"
            canvas.event("mousemove", createSalto)

        }
    } else if (e.key == "Shift") {
        if (SELECT instanceof Estado) {
            SELECT.isIni = SELECT.isIni ? false : true
            if (S) {
                S.isIni = false
            }
            if (SELECT.isIni) {
                S = SELECT
            } else {
                S = null
            }


        }
    } else if (e.key == "f") {
        if (SELECT instanceof Estado) {
            if (!F.find(e => e.id == SELECT.id)) {
                SELECT.isFin = SELECT.isFin ? false : true
                F.push(SELECT)
            } else if (F.length == 0) {
                SELECT.isFin = SELECT.isFin ? false : true
                F.push(SELECT)
            } else {
                SELECT.isFin = false
                let po = F.findIndex(e => e.id == SELECT.id)
                F.splice(po, 1)
            }

            document.querySelector(".estadoF").innerHTML = `[${F.map(e => "q" + e.id).toString()
                }]`
        }
    } else if (e.key == "Backspace") {
        // if(confirm("¿Desea eliminar este elemento?")){
        //     if(SELECT instanceof Estado){
        //         let po=grupoEstados.findIndex(e=>e.id==SELECT.id)
        //         grupoEstados.splice(po,1)
        //     }else if(SELECT instanceof Salto){
        //         let po=grupoSaltos.findIndex(e=>e.id==SELECT.id)
        //         grupoSaltos.splice(po,1)

        //     }

        // }
    }
    paint()
}
function createSalto(e) {

    let { x, y } = canvas.getMousePosition(e)
    if (!SALTO) {
        if (SELECT instanceof Estado) {
            SALTO = new Salto(SELECT, x, y, idSaltos, "");
        }
    } else {
        SALTO.xf = x
        SALTO.yf = y
        paint()
        SALTO.paint()
    }


}
function createEstado(e) {
    let { x, y } = canvas.getMousePosition(e)
    resetSelect().then(e => {
        canvas.ctx.lineWidth = 2
        let n = new Estado(x, y, idEstados)
        grupoEstados.push(n)
        SELECT = n
        n.paint();
    })

}
async function resetSelect() {
    canvas.ctx.lineWidth = 1
    grupoSaltos.forEach(e => e.select = false);
    grupoEstados.forEach(e => e.select = false);
    paint()
}
function createMatrizDelta() {
    /// -------- limpia residuos -----
    F = []
    S = null
    grupoSaltos.forEach((s, i) => {
        let estF = false
        let estI = false
        grupoEstados.forEach(e => {
            if (s.estadoF.id == e.id) {
                estF = true
            }
            if (s.estadoI.id == e.id) {
                estI = true
            }
        })
        if (!estF || !estI) {
            grupoSaltos.splice(i, 1)
        }

    })

    grupoEstados.map(e => {
        if (e.isFin) {
            if (F.length == 0) {
                F.push(e)
            } else if (!F.find(es => es.id == e.id)) {
                F.push(e)
            }

        }
        if (e.isIni) S = e


    })
    //----- Extrae los valores de los saltos ---------
    valoresSaltos = []
    const uniqueValoresSaltos = new Set(valoresSaltos);
    
    grupoSaltos.forEach(e => {
      uniqueValoresSaltos.add(e.value);
    });

    valoresSaltos = Array.from(uniqueValoresSaltos);
    //------------ genera finalmente la matriz -------------
    grupoSaltos.sort((a, b) => a?.value?.localeCompare(b?.value))
    delta = []
    grupoEstados.forEach(e => {
        const relevantJumps = grupoSaltos.filter(s => e.id === s.estadoI.id);
        
        relevantJumps.forEach(s => {
          const relevantValue = valoresSaltos.find(v => v === s.value);
          
          if (relevantValue) {
            delta.push({
              estadoI: e,
              estadoF: s.estadoF,
              value: relevantValue
            });
          }
        });
      });
      
    pintarMatriz()
}
function pintarMatriz() {
    document.querySelector("table").innerHTML = ""
    document.querySelector("table").innerHTML += `<tr><th>Δ</th>${valoresSaltos.map(e => `<th>${e}</th>`).toString().replace(/,/g, "")
        }</tr>`
    delta.reverse()
    delta.forEach(e => {
        let r = `<td >q${e.estadoI.id}</td>` + valoresSaltos.map(v => {
            if (e.value == v) {
                return `<td>q${e.estadoF.id}</td>`
            } else {
                return `<td class="void">Ø</td>`
            }
        }).toString().replace(/,/g, "")
        document.querySelector("table").innerHTML += `<tr>${r}</tr>`
    })
    delta.reverse()
}
function paint() {
    canvas.clear()
    canvas.ctx.lineWidth = 1
    if (grupoEstados.length == 0) idEstados = 0
    grupoSaltos.forEach(e => e.paint());
    grupoEstados.forEach(e => e.paint());

    // document.querySelector(".estadoF").innerHTML = `[${F.map(e => "q" + e.id).toString()
    //     }]`
    // if (S) {
    //     document.querySelector(".estadoI").innerHTML = "q" + S.id
    // } else {
    //     document.querySelector(".estadoI").innerHTML = "no definido"
    // }

}
function save() {
    const a = document.createElement("a");
    const archivo = new Blob([JSON.stringify(delta)], { type: 'application/json' });
    const url = URL.createObjectURL(archivo);
    a.href = url;
    a.download = "grafo";
    a.click();
    URL.revokeObjectURL(url);
}
/* mover funciones */
function seleccionar(e) {
    if (SELECT_MOVE || CTRL) {
      return;
    }
  
    let { x, y } = canvas.getMousePosition(e);
    let estado = ScanEstado(x, y);
    let salto = ScanSalto(x, y);
  
    if (estado || salto) {
      SELECT_MOVE = estado || salto;
      SELECT = estado || salto;
      resetSelect();
      SELECT_MOVE.select = true;
      paint();
    }
}
  
function ScanEstado(x, y) {
    return grupoEstados.find(e => {
      return distanceBetweenPoints({ x, y }, e)  <= 20 && e instanceof Estado;
    });
  }
function ScanSalto(x, y) {
    return grupoSaltos.find(e => {
        return distanceBetweenPoints({ x, y }, {x:e.cx,y:e.cy})  <= 5 && e instanceof Salto;
      });
}
function mover(e) {
    if (SELECT_MOVE && !CTRL) {
        let { x, y } = canvas.getMousePosition(e)
        if (SELECT_MOVE instanceof Estado) {
            SELECT_MOVE.x = x
            SELECT_MOVE.y = y
        } else if (SELECT_MOVE instanceof Salto) {
            SELECT_MOVE.cx = x
            SELECT_MOVE.cy = y
        }
        paint()
    }
}
/* fin mover funciones*/
// clases
class Estado {
    constructor(x, y, id, select = true) {
        this.x = x
        this.y = y
        this.select = select
        this.id = id
        this.color = "blue"
        this.isIni = false
        this.isFin = false
        idEstados++
    }
    load(obj) {
        Object.assign(this, obj)
    }
    paint() {

        if (this.isIni) {
            canvas.line(this.x - 20, this.y, this.x - 30, this.y - 10, 2, this.select ? this.color : "black")
            canvas.line(this.x - 20, this.y, this.x - 30, this.y + 10, 2, this.select ? this.color : "black")
            canvas.ctx.lineWidth = 1
        }
        canvas.circle(this.x, this.y, 20, "white", true)
        canvas.circle(this.x, this.y, 20, this.select ? this.color : "black", false)
        if (this.isFin) {
            canvas.circle(this.x, this.y, 16, this.select ? this.color : "black", false)
        }
        canvas.text("q" + this.id, this.x - 10, this.y + 5, 12, this.select ? "blue" : "black")
    }
}

class Salto {
    constructor(estado, estadoF, xf, yf, id, value = "", select = false) {
        this.estadoI = estado
        this.estadoF = estadoF
        this.select = select
        this.value = value
        this.cx = undefined
        this.cy = undefined
        this.xf = xf
        this.yf = yf
        this.id = id
        this.visited=false
        idSaltos++

    }
    load(obj) {
        Object.assign(this, obj)
    }
    paint() {
        const x = this.estadoI.x;
        const y = this.estadoI.y;
        const xf = this.estadoF ? this.estadoF.x : x;
        const yf = this.estadoF ? this.estadoF.y : y;
        const cx = (x + xf) / 2 + 1;
        const cy = (y + yf) / 2 + 1;
    
        canvas.circle(cx, cy, 5, this.select ? "blue" : "black", true);
        canvas.line(x, y, xf, yf, 2, this.select ? "blue" : "black");
    
        const [c, d, e] = solveEquations([
            [x, y, 1],
            [xf, yf, 1],
            [cx, cy, 1]
        ], [
            -Math.pow(x, 2) - Math.pow(y, 2),
            -Math.pow(xf, 2) - Math.pow(yf, 2),
            -Math.pow(cx, 2) - Math.pow(cy, 2)
        ]);
    
        const h = -c / 2;
        const k = -d / 2;
        const r = Math.sqrt(-e + Math.pow(h, 2) + Math.pow(k, 2));
    
        const a1 = Math.atan2(y - k, x - h);
        const a2 = Math.atan2(yf - k, xf - h);
        const m = (y - yf) / (x - xf);
        const fy = (cx - x) * m + y;
        const [p1, p2] = intersectionCircles(h, k, r, xf, yf, 20);
        const [xi, yi] = (x < xf && fy < cy) || (x >= xf && fy >= cy) ? [p1.x, p1.y] : [p2.x, p2.y];
    
        const angf = Math.atan((yf - yi) / (xf - xi + 0.1));
        const triangleSize = 10; // Tamaño del triángulo
    
        const triangleX = xf - triangleSize * Math.cos(angf);
        const triangleY = yf - triangleSize * Math.sin(angf);
        const angleTriangle = Math.PI / 6; // Ángulo del triángulo (30 grados)
        const triangleX2 = triangleX + triangleSize * Math.cos(angf + angleTriangle);
        const triangleY2 = triangleY + triangleSize * Math.sin(angf + angleTriangle);
    
        canvas.polygon(xi, yi, 3, 10, triangleX2, triangleY2, true);
    
        const angleOffset = (xf - x >= 0) ? 0 : Math.PI;
        const textX = cx + 10 + 9 * Math.cos(angf + angleOffset);
        const textY = cy - 10 + 9 * Math.sin(angf + angleOffset);
    
        const value = (this.value == "/l") ? "λ" : (this.value == "/e") ? "ϵ" : this.value;
        canvas.text(value, textX, textY, 12, this.select ? "blue" : "black");
    }


    //version con arcos 
    // paint(){
    //     let x=this.estadoI.x;
    //     let y=this.estadoI.y;
    //     if(this.estadoF!=undefined){
    //         if(this.estadoF.id==this.estadoI.id){
    //             this.xf=this.estadoF.x+2
    //             this.yf=this.estadoF.y+2
    //         }else{
    //             this.xf=this.estadoF.x
    //             this.yf=this.estadoF.y
    //         }
            
    //     }
    //     let xf=this.xf;
    //     let yf=this.yf;
    //     if(this.estadoF == undefined || (this.cx== undefined || this.cy== undefined)){
    //         this.cx=(x+(xf-x)/2)+1;
    //         this.cy=(y+(yf-y)/2)+1;
    //     }
           
        
        
    //     let cx=this.cx;
    //     let cy=this.cy;

        
    //     let pintarArc=()=>{

    //         canvas.circle(cx,cy,5,this.select?"blue":"black",true)
    //         let resultadoE=solveEquations([
    //                     [x,y,1],
    //                     [xf,yf,1],
    //                     [cx,cy,1]
    //                     ],
    //                     [-Math.pow(x,2)-Math.pow(y,2),
    //                     -Math.pow(xf,2)-Math.pow(yf,2),
    //                     -Math.pow(cx,2)-Math.pow(cy,2)])

    //         let [c,d,e]=resultadoE
    //         let h=-c/2
    //         let k=-d/2
    //         let r=Math.sqrt(-e+Math.pow(h,2)+Math.pow(k,2))
            
            
    //         let calcularAnguloCuadrante=(x,y)=>{
    //             let a=Math.atan((y-k)/(x-h))
    //             if((x<=h && y<=k) || (x<h&& y>=k)){
    //                 a=Math.PI+a
    //             }else if(y<k){
    //                 a=2*Math.PI+a
    //             }
    //             return a
    //         }
    //         let a1=calcularAnguloCuadrante(x,y)
    //         let a2=calcularAnguloCuadrante(xf,yf)

    //         let m= (y-yf)/(x-xf)
    //         let fy= (cx-x)*m+y;


    //         let [p1,p2]=intersectionCircles(h,k,r,xf,yf,20)
    //         let xi,yi

    //         if(x<xf){// 1 4
    //             if(fy<cy){ //  4
    //                 canvas.arc(h,k,r,a1,a2,this.select?"blue":"black");
    //                 [xi,yi]=[p1.x,p1.y]
    //             }else{ // 1
    //                canvas.arc(h,k,r,a2,a1,this.select?"blue":"black");
    //                [xi,yi]=[p2.x,p2.y]
    //             }
    //         }else{// 2 3
    //             if(fy>cy){//2
    //                 canvas.arc(h,k,r,a1,a2,this.select?"blue":"black");
    //                 [xi,yi]=[p1.x,p1.y]
    //             }else{//3
    //                canvas.arc(h,k,r,a2,a1,this.select?"blue":"black");
    //                [xi,yi]=[p2.x,p2.y]
    //             }
                
    //         }

                
    //         let angf=Math.atan((yf-yi)/((xf-xi)+0.1))
    //         if(xi>=xf){
    //             xi=xi+9*Math.cos(angf)
    //             yi=yi+9*Math.sin(angf)
    //         }else{
    //             xi=xi-9*Math.cos(angf)
    //             yi=yi-9*Math.sin(angf)
    //         }
    //         canvas.polygon(xi,yi,3,10,(xf-xi>0)?toGrad(angf):toGrad(angf)+180,"",true)

    //         if(!this.estadoF){
    //             canvas.line(x,y,xf,yf,2,this.select?"blue":"black")
    //         }
    //         let aux=Math.atan(m)
    //         if(aux>0.5)aux=-20
    //         canvas.text(this.value=="/l"?"λ":this.value=="/e"?"ϵ":this.value,cx+10+aux,
    //                 cy-10+aux,12,this.select?"blue":"black")


            
    //     }
      
    // /**-------------------------------------------------- */
    
    // pintarArc();

    // }
    
    
}
