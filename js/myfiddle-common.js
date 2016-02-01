var noApiStorageMsg = 'Il tuo browser non supporta le Storage API.\nAggiornalo ad una versione pi� recente!';
var storageApiOk = false;

var jsDaIncludere = [];
var cssDaIncludere = [];

/**
* Crea gli elementi 'option' per popolare il select della scelta dei file da includere (js o css)
*/
function caricaListaFileDaIncludere() {
    if (getObject('extJS')) {
        jsDaIncludere = getObject('extJS');
    } else {
        storeObject('extJS', jsDaIncludere);
    }

    if (getObject('extCSS')) {
        cssDaIncludere = getObject('extCSS');
    } else {
        storeObject('extCSS', cssDaIncludere);
    }
}

/**
* Controlla se le API Storage sono disponibili nel browser
*/
function checkLocalStorage(){
    if (typeof (Storage)) {
        storageApiOk = true;
    } else {
        storageApiOk = false;
        alert(noApiStorageMsg);
    }
}

/**
* Salva dati nel browser per riutilizzarli nella pagina run.html
*/
function storeData() {
    html = editor_html.getValue();
    css = editor_css.getValue();
    js = editor_js.getValue();
    timestamp = new Date().getTime();
    jq = $('#usa_jquery').prop('checked');

    clearContenutiInStorage();

    storeItem('html', html);
    storeItem('css', css);
    storeItem('js', js);
    storeItem('jq', jq);
}

/**
* Salva valori in 'localStorage' associati ad un nome
*/
function storeItem(nome, valore) {
    if (storageApiOk) {
        localStorage.setItem(nome, valore);
    } else {
        alert(noApiStorageMsg);
    }
}

/**
* Salva oggetti JSON in 'localStorage' associati ad un nome
*/
function storeObject(nome, oggetto) {
    if (storageApiOk) {
        localStorage.setItem(nome, JSON.stringify(oggetto));
    } else {
        alert(noApiStorageMsg);
    }
}

/**
* Restituisce i valori di 'localStorage' associati ad un nome, o false se non li trova
*/
function getItem(nome) {
    if (storageApiOk) {
        var item = localStorage.getItem(nome);
        if (item) {
            return item;
        } else {
            console.log('Item "' + nome + '" non presente in localStorage');
            return false;
        }
    } else {
        alert(noApiStorageMsg);
    }
}

/**
* Restituisce un oggetto presente in 'localStorage' precedentemente salvato con storeObject, o false se non lo trova
*/
function getObject(nome) {
    if (storageApiOk) {
        var item = localStorage.getItem(nome);
        if (item) {
            return JSON.parse(item);
        } else {
            console.log('Oggetto "' + nome + '" non presente in localStorage');
            return false;
        }
    } else {
        alert(noApiStorageMsg);
    }
}

/**
* Rimuove oggetto da array in localStorage in base alla sua label
*/
function rimuoviObjectByLabel(item, label) {
    var tempArray = getObject(item);
    if (tempArray) {
        var daEliminare = null;
        for (index in tempArray) {
            var corrente = tempArray[index];
            if (corrente.label == label) {
                daEliminare = index;
            }
        }
        if (daEliminare !== null) {
            tempArray.splice(daEliminare, 1);
        }
        storeObject(item, tempArray);
    }
}

/**
* Setta a null i valori 'html, css, js' del 'localStorage'
*/
function clearContenutiInStorage() {
    if (storageApiOk) {
        storeItem('html', null);
        storeItem('css', null);
        storeItem('js', null);
    } else {
        alert(noApiStorageMsg);
    }
}

//lancia controllo API Storage
checkLocalStorage();