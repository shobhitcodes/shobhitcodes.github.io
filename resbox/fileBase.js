$(document).ready(function() {
	$(".home-item").on("click", function(){
		$(".home-item").addClass("d-none");
		$(".static-home-wrap").addClass("d-none");
		$(".child-item").removeClass("d-none");
		$(".file-spot-back").removeClass("d-none");
		$(".file-spot-title-wrap").text($(this).find(".file-base-tag").text());
		$(".file-spot-title-wrap").removeClass("d-none");
	});
	$(".child-item").on("click", function(){
		Materialize.toast($(this).find(".file-base-tag").text() + ' selected!!', 1000)
		setTimeout(function(){
		closeModal();}, 500);
	});
});

function gridView(){
	$(".file-base-item").removeClass("w-100");
	$(".file-base-item").addClass("w-set");
	$(".file-base-content").css('flex-direction', 'row');
	$("#switchGridView").addClass("d-none");
	$("#switchListView").removeClass("d-none");
}

function listView(){
	$(".file-base-item").removeClass("w-set");
	$(".file-base-item").addClass("w-100");
	$(".file-base-content").css('flex-direction', 'column');
	$("#switchListView").addClass("d-none");
	$("#switchGridView").removeClass("d-none");
}

function closeModal(){
	$(".main-wrapper").addClass("d-none");
	$("#showFileBaseWrapper").removeClass("d-none");
}

function openModal(){
	setHome();
	$("#showFileBaseWrapper").addClass("d-none");
	$(".main-wrapper").removeClass("d-none");
}

function setHome(){
	$(".child-item").addClass("d-none");
	$(".file-spot-back").addClass("d-none");
	$(".file-spot-title-wrap").addClass("d-none");
	$(".home-item").removeClass("d-none");
	$(".static-home-wrap").removeClass("d-none");
}