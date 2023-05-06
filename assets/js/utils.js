function get_luma(hex_color) {
    hex_color = hex_color.replace("#", "");
    let rgb = parseInt(hex_color, 16);   // convert rrggbb to decimal
    let r = (rgb >> 16) & 0xff;  // extract red
    let g = (rgb >>  8) & 0xff;  // extract green
    let b = (rgb >>  0) & 0xff;  // extract blue

    return 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
}

function csv_to_data(csv) {
    let data = [];
    for(let r of csv.split("\n")) {
        if(r.trim() === "")
            continue;
        let row = [];
        for(let m of r.split(";")) {
            if(m.trim() === "")
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

function download(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}