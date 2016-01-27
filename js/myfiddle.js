var tema, timestamp, editor_html, editor_css, editor_js, evalutato;
var win, menu, menu_h, win_h, disponibile;
var html, css, js;

var storageApiOk = false;
var noApiStorageMsg = 'Il tuo browser non supporta le Storage API.\nAggiornalo ad una versione più recente!';

/**
* Valori demo da impostare come esempio
*/
var demoVal = {
        html: '<h1>myFiddle 1.0</h1>\n<h3>Autore: Andrea Lombardo</h3>\n<p>\n\tUna sorta di jFiddle standalone (molto base).<br/>\n\tNon necessita di server o installazioni particolari.\n\tNecessita invece di browser moderni!\n</p>\n\n<div id="nascosto">\n\t&Egrave; possibile disabilitare l\'inclusione di jQuery usando il bottone in alto a destra.\n</div>\n\n<div class="btn" onclick="alert(document.getElementById(\'nascosto\').textContent)">\n\tClick Qui\n</div>\n\n',
        css: 'body{\n\tfont-family: Arial,Tahoma, Sans-serif;\n}\n\nh1, h2, h3, h4, h5{\n\tcolor: #333;\n}\n\n#nascosto{\n\tdisplay: none;\n\tborder:1px solid red;\n\tpadding:15px;\n\tmargin:10px 50px;\n\tborder-radius:5px\n}\n\n.btn{\n\tfont-weight: bold;\n\tborder:1px solid #CCC;\n\tpadding:10px;\n\tbackground-color:#333;\n\tcolor: #FFF;\n\tcursor: pointer;\n\twidth:100px;\n\tmargin:0 auto;\n\ttext-align: center;\n\tborder-radius:10px;\n}\n',
        js: '//inserisci il codice javascript da eseguire\n\n$(\'div\').fadeIn(6000);'
    };

/**
* Lista dei possibili temi da applicare all'editor
*/
var temi = [
    'ambiance',
    'chaos',
    'chrome',
    'clouds',
    'clouds_midnight',
    'cobalt',
    'crimson_editor',
    'dawn',
    'dreamweaver',
    'eclipse',
    'github',
    'idle_fingers',
    'iplastic',
    'katzenmilch',
    'kr_theme',
    'kuroir',
    'merbivore',
    'merbivore_soft',
    'mono_industrial',
    'monokai',
    'pastel_on_dark',
    'solarized_dark',
    'solarized_light',
    'sqlserver',
    'terminal',
    'textmate',
    'tomorrow',
    'tomorrow_night',
    'tomorrow_night_blue',
    'tomorrow_night_bright',
    'tomorrow_night_eighties',
    'twilight',
    'vibrant_ink',
    'xcode'
];

/**
* Inizializza la pagina
*/
function inizializzaPagina() {
    win = $(window);
    menu = $('#menu');

    menu_h = menu.height();
    win_h = win.height();

    disponibile = getAltezzaDisponibile(menu_h, win_h);

    settaAltezzaRow(disponibile);

    win.on('resize', function () {
        menu_h = menu.height();
        win_h = win.height();
        disponibile = getAltezzaDisponibile(menu_h, win_h);
        settaAltezzaRow(disponibile);
    });

    stessaLarghezza('.myf-label');

    $('#select_tema').on('change', function () {
        storeItem('tema', $(this).val());
        inizializzaEditors();
        popolaListaTemi();
    });

    $('#usa_jquery').on('change', function(){
        var stato = $(this).prop('checked');
        if(stato){
            $('#jquery_label').text('jQuery On');
        }else{
            $('#jquery_label').text('jQuery Off');
        }
    });

    inizializzaEditors();

    popolaListaTemi();

    settaValoriDemo();
}

/**
* Imposta i valori iniziali della pagina
*/
function settaValoriDemo(){
    editor_html.setValue(demoVal.html);
    editor_html.clearSelection();

    editor_css.setValue(demoVal.css);
    editor_css.clearSelection();

    editor_js.setValue(demoVal.js);
    editor_js.clearSelection();
}

/**
* Inizializza gli editor 'ace'
*/
function inizializzaEditors() {
    editor_html = ace.edit("editor-html");
    editor_css = ace.edit("editor-css");
    editor_js = ace.edit("editor-js");

    tema = getItem('tema');

    if (!tema) {
        tema = 'dreamweaver';
    }

    editor_html.setTheme("ace/theme/" + tema);
    editor_css.setTheme("ace/theme/" + tema);
    editor_js.setTheme("ace/theme/" + tema);  

    editor_html.getSession().setMode("ace/mode/html");
    editor_css.getSession().setMode("ace/mode/css");
    editor_js.getSession().setMode("ace/mode/javascript");
}

/**
* Ottieni altezza disponibile da dividere agli editor sottraendo l'altezza della barra menù
*/
function getAltezzaDisponibile(m, w) {
    return w - m;
}

/**
* Imposta altezza dei div 'myf-row'
*/
function settaAltezzaRow(total_h) {
    var h = total_h / 2;
    $('.myf-row').height(h);
}

/**
* Dato un selettore trova il più largo ed assegna la sua larghezza a tutti gli elementi con lo stesso selettore
*/
function stessaLarghezza(selettore) {
    var max_w = 0;
    $(selettore).each(function () {
        var this_w = $(this).width();
        if (this_w > max_w) {
            max_w = this_w;
        }
    });

    $(selettore).each(function () {
        $(this).width(max_w);
    });
}

/**
* Salva i dati nel browser e richiama la pagina nell'iframe
*/
function runIn() {
    storeData();
    $('#iframe-out').attr('src', 'run.html?_t=' + timestamp);
}

/**
* Salva i dati nel browser e richiama la pagina in una nuova finestra
*/
function runOut() {
    storeData();
    window.open('run.html?_t=' + timestamp, 'myFiddle', '', true);
}

/**
* Utilizzata nella pagina run.html, ottiene i contenuti da 'localStorage' e li innietta nel DOM
*/
function inject() {
    html = getItem('html');
    css = getItem('css');
    js = getItem('js');
    jq = getItem('jq');

    var tagStyle = document.createElement('style');
    tagStyle.textContent = css ? css : '';
    document.head.appendChild(tagStyle);

    document.body.innerHTML = html ? html : '';

    //controlla se l'utente ha scelto l'uso di jQuery o meno
    if (jq == 'true') {
        addJquery();
    } else {
        runJs(js);
    }
}

/**
* Innietta jQuery nella pagina
*/
function addJquery() {
    var tagScript = document.createElement('script');
    tagScript.src = 'js/jquery-1.12.0.min.js';

    tagScript.onreadystatechange = tagScript.onload =  function (ciao) {
        if (typeof (jQuery)) {
            console.log('jQuery caricato');
            runJs(js);
        }
    }
    document.head.appendChild(tagScript);
}

/**
* Lancia esecuzione del codice js
*/
function runJs(js) {
    eval(js);
}

/**
* Svuota il contenuto degli editor
*/
function pulisciEditors() {
    editor_html.setValue('');
    editor_css.setValue('');
    editor_js.setValue('');
}

/**
* Crea gli elementi 'option' per popolare il select della scelta dei temi
*/
function popolaListaTemi() {
    $('#select_tema option').remove();

    for (index in temi) {
        var corrente = temi[index];
        var label = corrente.replace(new RegExp('_', 'g'), ' ').ucfirst();
        if (corrente == tema) {
            option = '<option value="' + corrente + '" selected>Tema ' + label + '</option>';
        } else {
            option = '<option value="' + corrente + '">' + label + '</option>';
        }
        $('#select_tema').append(option);
    }
}

/**
* Controlla se le API Storage sono disponibili nel browser
*/
function checkLocalStorage(){
    if (typeof (Storage)) {
        console.log('localStorage disponibile!');
        storageApiOk = true;
    } else {
        console.log('localStorage NON disponibile!');
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

    clearStorage();

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
* Svuota tutti i contenuti di 'localStorage'
*/
function clearStorage() {
    if (storageApiOk) {
        localStorage.clear();
    } else {
        alert(noApiStorageMsg);
    }
}

/**
* Aggiunge metodo 'ucfirst' (stile PHP) all'oggetto String
*/
String.prototype.ucfirst = function(){
  var primaLettera = this.charAt(0).toUpperCase();
  return primaLettera + this.substr(1);
}

//lancia controllo API Storage
checkLocalStorage();