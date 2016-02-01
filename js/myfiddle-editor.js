var tema, timestamp, editor_html, editor_css, editor_js;
var win, menu, menu_h, win_h, disponibile;

var carica_lista_locali = false;
var tipo_file_ext = undefined;

/**
* Valori demo da impostare come esempio
*/
var demoVal = {
    html: '<h1>myFiddle 1.2</h1>\n<h3>Autore: Andrea Lombardo</h3>\n<p>\n\tUna sorta di jsFiddle standalone (molto base).<br/>\n\tNon necessita di server o installazioni particolari.\n\tNecessita invece di browser moderni!\n</p>\n\n<div id="nascosto">\n\t&Egrave; possibile includere stili e librerie js usando il bottone <strong>File esterni</strong> in alto a destra.\n</div>\n\n<div class="btn" onclick="alert(document.getElementById(\'nascosto\').textContent)">\n\tClick Qui\n</div>\n\n',
        css: 'body{\n\tfont-family: Arial,Tahoma, Sans-serif;\n}\n\nh1, h2, h3, h4, h5{\n\tcolor: #333;\n}\n\n#nascosto{\n\tdisplay: none;\n\tborder:1px solid red;\n\tpadding:15px;\n\tmargin:10px 50px;\n\tborder-radius:5px\n}\n\n.btn{\n\tfont-weight: bold;\n\tborder:1px solid #CCC;\n\tpadding:10px;\n\tbackground-color:#333;\n\tcolor: #FFF;\n\tcursor: pointer;\n\twidth:100px;\n\tmargin:0 auto;\n\ttext-align: center;\n\tborder-radius:10px;\n}\n',
        js: '//inserisci il codice javascript da eseguire\n\nvar prova = setTimeout(function(){\n\tdocument.getElementById(\'nascosto\').style.display = \'block\';\n}, 3000);'
    };

/**
* Lista dei possibili temi da applicare agli editor
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

    stessaLarghezza('.myf-label');

    addListener();

    inizializzaEditors();

    popolaListaTemi();

    settaValoriDemo();

    caricaListaFileDaIncludere();
}

/**
* Aggiunge listener su elementi del DOM
*/
function addListener() {
    win.on('resize', function () {
        menu_h = menu.height();
        win_h = win.height();
        disponibile = getAltezzaDisponibile(menu_h, win_h);
        settaAltezzaRow(disponibile);
    });

    $('#select_tema').on('change', function () {
        storeItem('tema', $(this).val());
        inizializzaEditors();
        popolaListaTemi();
    });

    $('#carica_lista_locali').on('change', function () {
        var stato = $(this).prop('checked');
        if (stato) {
            carica_lista_locali = true;
        } else {
            carica_lista_locali = false;
        }

        tipo_file_ext = $('[name="tipo_file_ext"]:checked').val();
        if (tipo_file_ext !== undefined) {
            popolaListaPreset();
        }
    });

    $('[name="tipo_file_ext"]').on('click', function () {
        tipo_file_ext = $('[name="tipo_file_ext"]:checked').val();
        popolaListaPreset();
    });

    $('#select_preset').on('change', function () {
        $('#custom_url').val($(this).val());
        $('#custom_url_label').val($('#select_preset option:selected').text());
        $('#aggiungi_ext').trigger('click');
    });

    $('#aggiungi_ext').on('click', function () {
        var _label = $('#custom_url_label').val() ? $('#custom_url_label').val() : 'Custom_' + tipo_file_ext + '_' + new Date().getTime();
        var _url = $('#custom_url').val();

        if (_url !== '') {
            var oggetto = { label: _label, url: _url };

            if (tipo_file_ext == 'css') {
                cssDaIncludere.push(oggetto);
                storeObject('extCSS', cssDaIncludere);
            } else if (tipo_file_ext == 'js') {
                jsDaIncludere.push(oggetto);
                storeObject('extJS', jsDaIncludere);
            }
            popolaListaPreset();
        }
    });

    $(document).on('click', '.cancella-css', function () {
        var label = $(this).attr('data-label');
        rimuoviObjectByLabel('extCSS', label);
        popolaListaPreset();
    });

    $(document).on('click', '.cancella-js', function () {
        var label = $(this).attr('data-label');
        rimuoviObjectByLabel('extJS', label);
        popolaListaPreset();
    });
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
* Ottieni altezza disponibile da dividere agli editor sottraendo l'altezza della barra men�
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
* Dato un selettore trova il pi� largo ed assegna la sua larghezza a tutti gli elementi con lo stesso selettore
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
        var option;
        if (corrente == tema) {
            option = '<option value="' + corrente + '" selected>Tema ' + label + '</option>';
        } else {
            option = '<option value="' + corrente + '">' + label + '</option>';
        }
        $('#select_tema').append(option);
    }
}


/**
* Popola la lista dei possibili file esterni da caricare
*/
function popolaListaPreset() {

    caricaListaFileDaIncludere();

    var oggettodaIterare = null;

    $('#custom_url').val('');
    $('#custom_url_label').val('');

    if (tipo_file_ext == 'css') {
        oggettodaIterare = presetCSS;
    } else if (tipo_file_ext == 'js') {
        oggettodaIterare = presetJS;
    }

    if (oggettodaIterare !== null) {
        $('#select_preset option').remove();

        var option = '<option value="" selected disabled>Seleziona una libreria ' + tipo_file_ext.toUpperCase() + '</option>';
        $('#select_preset').append(option);

        for (index in oggettodaIterare) {
            var corrente = oggettodaIterare[index];
            var label = corrente.label;
            var valore = carica_lista_locali ? corrente.url.locale : corrente.url.remoto;
            option = '<option value="' + valore + '">' + label + '</option>';
            $('#select_preset').append(option);
        }
        $('#select_preset').prop('disabled', false);

        mostraFileExtInclusi();
    }
}


/**
* Mostra i file già presenti nella lista delle inclusioni
*/
function mostraFileExtInclusi() {
    var oggettodaIterare = [];

    $('#lista_file_ext li').remove();

    if (tipo_file_ext == 'css') {
        oggettodaIterare = cssDaIncludere;
    } else if (tipo_file_ext == 'js') {
        oggettodaIterare = jsDaIncludere;
    }

    if (oggettodaIterare.length > 0) {  
        for (index in oggettodaIterare) {
            var corrente = oggettodaIterare[index];
            var label = corrente.label;
            var url = corrente.url;
            var li = '<li><span class="glyphicon glyphicon-trash text-danger cancella cancella-' + tipo_file_ext + '" data-label="' + label + '"></span>&nbsp;' + label + '<br/><small>' + url + '</small></li>';
            $('#lista_file_ext').append(li);
        }
    }
}



/**
* Aggiunge metodo 'ucfirst' (stile PHP) all'oggetto String
*/
String.prototype.ucfirst = function(){
  var primaLettera = this.charAt(0).toUpperCase();
  return primaLettera + this.substr(1);
}

