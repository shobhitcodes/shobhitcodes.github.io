var map;
var markers = [];
var markerListener;
var icons = {
	checkpoint: {
		icon: '../resbox/checkpoint.png'
	}
};
var currentCkTitle;
var currentMarkerCount;

function initMap() {
	map = new google.maps.Map(document.getElementById('mapCanvas'), {
		center: {lat: 18.5204303, lng:73.85674369999992},
		zoom: 13
	});	
}
function getUID() {
	return Math.random().toFixed(10).toString(36).substr(2, 16);
}
function addMarker(location) {
	let markerId = getUID();
	let marker = createHTMLMapMarker({
		latlng: location,
		map: map,
		html: `<div data-id="${markerId}" class="checkpoint-gtag white droppable"></div>`,
		id: markerId
	});
	markers.push(marker);
	console.log(markers[0].position);
	console.log(markers[0].getPosition().lat());
	console.log(markers[0].getPosition().lng());
	// panes.overlayMouseTarget.appendChild(div);  
	// let overlayListener = overlay.addListener('click', function(event) {
	// 	console.log("overlay dabaa");
	// });
	// google.maps.event.addDomListener(markers, 'click', function(){
 //      console.log("overlay dabaa");
 //     })
}

function showLayers() {
	$("#tracker-layers-wrapper").removeClass("d-none");
	fetchLayers();
}

var activateMarkerSelection = () => {
	markerListener = map.addListener('click', function(event) {
		if(currentMarkerCount + 1 == markers.length) {
			markers[markers.length-1].setMap(null);
			markers.pop();
		}
		addMarker(event.latLng);
	});
};

function fetchMaps() {
	let mapList = "#tracker-map-list";
	$(mapList).empty()
	if (typeof(Storage) !== "undefined") {
		if(localStorage.getItem("map")) {
			$("#tracker-noMaps-label").addClass("d-none");
			let maps = JSON.parse(localStorage.getItem("map"));
			console.log(maps);
			maps.forEach( item => {
				$(mapList).append(addMapItem(item.id, item.name, item.active));
			});
			showLayers();
		} else {
			$("#tracker-noMaps-label").removeClass("d-none");
		}
	}
}

function fetchLayers() {
	let layerList = "#tracker-layer-list";
	$(layerList).empty()
	if (typeof(Storage) !== "undefined") {
		if(localStorage.getItem("layer")) {
			$("#tracker-noLayers-label").addClass("d-none");
			let layers = JSON.parse(localStorage.getItem("layer"));
			console.log(layers);
			layers.forEach( item => {
				$(layerList).append(addLayerItem(item.id, item.name, item.active));
			});
		} else {
			$("#tracker-noLayers-label").removeClass("d-none");
		}
	}
}

function addLayerItem(id, name, active) {
	return `<li class="tracker-layer-item">
	<div class="switch__container">
	<span class="text__wrap">${name}</span>
	<span class="switch">
	<label>
	<input data-id="${id}" type="checkbox" ${(active === 1) ? "checked" : "unchecked"}>
	<span class="lever"></span>
	</label>
	</span>
	</div>					
	</li>
	`;
}

function addMapItem(id, name, active) {
	return `<li class="tracker-map-item">
	<div class="switch__container">
	<span class="text__wrap tracker-map-name">${name}</span>
	<span class="switch">
	<label>
	<input data-id="${id}" class="tracker-map-active" type="checkbox" ${(active === 1) ? "checked" : "unchecked"}>
	<span class="lever"></span>
	</label>
	</span>
	</div>					
	</li>
	`;
}

function initMaterialize() {
	$('ul.tabs').tabs({
		swipeable: true
	});
	$("#cp-type").material_select();
}

$(document).ready(function() {
	initMaterialize();
	fetchMaps();
	fetchLayers();
	//Event Handlers on Tab 1(Map) --start
	$("#map-title").change(() => {
		$("#map-title").val() !== "" ? $("#map-add").prop("disabled", false) : $("#map-add").prop("disabled", true);
	});
	$("#tracker-map-lock-position").change(() => {
		$("#tracker-map-lock-position").prop("checked") ? map.setOptions({draggable: false}) : map.setOptions({draggable: true});
	});
	$("#layer-title").change(() => {
		$("#layer-title").val() !== "" ? $("#layer-add").prop("disabled", false) : $("#layer-add").prop("disabled", true);
	});
	//Event Handlers on Tab 1(Map) --end


	$("#cp-title").change(function() {
		$("#cp-title").val() !== "" && $("#cp-type").val() !== null ? $("#cp-location").prop("disabled", false) : $("#cp-location").prop("disabled", true);
	});
	$("#cp-type").change(function() {
		$("#cp-type").val() !== null && $("#cp-title").val() !== "" ? $("#cp-location").prop("disabled", false) : $("#cp-location").prop("disabled", true);
	});
	$("#cp-location").click(() => {
		console.log("dabaa");
		$("#cp-add").prop("disabled", false);
		currentMarkerCount = markers.length;
		activateMarkerSelection("checkpoint");
	});
	$("#cp-add").click(() => {
		currentCkTitle = $("#cp-title").val();
		//google.maps.event.removeListener(markerListener);
		clearAllListeners();
		$("#checkpoints-tally").text((parseInt($("#checkpoints-tally").text()) + 1));
		$("#checkpoints-list-wrapper").append(
			`<div class="checkpoint-box">
			<div class="checkpoint-icon">
			<div class="checkpoint-tag"></div>
			</div>
			<div class="checkpoint-info-wrapper">
			<div id="${markers[markers.length-1].html.substr(14,10)}" class="checkpoint-name">${currentCkTitle}</div>
			<div class="checkpoint-coordinates">
			${markers[markers.length-1].getPosition().lat().toFixed(3)} - ${markers[markers.length-1].getPosition().lng().toFixed(3)}
			</div>
			</div>
			</div>`);
		$("#cp-title").val("");
		$('#cp-type').material_select();
		$("#cp-location").prop("disabled", true);
		$("#cp-add").prop("disabled", true);
	});
	$(".tracker-sign-icon").click((event) => {
		$(event.target).toggleClass("active");
		$(".tracker-sign-icon").not(event.target).removeClass("active");
	});
	$(".tracker-banner-icon").click((event) => {
		$(event.target).toggleClass("active");
		$(".tracker-banner-icon").not(event.target).removeClass("active");
	});
	$("#map-add").click(() => {
		if($("#map-title").val() !== "") {
			let newMap, storedMap, newData = [];
			if (typeof(Storage) !== "undefined") {
				if(localStorage.getItem("map")) {
					storedMap = JSON.parse(localStorage.getItem("map"));
					storedMap.forEach( item => {
						item.active = 0;
						newData.push(item);
					});
					newMap = {
						"id" : getUID(),
						"name" : $("#map-title").val(),
						"center" : map.getCenter(),
						"draggable" : $("#tracker-map-lock-position").prop("checked"),
						"active" : 1
					};
					//newData.push(storedMap);
					newData.push(newMap);
					localStorage.setItem("map", JSON.stringify(newData));
				} else {
					newMap = [{
						"id" : getUID(),
						"name" : $("#map-title").val(),
						"center" : map.getCenter(),
						"draggable" : $("#tracker-map-lock-position").prop("checked"),
						"active" : 1
					}];
					localStorage.setItem("map", JSON.stringify(newMap));
				}
			}
		}
		fetchMaps();
		$("#tracker-add-map-wrapper").addClass("d-none");
	});
	$("#layer-add").click(() => {
		if($("#layer-title").val() !== "") {
			let newLayer, storedLayers, newData = [];
			if (typeof(Storage) !== "undefined") {
				if(localStorage.getItem("layer")) {
					storedLayers = JSON.parse(localStorage.getItem("layer"));
					storedLayers.forEach( item => {
						// item.active = 0;
						newData.push(item);
					});
					newLayer = {
						"id" : getUID(),
						"name" : $("#layer-title").val(),
						"active" : 1,
						"map" : getActiveMap()	
					};
					//newData.push(storedMap);
					newData.push(newLayer);
					localStorage.setItem("layer", JSON.stringify(newData));
				} else {
					newLayer = [{
						"id" : getUID(),
						"name" : $("#layer-title").val(),
						"active" : 1,
						"map" : getActiveMap()
					}];
					localStorage.setItem("layer", JSON.stringify(newLayer));
				}
			}
		}
		fetchLayers();
		$("#tracker-add-layer-wrapper").addClass("d-none");
	});
	$(".tracker-sign-icon").on('dragstart', function() {
		return false;
	});
	$(".tracker-sign-icon").mousedown((event) => {
		let draggedItem = event.target;
		let currentDroppable = null; 
		let shiftX = event.clientX - draggedItem.getBoundingClientRect().left;
		let shiftY = event.clientY - draggedItem.getBoundingClientRect().top;
		console.log(draggedItem);
		draggedItem.style.position = "absolute";
		draggedItem.style.zIndex = 1000;
		document.body.append(draggedItem);
		moveAt(event.pageX, event.pageY);
		function moveAt(pageX, pageY) {
			draggedItem.style.left = pageX - shiftX + 'px';
			draggedItem.style.top = pageY - shiftY + 'px';
		}
		function onMouseMove(event) {
			moveAt(event.pageX, event.pageY);
			draggedItem.hidden = true;
			let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
			draggedItem.hidden = false;
			if (!elemBelow) return;
			let droppableBelow = elemBelow.closest('.droppable');
			if (currentDroppable != droppableBelow) { 
				if (currentDroppable) {
					//leaveDroppable(currentDroppable);
					currentDroppable.style.borderColor = "#ccc"; 
					currentDroppable.classList.remove("selected");
				}
				currentDroppable = droppableBelow;
				if (currentDroppable) {
					//enterDroppable(currentDroppable);
					droppableBelow.style.borderColor = "#00b2ee"; 
					droppableBelow.classList.add("selected");
				}
			}
		}
		document.addEventListener('mousemove', onMouseMove);
		draggedItem.onmouseup = function() {
			document.removeEventListener('mousemove', onMouseMove);
			draggedItem.onmouseup = null;
			$(".checkpoint-gtag").each(() => {
				if($(this).hasClass("selected")) {
					console.log("on selected!!");
				}
			});

		};
	});
});

function clearAllListeners() {
	google.maps.event.clearListeners(map, 'click');
}

function addMap() {
	if($("#tracker-add-map-wrapper").hasClass("d-none")) {
		$("#tracker-add-map-wrapper").removeClass("d-none");
	} else {
		$("#tracker-add-map-wrapper").addClass("d-none");
		return;
	}
	let autocomplete = new google.maps.places.Autocomplete(document.getElementById('tracker-map-location-search'));
	autocomplete.addListener('place_changed', function() {
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location); 
		}
	});
}

function addLayer() {
	if($("#tracker-add-layer-wrapper").hasClass("d-none")) {
		$("#tracker-add-layer-wrapper").removeClass("d-none");
	} else {
		$("#tracker-add-layer-wrapper").addClass("d-none");
	}
}

function lockMap() {
	map.setOptions({draggable: false});
}

function getActiveMap() {
	let activeMap;
	$("li.tracker-map-item").each(function() {
		if($(this).find("input.tracker-map-active").prop("checked")) {
			activeMap = $(this).find("input.tracker-map-active").data("id");
		}
	});
	return activeMap;
}