function addDraggable(element) {
    if (element.className.includes("spacer"))
        return;

    element.onmousedown = function (event) {
        if (event.button === 0) {
            let dragging = false;
            let shiftX = event.clientX - element.getBoundingClientRect().left;
            let shiftY = event.clientY - element.getBoundingClientRect().top;
            let origPos = {x: event.clientX, y: event.clientY};

            // moves the element at (pageX, pageY) coordinates
            // taking initial shifts into account
            function moveAt(pageX, pageY) {
                element.style.left = pageX - shiftX + 'px';
                element.style.top = pageY - shiftY + 'px';
            }

            function onMouseMove(event) {
                if (dragging)
                    moveAt(event.pageX, event.pageY);
                else if (Math.abs(origPos.x - event.clientX) + Math.abs(origPos.y - event.clientY) > 20) {
                    dragging = true;
                    if (element.classList.contains("new")) {
                        let newNew = element.cloneNode(true);
                        addDraggable(newNew);
                        element.parentElement.insertBefore(newNew, element);
                        element.oncontextmenu = () => {
                            edit(element);
                            return false;
                        }
                    } else
                        element.parentElement.insertBefore(getSpacer(), element);
                    element.style.position = 'absolute';
                    element.style.zIndex = 1000;
                    moveAt(event.pageX, event.pageY);
                }
            }

            // move the element on mousemove
            document.addEventListener('mousemove', onMouseMove);

            // drop the element, remove unneeded handlers
            element.onmouseup = function (event) {
                document.removeEventListener('mousemove', onMouseMove);
                element.onmouseup = null;
                if (dragging) {
                    fixModule(element, event);
                    pruneModules();
                    updateSemesterECTS();
                } else {
                    changeState(element);
                }
            };
        }

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
        if (element.id === "trash")
            module.remove();
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

    if (found === undefined) {
        if (semester !== undefined && semester !== module.parentElement)
            semester.appendChild(module);
        else {
            if (module.classList.contains("new"))
                module.remove();
            else
                module.previousElementSibling.remove();
        }
    } else {
        if (!found.classList.contains("new"))
            if (found.classList.contains("spacer")) {
                swapNodes(module, found);
                found.remove();
            } else {
                found.parentElement.insertBefore(module, found);
            }
        else {
            if (module.classList.contains("new"))
                module.remove();
            else
                module.previousElementSibling.remove();
        }
    }
    if(module.classList.contains("new"))
        module.classList.remove("new");
    module.style.position = '';
    module.style.zIndex = '';
}

function getRowSize() {
    let maxRowCount = 0;
    for (let element of document.getElementsByClassName("semester")) {
        let children = element.children;
        let count = 0;
        for (let i = children.length - 1; i >= 0; i--) {
            if (count === 0 && children.item(i).className.includes("spacer"))
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
            row.appendChild(getSpacer());
        }
    }
}

function getSpacer() {
    let spacer = document.createElement("div");
    spacer.className = "module spacer";
    return spacer;
}

function getIndexInParent(module) {
    for (let i = 0; i < module.parentElement.children.length; i++) {
        if (module === module.parentElement.children.item(i))
            return i;
    }
    return 0;
}

// https://itecnote.com/tecnote/javascript-swap-two-html-elements-and-preserve-event-listeners-on-them/
function swapNodes(obj1, obj2) {
    // save the location of obj2
    var parent2 = obj2.parentNode;
    var next2 = obj2.nextSibling;
    // special case for obj1 is the next sibling of obj2
    if (next2 === obj1) {
        // just put obj1 before obj2
        parent2.insertBefore(obj1, obj2);
    } else {
        // insert obj2 right before obj1
        obj1.parentNode.insertBefore(obj2, obj1);

        // now insert obj1 where obj2 was
        if (next2) {
            // if there was an element after obj2, then insert obj1 right before that
            parent2.insertBefore(obj1, next2);
        } else {
            // otherwise, just append as last child
            parent2.appendChild(obj1);
        }
    }
}

function initAllDragables() {
    let elements = document.getElementsByClassName("module");
    for (let e of elements) {
        addDraggable(e);
    }
}