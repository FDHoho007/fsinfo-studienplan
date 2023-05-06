function addDraggable(element) {

    if (element.className.includes("spacer"))
        return;

    element.onmousedown = function (event) {

        if (event.button === 0) {
            let dragging = false;
            let shiftX = event.clientX - element.getBoundingClientRect().left;
            let shiftY = event.clientY - element.getBoundingClientRect().top;
            let origPos = {x: event.clientX, y: event.clientY};


            //document.body.append(element);


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

function pruneModules(){

}

function initAllDragables() {
    let elements = document.getElementsByClassName("module");
    for (let e of elements) {
        addDraggable(e);
    }
}