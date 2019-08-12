//Global variables --start

let map;
let activeMap;
let activeLayersSet;
let layerSet, mapSet;
const initialLayers = [{"id":101,"active":1},{"id":102,"active":1},{"id":103,"active":1}];

var markers = [];
var markerListener;
var currentCkTitle;
var currentMarkerCount;

//Global variables --end


//Helper Methods --start

//Returns unique id
function getUID() {
	return Math.random().toFixed(10).toString(36).substr(2, 16);
}

//Updates Database
function updateLocalStorage(key) {
	if(key === "map"){
		localStorage.setItem("map", JSON.stringify(mapSet));
	}
}

//Updates global sets
function updateSet(key, id, itemKey, value) {
	let changeSet;
	if(key === "map") {
		changeSet = mapSet;
	}
	changeItemIndex = changeSet.findIndex(x => x.id == id);
	if(itemKey === "active") {
		changeSet.map(x => x.active = 0);
	}
	changeSet[changeItemIndex][itemKey] = value;
	mapSet = changeSet;
}

//Helper Methods --end


//Materialize Components Methods --start

//To initialize Materialize components
function initMaterialize() {
	$('ul.tabs').tabs({
		swipeable: true
	});
	$('.tooltipped').tooltip();
	// $("#cp-type").material_select();
}

//Materialize Components Methods --end


//GoogleMap Service Methods --start

//Initializes and displays google map 
function initGoogleMap() {
	if( activeMap !== undefined ) {
		map = new google.maps.Map(document.getElementById('mapCanvas'), {
			center: {lat: activeMap.center.lat, lng: activeMap.center.lng},
			zoom: activeMap.zoom,
			draggable: activeMap.draggable
		});	
	} else {
		map = new google.maps.Map(document.getElementById('mapCanvas'), {
			center: {lat: 18.5204303, lng:73.85674369999992},
			zoom: 14
		});	
	}
}

//Activates Google map navigation by places
function activatePlaceAutocomplete() {
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


//Clears all listeners set on google map
function clearAllListeners() {
	google.maps.event.clearListeners(map, 'click');
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

var activateMarkerSelection = () => {
	markerListener = map.addListener('click', function(event) {
		if(currentMarkerCount + 1 == markers.length) {
			markers[markers.length-1].setMap(null);
			markers.pop();
		}
		addMarker(event.latLng);
		if($("#tracker-cp-loc").hasClass("loc-blinker")) {
			$("#tracker-cp-loc").removeClass("loc-blinker");
			$("#tracker-cp-loc").addClass("prismBlue");
		}
		$("#cp-title").val() !== "" ? $("#cp-add").prop("disabled", false) : $("#cp-add").prop("disabled", true);
	});
};

//GoogleMap Service Methods --end


//Map Service Methods --start

//Fetches maps from local storage and shows on Map wrapper 
function fetchMaps() {
	let mapList = "#tracker-map-list";
	$(mapList).empty();
	if (typeof(Storage) !== "undefined") {
		if(localStorage.getItem("map")) {
			$("#tracker-noMaps-label").addClass("d-none");
			let maps = JSON.parse(localStorage.getItem("map"));
			mapSet = maps;
			mapSet.forEach( item => {
				$(mapList).append(addMapItem(item.id, item.name, item.active));
			});
			setActiveMap();
			$("li.tracker-map-item").find('.tracker-map-name[data-active="1"]').parent().find("input.tracker-map-status").removeAttr("checked").prop("checked", true);
		} else {
			$("#tracker-noMaps-label").removeClass("d-none");
		}
	}
}

//Appends Map element to Map wrapper
function addMapItem(id, name, active) {
	return `<li class="tracker-map-item">
	<div class="switch__container">
	<span class="tracker-map-name text__wrap" data-id="${id}" data-active="${active}">${name}</span>
	<span class="switch">
	<label>
	<input class="tracker-map-status" type="checkbox" ${(active === 1) ? "checked disabled" : ""}>
	<span class="lever"></span>
	</label>
	</span>
	</div>					
	</li>
	`;
}

//Returns current active map id
function getActiveMapId() {
	return $("li.tracker-map-item").find('.tracker-map-name[data-active="1"]').data("id");
}

//Sets activeMap
function setActiveMap(){
	activeMap = mapSet.find(function(item) { return item.id == getActiveMapId() });
}

//Map Service Methods --end


//Layer Service Methods --start

//Sets default layers to Local Storage
function setDefaultLayers() {
	if(typeof(Storage) !== "undefined") {
		let layers = [];
		let layersName = ["Personell", "Signsplan", "Bannerplan"];
		for(let idStarts = 100, i = 0, layer; i < 3; i++) {
			layer = {
				"id" : idStarts + i + 1,
				"name" : layersName[i]
			};
			layers.push(layer);
		}
		localStorage.setItem("layer", JSON.stringify(layers));
		layerSet = layers;
	}
}

//Fetches layers from active map and shows on Layer wrapper 
function fetchLayers() {
	let layerList = "#tracker-layer-list";
	$(layerList).empty();
	if(activeMap !== undefined) {
		activeMap.layer.forEach( layer => {
			$(layerList).append(addLayerItem(layer.id, getLayerName(layer.id), layer.active));
		});
		$("li.tracker-layer-item").find('.tracker-layer-name[data-active="1"]').parent().find("input.tracker-layer-status").removeAttr("checked").prop("checked", true);
		$("#tracker-layers-wrapper").removeClass("d-none");
	} else {
		$("#tracker-layers-wrapper").addClass("d-none");
	}
}

//Returns Layer name when layer id is passed to it
function getLayerName(id) {
	let layerName;
	layerSet.forEach( item => {
		if(item.id === id) {
			layerName = item.name;
		}
	});
	return layerName;
}

//Appends layer element to layer wrapper
function addLayerItem(id, name, active) {
	return `<li class="tracker-layer-item">
	<div class="switch__container">
	<span class="tracker-layer-name text__wrap" data-id="${id}" data-active="${active}">${name}</span>
	<span class="switch">
	<label>
	<input class="tracker-layer-status" type="checkbox" ${(active === 1) ? "checked" : ""}>
	<span class="lever"></span>
	</label>
	</span>
	</div>					
	</li>
	`;
}

//Makes Layer wrapper visible if any layer exists
function showLayersCheck() {
	$("#tracker-layer-list li").length !== 0 ? $("#tracker-layers-wrapper").removeClass("d-none") : $("#tracker-layers-wrapper").addClass("d-none");	
}

//Layer Service Methods --end

//Checkpoint Methods --start

function fetchCheckpoints() {
	
}

//Checkpoint Methods --end
function getCurrentLayerSet() {
	let layerList = initialLayers;
	$(".tracker-layer-name").each((index, item) => {
		console.log($(item));
		console.log($(item).data("id"));
		console.log( $(item).data("active"));
		console.log(layerList[layerList.findIndex(x => x.id == $(item).data("id"))].active);
		layerList[layerList.findIndex(x => x.id == $(item).data("id"))].active = $(item).attr("data-active");
	});
	console.log(layerList);
	return layerList;
}

//Main function(executes when DOM has been loaded) - execution starts here
$(document).ready(() => {

	initMaterialize();
	setDefaultLayers();
	fetchMaps();
	initGoogleMap();
	activatePlaceAutocomplete();
	fetchLayers();
	fetchCheckpoints();

	//Event Handlers on Tab 1(Map) --start

	//Fires when input for map title on add map wrapper is changed 
	$("#map-title").change(() => {
		$("#map-title").val() != "" ? $("#map-add").prop("disabled", false) : $("#map-add").prop("disabled", true);
	});

	//Fires when lock position switch on add map wrapper is changed
	$("#tracker-map-lock-position").change(() => {
		$("#tracker-map-lock-position").prop("checked") ? map.setOptions({draggable: false}) : map.setOptions({draggable: true});
	});

	//Fires when an inactive map is switched to active
	$("#tracker-map-list").on("change", '.tracker-map-item input.tracker-map-status[type="checkbox"]', ((event) => {
		$(event.target).prop("disabled", true);
		$("#tracker-layers-wrapper").addClass("d-none");
		$("li.tracker-map-item").find('.tracker-map-name[data-active="1"]').attr("data-active", 0).parent().find("input.tracker-map-status").prop("checked", false).prop("disabled", false);
		$(event.target).parents("div.switch__container").children(".tracker-map-name").attr("data-active", 1);
		setActiveMap();
		initGoogleMap()
		fetchLayers();
		showLayersCheck();
		updateSet("map", getActiveMapId(), "active", 1);
		updateLocalStorage("map");
	}));

	//Shows add map wrapper 
	$("#add-map-btn").click(() => {
		$("#add-map-btn").addClass("d-none");
		$("#tracker-map-lock-position").prop("checked") ? map.setOptions({draggable: false}) : map.setOptions({draggable: true});
		$("#tracker-add-map-wrapper").removeClass("d-none");
		$("#tracker-layers-wrapper").addClass("d-none");
		$("#tracker-map-list").addClass("no-pointer-events");
	});

	//Hides add map wrapper 
	$("#close-addMap-btn").click(() => {
		$("#add-map-btn").removeClass("d-none");
		$("#tracker-add-map-wrapper").addClass("d-none");
		if( activeMap !== undefined) {
			activeMap.draggable ? map.setOptions({draggable: true}) : map.setOptions({draggable: false});
		} else {
			map.setOptions({draggable: true});
		}
		showLayersCheck();
		$("#tracker-map-list").removeClass("no-pointer-events");
	});

	//Fires when a new map is added
	$("#map-add").click(() => {
		if($("#map-title").val() !== "") {
			let oldMapSet, newMapSet = [];
			let newMap = {
				"id" : getUID(),
				"name" : $("#map-title").val(),
				"center" : map.getCenter(),
				"layer" : initialLayers,
				"draggable" : !$("#tracker-map-lock-position").prop("checked"),
				"active" : 1,
				"zoom" : map.getZoom()
			};
			if (typeof(Storage) !== "undefined") {
				if(localStorage.getItem("map")) {
					oldMapSet = JSON.parse(localStorage.getItem("map"));
					oldMapSet.forEach( item => {
						item.active = 0;
						newMapSet.push(item);
					});
					newMapSet.push(newMap);
					localStorage.setItem("map", JSON.stringify(newMapSet));
				} else {
					localStorage.setItem("map", JSON.stringify([newMap]));
				}
			}
		}
		fetchMaps();
		fetchLayers();
		$("#tracker-map-list").removeClass("no-pointer-events");
		$("#tracker-add-map-wrapper").addClass("d-none");
		$("#map-title").val("");
		$("#map-title").blur();
		$("#map-add").prop("disabled", true);
		$("#tracker-map-location-search").val("");
		$("#tracker-map-lock-position").prop("checked", false);
	});

	

	//Fires when status of any layer changes
	$("#tracker-layer-list").on("change", '.tracker-layer-item input.tracker-layer-status[type="checkbox"]', (event) => {
		$("li.tracker-layer-item input.tracker-layer-status").prop("disabled", true);
		//let layers = initialLayers;
		//let targetLayerId = $(event.target).parents("div.switch__container").children(".tracker-layer-name ").data("id");
		// let active = $(event.target).prop("checked");
		$(event.target).prop("checked") ? $(event.target).parents("div.switch__container").children(".tracker-layer-name ").attr("data-active", 1) : $(event.target).parents("div.switch__container").children(".tracker-layer-name").attr("data-active", 0);

		//layers[layers.findIndex(x => x.id == targetLayerId)].active = active ? 1 : 0;
		updateSet("map", getActiveMapId(), "layer", getCurrentLayerSet());
		updateLocalStorage("map");

		// let changeSet;
		// if(key === "map") {
		// 	changeSet = mapSet;
		// }
		// changeItemIndex = changeSet.findIndex(x => x.id == id);
		// if(itemKey === "active") {
		// 	changeSet.map(x => x.active = 0);
		// }
		// changeSet[changeItemIndex][itemKey] = value;
		// mapSet = changeSet;
		// $(event.target).prop("checked") ? $(event.target).data("active", 1) : $(event.target).data("active", 0);
		// $(event.target).prop("checked") ? console.log("true") : console.log("false");
		//updateMap('layer', $(event.target).prop("checked"), $(event.target).closest(".tracker-map-name").data("id"));
		// if($(event.target).prop("checked")){
		// 	$('.tracker-map-item input[data-active="0"]').prop("checked", false);
		// }
		// $(event.target).prop("disabled", true);
		// $("#tracker-layers-wrapper").addClass("d-none");
		// $("li.tracker-map-item").find('.tracker-map-name[data-active="1"]').attr("data-active", 0).parent().find("input.tracker-map-status").prop("checked", false).prop("disabled", false);
		// $(event.target).parents("div.switch__container").children(".tracker-map-name").attr("data-active", 1);
		// setActiveMap();
		// initGoogleMap()
		// fetchLayers();
		// showLayersCheck();
		// updateSet("map", getActiveMapId(), "active", 1);
		// updateLocalStorage("map");
		$("li.tracker-layer-item input.tracker-layer-status").prop("disabled", false);
	});

	//Event Handlers on Tab 1(Map) --end


	//Event Handlers on Tab 2(Track) --start

	function addCheckpoint() {
		$("#tracker-cp-addBtn").addClass("d-none");
		$("#tracker-cp-loc, #add-checkpoint-wrapper").removeClass("d-none");
		currentMarkerCount = markers.length;
		activateMarkerSelection("checkpoint");
	}

	//Event Handlers on Tab 2(Track) --end
	$("#cp-title").change(function() {
		$("#cp-title").val() !== "" && $("#cp-type").val() !== null  && (currentMarkerCount + 1) == markers.length ? $("#cp-add").prop("disabled", false) : $("#cp-add").prop("disabled", true);
	});
	// $("#cp-type").change(function() {
	// 	$("#cp-type").val() !== null && $("#cp-title").val() !== "" ? $("#cp-location").prop("disabled", false) : $("#cp-location").prop("disabled", true);
	// });
	// $("#cp-location").click(() => {
	// 	console.log("dabaa");
	// 	$("#cp-add").prop("disabled", false);
	// 	currentMarkerCount = markers.length;
	// 	activateMarkerSelection("checkpoint");
	// });
	$("#cp-add").click(() => {
		currentCpTitle = $("#cp-title").val();
		if($("#cp-title").val() !== "") {
			let newCp, storedCps, newData = [];
			if (typeof(Storage) !== "undefined") {
				if(localStorage.getItem("checkpoint")) {
					storedCps = JSON.parse(localStorage.getItem("checkpoint"));
					storedCps.forEach( item => {
						newData.push(item);
					});
					newCp = {
						"id" : getUID(),
						"name" : currentCpTitle,
						"map" : getActiveMapId(),
						"center" : markers[markers.length-1].getPosition(),
						"type" : $("#cp-type").val()
					};
					//newData.push(storedMap);
					newData.push(newCp);
					localStorage.setItem("checkpoint", JSON.stringify(newData));
				} else {
					newCp = [{
						"id" : getUID(),
						"name" : currentCpTitle,
						"map" : getActiveMapId(),
						"center" : markers[markers.length-1].getPosition(),
						"type" : $("#cp-type").val()
					}];
					localStorage.setItem("checkpoint", JSON.stringify(newCp));
				}
			}
		}
		//fetchMaps();
		//$("#tracker-add-map-wrapper").addClass("d-none");
		
		//google.maps.event.removeListener(markerListener);
		clearAllListeners();
		$("#checkpoints-tally").text((parseInt($("#checkpoints-tally").text()) + 1));
		$("#checkpoints-list-wrapper").append(
			`<div class="checkpoint-box">
			<div class="checkpoint-icon">
			<div class="checkpoint-tag"></div>
			</div>
			<div class="checkpoint-info-wrapper">
			<div id="${markers[markers.length-1].html.substr(14,10)}" class="checkpoint-name">${currentCpTitle}</div>
			<div class="checkpoint-coordinates">
			${markers[markers.length-1].getPosition().lat().toFixed(3)} - ${markers[markers.length-1].getPosition().lng().toFixed(3)}
			</div>
			</div>
			</div>`);
		$("#cp-title").val("");
		$('#cp-type').material_select();
		// $("#cp-location").prop("disabled", true);
		$("#tracker-cp-loc, #add-checkpoint-wrapper").addClass("d-none");
		$("#tracker-cp-addBtn").removeClass("d-none");
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
	

	//To add new Layer to Database
	// $("#layer-add").click(() => {
	// 	if($("#layer-title").val() !== "") {
	// 		let newLayer, storedLayers, newData = [];
	// 		if (typeof(Storage) !== "undefined") {
	// 			if(localStorage.getItem("layer")) {
	// 				storedLayers = JSON.parse(localStorage.getItem("layer"));
	// 				storedLayers.forEach( item => {
	// 					// item.active = 0;
	// 					newData.push(item);
	// 				});
	// 				newLayer = {
	// 					"id" : getUID(),
	// 					"name" : $("#layer-title").val(),
	// 					"active" : 1,
	// 					"map" : getActiveMap()	
	// 				};
	// 				//newData.push(storedMap);
	// 				newData.push(newLayer);
	// 				localStorage.setItem("layer", JSON.stringify(newData));
	// 			} else {
	// 				newLayer = [{
	// 					"id" : getUID(),
	// 					"name" : $("#layer-title").val(),
	// 					"active" : 1,
	// 					"map" : getActiveMap()
	// 				}];
	// 				localStorage.setItem("layer", JSON.stringify(newLayer));
	// 			}
	// 		}
	// 	}
	// 	fetchLayers();
	// 	$("#tracker-add-layer-wrapper").addClass("d-none");
	// });

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


/*
//Commented code - can be used to further extend functionalities --start

function addLayer() {
	if($("#tracker-add-layer-wrapper").hasClass("d-none")) {
		$("#tracker-add-layer-wrapper").removeClass("d-none");
	} else {
		$("#tracker-add-layer-wrapper").addClass("d-none");
	}
}

//Commented code - can be used to further extend functionalities --end
*/