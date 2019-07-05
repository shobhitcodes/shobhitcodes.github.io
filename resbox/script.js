var toolbarOptions = [
	[{ 'font': [] }],
	[{ 'size': ['small', false, 'large', 'huge'] }],  
	['bold', 'italic', 'underline', 'strike'],        
	[{ 'color': [] }, { 'background': [] }],  
	['link', 'image'],        
	[{ 'align': [] }, { 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],       
	['clean']                                         
];

if($('#article-content').length){
	var quill = new Quill('#article-content', {
		modules: {
			toolbar: toolbarOptions
		},
		placeholder: 'Skriv innhold',
		theme: 'snow'
	});
}

function initMap() {
    var map = new google.maps.Map(document.getElementById('mapCanvas'), {
        center: {lat: 18.5204303, lng:73.85674369999992},
        zoom: 13
    });
}

$(document).ready(function() {

	$('.nar-select').material_select();

	$('#role-selector').material_select();

	$('.datepicker').pickadate({
		minDate: new Date(),
		close: 'Lukk',
		clear: 'Tøm',
		labelMonthPrev: '&laquo;Forrige',
		labelMonthNext: 'Neste&raquo;',
		today: 'I dag',
		monthsFull: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
		'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
		monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun',
		'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
		weekdaysShort: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
		weekdaysFull: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
		weekdaysLetter: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
		format: 'ddd, mmm dd yyyy',
		firstDay: 1
	});

	$('ul.tabs').tabs({
        swipeable: true
    });
    
	$('.timepicker').pickatime({donetext:"Lukk",cleartext:"Tøm",canceltext:"Avbryt",twelvehour:!1});

});