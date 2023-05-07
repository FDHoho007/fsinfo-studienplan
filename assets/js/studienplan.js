function load(data_as_csv) {
    document.getElementById("selection").style.display = "none";
    let data = csv_to_data(data_as_csv);

    let main = document.getElementById("studienplan");
    main.style.display = "";
    while (main.children.length > 1)
        main.children[0].remove();

    let width = Math.max(...data.map(i => i.length));
    let i = 1;
    for (let row of data) {
        let div_t = document.createElement("div");
        div_t.classList.add("title");
        main.appendChild(div_t);
        let div_r = document.createElement("div");
        div_r.classList.add("semester");
        let ects_sum = 0;
        for (let mod of row) {
            let div_m = document.createElement("div");
            div_m.classList.add("module");
            if (mod == null) {
                div_m.classList.add("spacer");
            } else {
                for (let key in mod)
                    div_m.setAttribute(key, mod[key]);
                div_m.appendChild(document.createElement("div"));
                updateModule(div_m);
                div_m.oncontextmenu = () => {
                    edit(div_m);
                    return false;
                }
                ects_sum += parseInt(mod.ects);
            }
            div_r.appendChild(div_m);
        }
        for (let i = row.length; i < width; i++) {
            let div_s = document.createElement("div");
            div_s.classList.add("module");
            div_s.classList.add("spacer");
            div_r.appendChild(div_s);
        }
        main.appendChild(div_r);
        div_t.innerHTML = i++ + ". Semester (" + ects_sum + ")<hr>";
    }
    document.getElementById("semesterCounter").value = --i;

    let buttonBar = document.createElement("div");
    buttonBar.id = "buttonBar";
    main.parentElement.appendChild(buttonBar);

    // Bottom Buttons
    let back_button = document.createElement("button");
    back_button.innerText = "Zurück";
    back_button.onclick = () => location.reload();
    buttonBar.appendChild(back_button);
    let button = document.createElement("button");
    button.innerText = "Als Datei speichern";
    button.onclick = () => download(save(), "studienplan.csv", "text/csv");
    buttonBar.appendChild(button);
    initAllDragables();
}

function save() {
    let main = document.getElementById("studienplan");
    let data = [];

    for (let r of main.children) {
        let row = [];
        for (let m of r.children) {
            if (m.classList.contains("spacer"))
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

function addSemester() {
    let main = document.getElementById("studienplan");
    let div_t = document.createElement("div");
    div_t.classList.add("title");
    div_t.innerHTML = document.getElementsByClassName("title").length
        + 1 + ". Semester (" + 0 + ")<hr>";
    main.appendChild(div_t);

    let div_r = document.createElement("div");
    div_r.classList.add("semester");
    main.appendChild(div_r);

    pruneModules();
}

function removeSemester() {
    let main = document.getElementById("studienplan");
    main.removeChild(main.lastChild);
    main.removeChild(main.lastChild);
}

function updateSemesterECTS() {
    let i = 1;
    for (let title of document.querySelectorAll("#studienplan .title")) {
        let ects_sum = 0;
        for (let mod of title.nextElementSibling.querySelectorAll(".module:not(.spacer)"))
            ects_sum += parseInt(mod.getAttribute("ects"));
        title.innerHTML = i++ + ". Semester (" + ects_sum + ")<hr>";
    }
}

function updateModule(e) {
    let name = e.getAttribute("name");
    if (isStateCompleted(name)) {
        e.style.background = "darkgray";
        e.style.color = "white";
        e.querySelector("div").style.textDecoration = "line-through";
    } else {
        e.style.background = e.getAttribute("color");
        if (get_luma(e.getAttribute("color")) > 145)
            e.style.color = "black";
        e.querySelector("div").style.textDecoration = "";
    }
    e.querySelector("div").innerText = getModuleName(name) + " (" + e.getAttribute("ects") + ")";
}

function isStateCompleted(name) {
    return name.startsWith("~") && name.endsWith("~");
}

function getModuleName(name) {
    if (isStateCompleted(name))
        return name.substring(1, name.length - 1);
    return name;
}

function changeState(e) {
    let name = e.getAttribute("name");
    if (isStateCompleted(name))
        e.setAttribute("name", name.substring(1, name.length - 1));
    else
        e.setAttribute("name", "~" + name + "~")
    updateModule(e);
}

function edit(e) {
    Swal.fire({
        title: "Modul bearbeiten",
        html: "<input type=\"text\" id=\"name\" class=\"swal2-input\" placeholder=\"Name des Moduls\" style=\"width: 65%;\" value=\"" + getModuleName(e.getAttribute("name")) + "\">\n" +
            "<input type=\"number\" id=\"ects\" class=\"swal2-input\" placeholder=\"ECTS Punkte\" min=1 max=180 style=\"width: 65%;\" value=\"" + e.getAttribute("ects") + "\">\n" +
            "<input type=\"color\" id=\"color\" class=\"swal2-input\" placeholder= \"Farbe des Moduls\" style=\"width: 80px;\" value=\"" + e.getAttribute("color") + "\">",
        showCancelButton: true,
        focusConfirm: true,
        confirmButtonText: "Speichern",
        cancelButtonText: "Abbrechen",
        preConfirm: () => {
            const name = Swal.getPopup().querySelector("#name").value;
            const ects = Swal.getPopup().querySelector("#ects").value;
            const color = Swal.getPopup().querySelector("#color").value;
            if (!name || !ects) {
                Swal.showValidationMessage("Bitte alles ausfüllen");
            }
            return {name: name, ects: ects, color: color};
        }
    }).then((result) => {
        if (result.value) {
            e.setAttribute("name", isStateCompleted(e.getAttribute("name")) ? "~" + result.value.name + "~" : result.value.name);
            e.setAttribute("ects", result.value.ects);
            e.setAttribute("color", result.value.color);
            updateModule(e);
            updateSemesterECTS();
        }
    });
}