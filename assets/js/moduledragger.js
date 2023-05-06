function addDraggable(element) {

    if (element.className.includes("spacer"))
        return;

    element.onmousedown = function (event) {

        let shiftX = event.clientX - element.getBoundingClientRect().left;
        let shiftY = event.clientY - element.getBoundingClientRect().top;

        element.style.position = 'absolute';
        element.style.zIndex = 1000;
        //document.body.append(element);

        moveAt(event.pageX, event.pageY);

        // moves the element at (pageX, pageY) coordinates
        // taking initial shifts into account
        function moveAt(pageX, pageY) {
            element.style.left = pageX - shiftX + 'px';
            element.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        // move the element on mousemove
        document.addEventListener('mousemove', onMouseMove);

        // drop the element, remove unneeded handlers
        element.onmouseup = function (event) {
            document.removeEventListener('mousemove', onMouseMove);
            fixModule(element, event);
            pruneModules();
            element.onmouseup = null;
        };

    };

    element.ondragstart = function () {
        return false;
    };

}

/**
 * Snaps Module to the nearest location
 * @param module
 * @param event
 */
function fixModule(module, event) {
    let elements = document.elementsFromPoint(event.clientX, event.clientY);

    let semester;
    let found;

    for (let element of elements) {
        if (element.className.includes("module")) {
            if (element === module) {
                continue;
            }
            found = element;
            break;
        }
        if (element.className.includes("semester")) {
            semester = element;
        }
    }

    //
    if (found === undefined) {
        if (semester !== undefined)
            semester.insertBefore(module, semester.lastChild);
    } else {
        found.parentElement.insertBefore(module, found);
    }
    module.style.position = '';
    module.style.zIndex = '';
}

function getRowSize() {
    let maxRowCount = 0;
    for (let element of document.getElementsByClassName("semester")) {
        let children = element.children;
        let count = 0;
        for (let i = children.length - 1; i >= 0; i--) {
            if (count == 0 && children.item(i).className.includes("spacer"))
                continue;
            count++;
        }
        if (maxRowCount < count) {
            maxRowCount = count;
        }
    }
    return maxRowCount;
}

function pruneModules() {

    let rowSize = getRowSize();
    let rows = document.getElementsByClassName("semester");
    for (let row of rows) {
        while (row.children.length > rowSize) {
            row.removeChild(row.lastChild);
        }
        while (row.children.length < rowSize) {
            let spacer = document.createElement("div");
            spacer.className= "module spacer";
            row.appendChild(spacer);
        }
    }

    console.log(rowSize);

}

function initAllDragables() {
    let elements = document.getElementsByClassName("module");
    for (let e of elements) {
        addDraggable(e);
    }
}