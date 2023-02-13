function csv_to_data(csv) {
    let data = [];
    for(let r of csv.split("\n")) {
        if(r.trim() == "")
            continue;
        let row = [];
        for(let m of r.split(";")) {
            if(m.trim() == "")
                row.push(null);
            else {
                let mod = {};
                let md = m.split(",");
                mod.name = md[0];
                mod.ects = md[1];
                mod.color = md[2];
                row.push(mod);
            }
        }
        data.push(row);
    }
    return data;
}

function data_to_csv(data) {
    let rows = [];
    for(let r of data) {
        let modules = [];
        for(let m of r) {
            if(m == null)
                modules.push("");
            else
                modules.push([m.name,m.ects,m.color].join(","));
        }
        rows.push(modules.join(";"));
    }
    return rows.join("\n");
}

function load(data_as_csv) {
    document.getElementById("selection").style.display = "none";
    let data = csv_to_data(data_as_csv);

    let main = document.getElementById("studienplan");
    main.style.display = "";
    while(main.children.length > 0)
        main.children[0].remove();
    
    let width = Math.max(...data.map(i => i.length));
    for(let row of data) {
        let div_r = document.createElement("div");
        div_r.classList.add("semester");
        let ects_sum = 0;
        for(let mod of row) {
            let div_m = document.createElement("div");
            div_m.classList.add("module");
            if(mod == null) {
                div_m.classList.add("spacer");
            } else {
                for(let key in mod)
                    div_m.setAttribute(key, mod[key]);
                div_m.style.background = mod.color;
                let div_t = document.createElement("div");
                div_t.innerText = mod.name + " (" + mod.ects + ")";
                div_m.appendChild(div_t);
                ects_sum += parseInt(mod.ects);
            }
            div_r.appendChild(div_m);
        }
        for(let i = row.length; i<width; i++) {
            let div_s = document.createElement("div");
            div_s.classList.add("module");
            div_s.classList.add("spacer");
            div_r.appendChild(div_s);
        }
        console.log(ects_sum);
        main.appendChild(div_r);
    }
    let button = document.createElement("button");
    button.innerText = "Als Datei speichern";
    button.onclick = save;
    main.appendChild(button);
}

function save() {
    let main = document.getElementById("studienplan");
    let data = [];

    for(let r of main.children) {
        let row = [];
        for(let m of r.children) {
            if(m.classList.contains("spacer"))
                row.push(null);
            else {
                let mod = {};
                mod.name = m.getAttribute("name");
                mod.ects = m.getAttribute("ects");
                mod.color = m.getAttribute("color");
                row.push(mod);
            }
        }
        data.push(row);
    }

    return data_to_csv(data);
}