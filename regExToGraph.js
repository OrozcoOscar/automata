let regexInput = $("#regex")

function separarNum(exp) {
    for (let i = 0; i < exp.length; i++) {
        if (exp.length > 100) break
        if (exp[i] && exp[i + 1] && exp[i].match(/\w/) && exp[i + 1].match(/\w/)) {
            let a, b
            a = exp.slice(0, i + 1)
            b = exp.slice(i + 1, exp.length)
            exp = a + "." + b
        } else if (exp[i] && exp[i + 1] && exp[i].match(/\w|\*|\)/) && exp[i + 1].match(/\(/)) {
            let a, b
            a = exp.slice(0, i + 1)
            b = exp.slice(i + 1, exp.length)
            exp = a + "." + b
        } else if (exp[i] && exp[i + 1] && exp[i].match(/\*|\)|\★/) && exp[i + 1].match(/\w/)) {
            let a, b
            a = exp.slice(0, i + 1)
            b = exp.slice(i + 1, exp.length)
            exp = a + "." + b
        }

    }
    return exp
}
function poOperador(cadena) {
    let searchParentesis = 0
    for (let i = 0; i < cadena.length; i++) {
        if (cadena[i] == '(') searchParentesis++;
        if (cadena[i] == ')') searchParentesis--;
        if (searchParentesis == 0) {
            if (cadena[i] == '|') return i;
            if (cadena[i] == '.') return i;
        }
    }
    for (let i = 0; i < cadena.length; i++) {
        if (cadena[i] == '(') searchParentesis++;
        if (cadena[i] == ')') searchParentesis--;
        if (searchParentesis == 0) {
            if (cadena[i] == '*') return i;
            if (cadena[i] == '★') return i;
            
        }
    }

    return -1
}
let i = 0
let arbol
function resetVisited() {
    grupoSaltos.forEach(e=>e.visited=false)
}
function getStateFinally(salto) {
   let s=grupoSaltos.find(salt=>{
    if(salt.estadoI.id==salto?.estadoF.id && salt.id != salto.id && !salt.visited){
        salt.visited=true
        return salt
    }
   })
   if(!s){
    return salto
   }
   return getStateFinally(s)
}
function get() {
    // console.clear()
    i = 0
    grupoEstados=[]
    grupoSaltos=[]
    idEstados=0
    idSaltos=0
    let vectorReg = regexInput.val()
    vectorReg=vectorReg.replace(")*",")★")
    vectorReg = separarNum(vectorReg)
    console.log(vectorReg)
    arbol = recursiva(vectorReg)
    grupoEstados[grupoEstados.length-1].isFin=true
    console.log(arbol,grupoSaltos)
    paint()

}
//\([^()]*\) encuentra los parentesis mas internos
function split(cad) {
    if(cad.match(/^\([\w\|\.\*\)\(★\+]*\)$/)){
        cad=cad.replace(/^\(/,"").replace(/\)$/,"")
        if(cad.match(/^\([\w\|\.\*\)\(★\+]*\)$/))return split(cad)
    }
    console.log(cad)
    let pos = poOperador(cad)
    console.log(cad,pos)
    if (pos > -1) {
        let a, b
        a = cad.slice(0, pos)
        b = cad.slice(pos + 1, cad.length)
        return { pos: cad[pos], data: [a, b].filter(Boolean) }
    } else {
        return { pos: undefined, data: [cad].filter(Boolean) }
    }

}

function createGrafoReg(data){
    let operador=data?.pos
    resetVisited()
    if (operador == ".") {
        let salto = new Salto(getStateFinally(data.data[0]).estadoF,data.data[1].estadoI, 200, 200, idSaltos, "/l")
        grupoSaltos.push(salto)
        
        return data.data[0]
    }if (operador == "*") {
        
        let salto = new Salto(data.data[0].estadoF,data.data[0].estadoI, 200, 200, idSaltos, "/l")
        grupoSaltos.push(salto)
        
        return salto
    }if (operador == "|") {
        let estado = new Estado(200, 200, idEstados)
        estado.isIni=true
        let estado2 = new Estado(200, 200, idEstados)
        let salto = new Salto(estado,data.data[0].estadoI, 200, 200, idSaltos, "/l")
        
        let salto2 = new Salto(estado,data.data[1].estadoI, 200, 200, idSaltos, "/l")

        let salto3 = new Salto(getStateFinally(data.data[0]).estadoF,estado2, 200, 200, idSaltos, "/l")
        
        let salto4 = new Salto(getStateFinally(data.data[1]).estadoF,estado2, 200, 200, idSaltos, "/l")
        
        grupoSaltos.push(salto,salto2,salto3,salto4)
        grupoEstados.push(estado,estado2)

        
        return salto
    }if (operador == "★") {
        let est=getStateFinally(data.data[0])
        data.data[0].estadoI.isIni=true
        data.data[0].estadoI.isFin=true
        let salto = new Salto(est.estadoF,data.data[0].estadoI, 200, 200, idSaltos, "/l")
        grupoSaltos.push(salto)
        
        return salto
    }
    else if (data instanceof Salto === false && !operador) {
        // console.log(data)
        let estadoI, estadoF
            estadoI = new Estado(200, 200, idEstados,idEstados==0)

            estadoF = new Estado(200, 200, idEstados)

            let salto =new Salto(estadoI, estadoF, 200, 200, idSaltos, data?.data[0])
            
            grupoSaltos.push(salto)
            grupoEstados.push(estadoI, estadoF)
        return salto
    }
    return data
}

function recursiva(cad) {
    if (i == 1000) return
    i++
    let new_cad = split(cad)
    // console.log(new_cad)
    if(!new_cad?.pos)return createGrafoReg(new_cad)

    new_cad.data = new_cad.data.map(e => {
        let data = recursiva(e)
        // console.log(data)
        return createGrafoReg(data)
    })
    // console.log(new_cad)
    return createGrafoReg(new_cad)
}

