var marker;

$(function() {
    window.filters = {};
    
    /**
     * Map
     * */
    $("#mostrarMapa").click(function(evt){
        mostrarMapa();
    });
    
    $("#maxDistance").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: Ctrl+C
            (e.keyCode == 67 && e.ctrlKey === true) ||
             // Allow: Ctrl+X
            (e.keyCode == 88 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    /**
     * Calendar
     * */
    var startDate;
    var endDate;
    
    $('#datefilter').daterangepicker({
        autoUpdateInput: false,
        ranges: {
           'Últimos 7 días': [moment().subtract(6, 'days'), moment()],
           'Últimos 30 días': [moment().subtract(29, 'days'), moment()],
           'Este mes': [moment().startOf('month'), moment().endOf('month')],
           'Último mes': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        locale: {
            applyLabel: 'Aplicar',
            cancelLabel: 'Limpiar',
            customRangeLabel: 'Rango personalizado'
        }
    });
    
    $('#datefilter').on('apply.daterangepicker', function(ev, picker) {
        startDate = picker.startDate;
        endDate = picker.endDate;
        $(this).val(picker.startDate.format('YYYY/MM/DD') + ' - ' + picker.endDate.format('YYYY/MM/DD'));
    });
    
    $('#datefilter').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
    
    /**
     * Sliders
     * */
    $('.slider').slider({
        range: true,
        tooltip_split: true,
        tooltip: 'always',
        tooltip_position: 'bottom'
    });
    
    /**
     * Filters
     * */
    $("#applyFilter").click(function(evt){
        applyFilters(startDate,endDate);
    });
    
    $("#cleanFilter").click(function(evt){
        clearFilters();
    });
    
    
    /**
     * mongoDB pagnación
     * */
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height() && $(window).scrollTop() !== 0) {
            window.requestNewPage();
        }
    });
    
});


function clearFilters(){
    $('#datefilter').val('');
    $("#calidadFilter").slider('setValue', [0,10]);
    $("#nubosidadFilter").slider('setValue', [0,100]);
    $("#contaminacionFilter").slider('setValue', [0,500]);
    $("#vegetacionFilter").slider('setValue', [-1,1]);
    $("#pointFilter").val('');
    $("#maxDistance").val('');
    
    $("#applyFilter").click(); //Actualizamos la vista
}


function applyFilters(startDate, endDate){
    var filters = {};
    var aux;
    
    if($("#pointFilter").val() !== '' && $("#maxDistance").val() !== ''){
        var lnglat = $("#pointFilter").val().split(", ");
        var maxDistance = Number($("#maxDistance").val())*1000;
        
        if(Number(lnglat[0]) && Number(lnglat[1])){
            filters.the_geom = {
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: [ Number(lnglat[0]) , Number(lnglat[1]) ]
                    },
                    $maxDistance: maxDistance
                }
            };
        }else{
            $("#pointFilter").val('');
        }
    }
    
    if($('#datefilter').val() !== ''){
        filters.scene_date = {
            $gte: startDate.valueOf(),
            $lte: endDate.valueOf()
        };
    }
    
    if($("#calidadFilter").val() !== "0,10"){ //Si el rango actual es diferente al rango maximo
        aux = $("#calidadFilter").val().split(",");
        filters.calidad = {
            $lte: Number(aux[1]),
            $gte: Number(aux[0])
        };
    }
    
    if($("#nubosidadFilter").val() !== "0,100"){ //Si el rango actual es diferente al rango maximo
        aux = $("#nubosidadFilter").val().split(",");
        filters.nubosidad = {
            $lte: Number(aux[1]),
            $gte: Number(aux[0])
        };
    }
    
    if($("#contaminacionFilter").val() !== "0,500"){ //Si el rango actual es diferente al rango maximo
        aux = $("#contaminacionFilter").val().split(",");
        filters.contaminacion = {
            $lte: Number(aux[1]),
            $gte: Number(aux[0])
        };
    }
    
    if($("#vegetacionFilter").val() !== "-1,1"){ //Si el rango actual es diferente al rango maximo
        aux = $("#vegetacionFilter").val().split(",");
        filters.vegetacion = {
            $gte: Number(aux[0]),
            $lte: Number(aux[1])
        };
    }
    
    window.filters = filters;
    window.applyFilter();
}


function mostrarMapa(){
    BootstrapDialog.show({
        title: '',
        autodestroy: true,
        message: "<div id='mapForm'></div><label for='radiusDialog'>Radio (km): </label><input type='text' id='radiusDialog' value='200'/>",
        onshown: function(){
            buildMap("mapForm");
        },
        buttons:[
            {     
                label: 'Cancelar',
                cssClass: 'btn', 
                autospin: false,
                action: function(dialogRef){
                    dialogRef.close();
                }
            },
            {
                icon: 'glyphicon glyphicon-check',       
                label: 'Aceptar',
                cssClass: 'btn-primary', 
                autospin: false,
                action: function(dialogRef){
                    $("#maxDistance").val( $("#radiusDialog").val() );
                    var latlng = marker.getLatLng();
                    $("#pointFilter").val(latlng.lng + ", " + latlng.lat);
                    dialogRef.close();
                }
            }
        ]
    });
}


function buildMap(idMap){
    var map = L.map(idMap).setView([24.0807577,-101.8983489], 5);
    
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 8,
        minZoom: 5
    }).addTo(map);
    
    var radiusLayer = L.layerGroup();
    radiusLayer.addTo(map);
    
    marker = L.marker([24.0807577,-101.8983489], {
        draggable: true
    });
    
    marker.on('dragstart', function(evt){
        radiusLayer.clearLayers();
    });
    
    marker.on('dragend', function(evt){
        L.circle(marker.getLatLng(), $("#radiusDialog").val() * 1000).addTo(radiusLayer);
    });
    
    marker.addTo(map);
    L.circle(marker.getLatLng(), $("#radiusDialog").val() * 1000).addTo(radiusLayer);
    
   $("#radiusDialog").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: Ctrl+C
            (e.keyCode == 67 && e.ctrlKey === true) ||
             // Allow: Ctrl+X
            (e.keyCode == 88 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    
    $("#radiusDialog").on('keyup',function(){
        radiusLayer.clearLayers();
        L.circle(marker.getLatLng(), $("#radiusDialog").val() * 1000).addTo(radiusLayer);
    });
}

/*
    global $
    global moment
    global BootstrapDialog
    global L
*/