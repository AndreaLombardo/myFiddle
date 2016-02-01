var html, css, js, evalutato;

var erroriImportJs = [];
var erroriImportCss = [];
 

/**
* Ottiene i contenuti da 'localStorage' e li innietta nel DOM della pagina run.html
*/
function inject() {
    html = getItem('html');
    css = getItem('css');
    js = getItem('js');

    caricaListaFileDaIncludere();

    caricaFilesCss(cssDaIncludere, function(){
    	console.log('Fine caricamento file CSS');
    });
    
    var tagStyle = document.createElement('style');
    tagStyle.textContent = css ? css : '';
    document.head.appendChild(tagStyle);

    document.body.innerHTML = html ? html : '';
   
    caricaFilesJs(jsDaIncludere, function () {
    	console.log('Fine caricamento file JS');
        runJs(js);
    });

}

/**
*Carica ed appende nella head della pagina un file css
*/
function caricaFileCss(path, callback) {
	var style = document.createElement('link');

    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = path + '?_t=' + new Date().getTime();

    style.onload = function () {
        callback();
    };

    style.onerror = function (error) {
        erroriImportCss.push(path);
        callback();
    };

    document.head.appendChild(style);
}

/**
* Carica un'array di file css e li appende nell'head della pagina
*/
function caricaFilesCss(oggetti, callback, start) {
    var curIndex = start ? start : 0;
    var arrLength = oggetti.length;

    if (arrLength > 0) {

        caricaFileCss(oggetti[curIndex].url, function () {
            curIndex++;
            if (curIndex <= (arrLength - 1)) {
                caricaFilesCss(oggetti, callback, curIndex);
            } else {
                verificaErroriDiImportCss();
                callback();
            }
        });

    } else {
        callback();
    }
}

/**
*Carica ed appende nella head della pagina un file js
*/
function caricaFileJs(path, callback) {
    var script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = path + '?_t=' + new Date().getTime();

    script.onload = function () {
        callback();
    };

    script.onerror = function (error) {
        erroriImportJs.push(path);
        callback();
    };

    document.head.appendChild(script);
}

/**
* Carica un'array di file js e li appende nell'head della pagina
*/
function caricaFilesJs(oggetti, callback, start) {
    var curIndex = start ? start : 0;
    var arrLength = oggetti.length;

    if (arrLength > 0) {

        caricaFileJs(oggetti[curIndex].url, function () {
            curIndex++;
            if (curIndex <= (arrLength - 1)) {
                caricaFilesJs(oggetti, callback, curIndex);
            } else {
                verificaErroriDiImportJs();
                callback();
            }
        });

    } else {
        callback();
    }
}


/**
* Verifica se l'array degli errori di import js (erroriImportJs) contiene valori, in caso crea notifica (attualmente in console) e poi resetta l'array
*/
function verificaErroriDiImportJs() {
    if (erroriImportJs.length > 0) {
        var notifica = "";
        for (idx in erroriImportJs) {
            notifica += 'File ' + erroriImportJs[idx] + ' non caricato;\n';
        }
        console.log(notifica);
        erroriImportJs = [];
    }
}

/**
* Verifica se l'array degli errori di import css (erroriImportCss) contiene valori, in caso crea notifica (attualmente in console) e poi resetta l'array
*/
function verificaErroriDiImportCss() {
    if (erroriImportCss.length > 0) {
        var notifica = "";
        for (idx in erroriImportCss) {
            notifica += 'File ' + erroriImportCss[idx] + ' non caricato;\n';
        }
        console.log(notifica);
        erroriImportCss = [];
    }
}

/**
* Lancia esecuzione del codice js
*/
function runJs(js) {
    eval(js);
}