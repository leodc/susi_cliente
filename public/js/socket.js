var socket = io();
var lastSceneTime;

socket.on("newData", function(docs){
    for(var i = 0; i < docs.length; i++){
        appendPortfolioItem(docs[i]);
        lastSceneTime = docs[i].scene_date;
    }
});


function appendPortfolioItem(sceneData){
    var formattedDate = moment(sceneData.scene_date).utc().format('YYYY/MM/DD HH:mm:ss');
    
    var html = '<div class="col-md-3 portfolio-item portfolio-item-scene">';
    html += '<img class="img-responsive" onerror="this.src=\'http://www.placehold.it/250x250\'" src="susi/thumbnails/' + sceneData.scene_id + '.png" alt="' + sceneData.scene_id + '">';
    html += '<h5><a href="' + sceneData.scene_id + '" target="_blank">' + sceneData.scene_id + '</a></h5>';
    html +=  '<b>' + formattedDate + '</b><br>';
    html += sceneData.localidad + "<br>";
    html += sceneData.entidad + ", " + sceneData.municipio + "<br>";
    html += 'Calidad: ' + sceneData.calidad + '<br>';
    html += 'Contaminación: ' + sceneData.contaminacion + '<br>';
    html += 'Nubosidad: ' + sceneData.nubosidad + '<br>';
    html += 'Vegetación: ' + sceneData.vegetacion + '<br>';
    html += '</div>';
    
    $("#scenesContainer").append(html);
}


window.requestNewPage = function(){
    var filters = window.filters;
    filters.scene_date = {$lt: lastSceneTime};
    socket.emit("newPage", filters);
};


window.applyFilter = function(){
    $(".portfolio-item-scene").remove();
    socket.emit("newPage", window.filters);
};

/*
    global $
    global io
    global moment
*/