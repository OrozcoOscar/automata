function load(){
    fetch("./grafo.json").then(e=>e.json()).then(g=>{
        grupoEstados=[]
        grupoSaltos=[]
        F=[]
        S=null
        valoresSaltos=[]
        idEstados=0
        idSaltos=0
        g.map(e=>{
            let n=[new Estado(),new Estado()]
            n[0].load(e.estadoI)
            n[1].load(e.estadoF)
            if(grupoEstados.length==0){
                grupoEstados.push(...n)
            }
            else if(!grupoEstados.find(e=>e.id==n[0].id)){
                grupoEstados.push(n[0])
            }else if(!grupoEstados.find(e=>e.id==n[1].id)){
                grupoEstados.push(n[1])
            }
        })
        grupoEstados.sort((a, b) => a.id - b.id)
        grupoEstados.reverse()
        idEstados=grupoEstados[0].id+1 ||0
        g.map(e=>{
            let n=new Salto()
            n.load({estadoI:grupoEstados.find(s=>s.id==e.estadoI.id),estadoF:grupoEstados.find(s=>s.id==e.estadoF.id),value:e.value,id:idSaltos})
            idSaltos++;
            if(grupoSaltos.length==0){
                grupoSaltos.push(n)
            }
            else if(!grupoSaltos.find(e=>e.id==n.id)){
                grupoSaltos.push(n)
            }
        })
        createMatrizDelta()
        paint()
        
    })
}