//Global variables --start

let defaultMapOptions = {
	center: {lat: 18.5204303, lng:73.85674369999992}, //Location - Pune
	zoom: 14,
	clickableIcons: false,
	disableDefaultUI: true,
	keyboardShortcuts: false,
	zoomControl: true,
	disableDoubleClickZoom: true,
	draggable: true
};
let initialLayers = [{"id":101,"active":1},{"id":102,"active":1},{"id":103,"active":1}];
let newMarkerFlag = false;
let map;
let activeMap;
let checkpointSet, layerSet, mapSet;
let markers = [];
let markerListener;
//let activeLayersSet;

//Global variables --end


//Helper Methods --start

//Returns unique id
function getUID() {
	return Math.random().toFixed(10).toString(36).substr(2, 16);
}

//Updates database
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

//Updates select options for passed elementSelector with new passed options
function setSelectOption(ele, newOptions, selectedOption) {
	if(ele.prop) {
		var options = ele.prop('options');
	}
	else {
		var options = ele.attr('options');
	}
	$('option', ele).remove();
	$.each(newOptions, function(val, text) {
		options[options.length] = new Option(text, val);
	});
	ele.val(selectedOption);
}

//Sets and initializes passed element with passed string
function setTooltip(ele, tooltipText){
	ele.attr("data-tooltip", tooltipText);
	initTooltip(ele);
}

//Helper Methods --end


//Materialize Components Methods --start

//To initialize Materialize components
function initMaterialize() {
	$('#tracker-tabs').tabs({
		swipeable: true,
		onShow: function(tab) { onTabChange(tab); }
	});
	$('.tooltipped').tooltip();
}

//To initialize tooltip for passed element
function initTooltip(ele) {
	ele.tooltip();
}

//To initialize select options for passed element
function initSelect(ele) {
	ele.material_select();
}

//Executes on a tab change
function onTabChange(tab) {
	if(tab[0].attributes.id.value === "tracker-op-2") {
		setCheckpointType();
	} else {
		removeAddCheckpoint();
	}
}

//Materialize Components Methods --end


//GoogleMap Service Methods --start

//Initializes and displays google map 
function initGoogleMap() {
	map = new google.maps.Map(document.getElementById('mapCanvas'), defaultMapOptions);	
	if(activeMap !== undefined) {
		map.setOptions({
			center: {lat: activeMap.center.lat, lng: activeMap.center.lng},
			zoom: activeMap.zoom,
			draggable: activeMap.draggable
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

//Adds marker(checkpoint) on google map at passed location 
function addMarker(location) {
	let markerId = getUID();
	let marker = createHTMLMapMarker({
		latlng: location,
		map: map,
		html: `<div data-id="${markerId}" class="checkpoint-gtag white droppable"></div>`,
		id: markerId
	});
	markers.push(marker);
}

//Activates marker selection - listens for click on google maps and creates custom marker on the clicked location
function activateMarkerSelection() {
	markerListener = map.addListener('click', function(event) {
		removeUnsavedMarker();
		addMarker(event.latLng);
		newMarkerFlag = true;
		checkpointLocked();
	});
};

//Removes unsaved marker(checkpoint) from google map
function removeUnsavedMarker() {
	if(newMarkerFlag === true) {
		markers[markers.length-1].setMap(null);
		markers.pop();
		newMarkerFlag = false;
	}
}

function setMarkers() {
	checkpointSet.forEach( item => {
		if(item.map === getActiveMapId()) {
			let marker = createHTMLMapMarker({
				latlng: new google.maps.LatLng(item.position.lat,item.position.lng),
				map: map,
				html: `<div data-id="${item.id}" class="checkpoint-gtag white droppable"></div>`,
				id: item.id
			});
			markers.push(marker);
		}
	});
}

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
	return layerSet[layerSet.findIndex(x => x.id == id)].name;
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

//Returns current layer settings of the active map
function getCurrentLayerSet() {
	let layerList = JSON.parse(JSON.stringify(initialLayers));
	$(".tracker-layer-name").each((index, item) => {
		layerList[index].active = parseInt($(item).attr("data-active"));
	});
	return layerList;
}

//Layer Service Methods --end


//Checkpoint Methods --start


//Fetches checkpoints from local storage and shows on checkpoint wrapper 
function fetchCheckpoints() {
	let cpList = "#tracker-checkpoint-list";
	$(cpList).empty();
	if (typeof(Storage) !== "undefined") {
		if(localStorage.getItem("checkpoint")) {
			$("#tracker-noCheckpoint-label").addClass("d-none");
			let cps = JSON.parse(localStorage.getItem("checkpoint"));
			checkpointSet = cps;
			checkpointSet.forEach( item => {
				if(item.map === getActiveMapId()) {
					$(cpList).append(addCheckpointItem(item.id, item.name, item.position));
				}
			});
			setMarkers();
			setCheckpointTally();
		} else {
			$("#tracker-noCheckpoint-label").removeClass("d-none");
		}
	}
}

//Sets active map layers on checkpoint type selection
function setCheckpointType() {
	let newOptions = {};
	if(activeMap !== undefined) {
		activeMap.layer.forEach( layer => {
			if(layer.active === 1) {
				newOptions[layer.id] = getLayerName(layer.id);
			}
		});
		setSelectOption($("#cp-type"), newOptions, Object.keys(newOptions)[0]);
		initSelect($("#cp-type"));
	}
}

//Controls visibility of checkpoint save button
function saveCheckpointCheck() {
	$("#cp-title").val() !== "" && $("#cp-type").val() !== null  && newMarkerFlag === true ? $("#cp-add").prop("disabled", false) : $("#cp-add").prop("disabled", true);
}

//Executes when checkpoint(marker) is added on google map
function checkpointLocked() {
	$("#tracker-cp-loc").removeClass("loc-blinker").addClass("prismBlue");
	setTooltip($("#tracker-cp-loc"), "Checkpoint location locked");
	saveCheckpointCheck();
}

//Closes checkpoint add process
function removeAddCheckpoint() {
	if(!$("#add-checkpoint-wrapper").hasClass("d-none")) {
		$("#add-checkpoint-wrapper, #close-addCp-btn").addClass("d-none");
		$("#tracker-cp-loc").removeClass("loc-blinker prismBlue");
		$("#tracker-cp-loc").tooltip("remove");
		$("#add-cp-btn").removeClass("d-none");
		$("#cp-add").prop("disabled", true);
		clearAllListeners();
		removeUnsavedMarker();
	}
}

//Sets checkpoint tally
function setCheckpointTally() {
	$("#checkpoints-tally").text(markers.length);
}

//Appends checkpoint element to checkpoint wrapper
function addCheckpointItem(id, title, position) {
	return `<li class="tracker-checkpoint-item">
	<div class="checkpoint-box">
	<div class="checkpoint-icon">
	<div class="checkpoint-tag"></div>
	</div>
	<div class="checkpoint-info-wrapper">
	<div data-id="${id}" class="checkpoint-name">${title}</div>
	<div class="checkpoint-coordinates">${position.lat.toFixed(3)} - ${position.lng.toFixed(3)}
	</div>
	</div>
	</div>				
	</li>
	`;
}

//Checkpoint Methods --end


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
		fetchCheckpoints();
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
		fetchCheckpoints();
		$("#add-map-btn").removeClass("d-none");
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
		$(event.target).prop("checked") ? $(event.target).parents("div.switch__container").children(".tracker-layer-name ").attr("data-active", 1) : $(event.target).parents("div.switch__container").children(".tracker-layer-name").attr("data-active", 0);
		updateSet("map", getActiveMapId(), "layer", getCurrentLayerSet());
		updateLocalStorage("map");
		$("li.tracker-layer-item input.tracker-layer-status").prop("disabled", false);
	});

	//Event Handlers on Tab 1(Map) --end


	//Event Handlers on Tab 2(Track) --start

	//Fires when input for checkpoint title on add checkpoint wrapper is changed 
	$("#cp-title").change(() => {
		saveCheckpointCheck();
	});

	//Shows add checkpoint wrapper 
	$("#add-cp-btn").click(() => {
		$("#add-cp-btn").addClass("d-none");
		$("#tracker-cp-loc").addClass("loc-blinker");
		setTooltip($("#tracker-cp-loc"), "Waiting for checkpoint location");
		$("#add-checkpoint-wrapper, #close-addCp-btn").removeClass("d-none");
		newMarkerFlag = false;
		activateMarkerSelection();
	});

	//Hides add checkpoint wrapper 
	$("#add-cp-header").on("click", '#close-addCp-btn', (event) => {
		removeAddCheckpoint();
	});

	//Fires when a new checkpoint is added
	$("#cp-add").click(() => {
		let cpSet = [];
		let newCp = {
			"id" : getUID(),
			"name" : $("#cp-title").val(),
			"map" : getActiveMapId(),
			"position" : markers[markers.length-1].getPosition(),
			"layer" : $("#cp-type").val()
		};
		if (typeof(Storage) !== "undefined") {
			if(localStorage.getItem("checkpoint")) {
				cpSet = JSON.parse(localStorage.getItem("checkpoint"));
				cpSet.push(newCp);
				localStorage.setItem("checkpoint", JSON.stringify(cpSet));
			} else {
				localStorage.setItem("checkpoint", JSON.stringify([newCp]));
			}
		}
		fetchCheckpoints();		
		removeAddCheckpoint();
		$("#cp-title").val("");
		$("#cp-title").blur();
	});

	//Event Handlers on Tab 2(Track) --end
	
	//Event Handlers on Tab 3(Rostering/Personell) --start
	//Event Handlers on Tab 3(Rostering/Personell) --end


	//Event Handlers on Tab 4(Signsplan) --start
	//Event Handlers on Tab 4(Signsplan) --end

	//Event Handlers on Tab 5(Bannerplan) --start
	//Event Handlers on Tab 5(Bannerplan) --end

	$(".tracker-sign-icon").click((event) => {
		$(event.target).toggleClass("active");
		$(".tracker-sign-icon").not(event.target).removeClass("active");
	});

	$(".tracker-banner-icon").click((event) => {
		$(event.target).toggleClass("active");
		$(".tracker-banner-icon").not(event.target).removeClass("active");
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


/*
//Commented code - To further extend functionalities --start

	function addLayer() {
		if($("#tracker-add-layer-wrapper").hasClass("d-none")) {
			$("#tracker-add-layer-wrapper").removeClass("d-none");
		} else {
			$("#tracker-add-layer-wrapper").addClass("d-none");
		}
	}

	To add new Layer to Database
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

//Commented code - To further extend functionalities --end
*/