document.getElementById("file-selection").addEventListener('change', function() {
    let fr = new FileReader();
    fr.onload = () => load(fr.result)
    fr.readAsText(this.files[0]);
})