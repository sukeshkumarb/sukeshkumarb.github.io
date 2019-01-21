$(document).ready(function () {

	$('#world-map').vectorMap({
		map: 'world_mill',
		hoverOpacity: 0.5,
		backgroundColor: "",
		onRegionClick: function (e, code) {
			showContactDetails(code, "fromMapClick")
		},
		focusOn: {
			x: 0.5,
			y: 0.5,
			scale: 1.2
		},
		hoverColor: 'red',
		zoomOnScroll: true,
		regionStyle: {
			initial: {
				fill: '#ccc'
			},
			hover: {
				fill: "#00338d"
			}
		},
		series: {
			regions: [{
				values: {
					'AR': '#99b6d1',
					'AU': '#99b6d1',
					'BE': '#99b6d1',
					'BR': '#99b6d1',
					'CN': '#99b6d1',
					'DE': '#99b6d1',
					'FI': '#99b6d1',
					'FR': '#99b6d1',
					'NL': '#99b6d1',
					'GB': '#99b6d1',
					'IN': '#99b6d1',
					'IE': '#99b6d1',
					'IT': '#99b6d1',
					'HR': '#99b6d1',
					'MX': '#99b6d1',
					'LU': '#99b6d1',
					'NL': '#99b6d1',
					'AT': '#99b6d1',
					'PL': '#99b6d1',
					'PT': '#99b6d1',
					'RO': '#99b6d1',
					'RU': '#99b6d1',
					'ZA': '#99b6d1',
					'ES': '#99b6d1',
					'SE': '#99b6d1',
					'CZ': '#99b6d1',
					'HU': '#99b6d1',
					'US': '#99b6d1'
				},
				attribute: 'fill'
			}]
		}
	});

	$('#world-map').fadeIn().resize();

	var subMenuItems = ["VW", "Audi", "MAN & Renk", "Porsche Stuttgart", "VW FS & Bank", "Spezialisten"];
	var allcontactslength = allcontacts.length;
	var leftSideLength = Math.ceil(allcontacts.length / 2) + 1;
	var rightSideLength = Math.ceil((allcontacts.length / 2)) + 1;

	for (var i = 0; i < leftSideLength; i++) {
		var countryItem;
		if (subMenuItems.indexOf(allcontacts[i].country) > -1) {
			countryItem = '<li class="sub-country" id="' + allcontacts[i].country + '">' + allcontacts[i].country + '</li>';
		}
		else {
			countryItem = '<li id="' + allcontacts[i].country + '">' + allcontacts[i].country + '</li>';
		}
		$("#countrylist-left ul").append(countryItem);
	}

	for (var i = rightSideLength; i < allcontacts.length; i++) {
		var countryItem;
		if (subMenuItems.indexOf(allcontacts[i].country) > -1) {
			countryItem = '<li class="sub-country" id="' + allcontacts[i].country + '">' + allcontacts[i].country + '</li>';
		}
		else {
			countryItem = '<li id="' + allcontacts[i].country + '">' + allcontacts[i].country + '</li>';
		}
		$("#countrylist-right ul").append(countryItem);
	}

	$("#countrylist-left ul li, #countrylist-right ul li").click(function (event) {
		showContactDetails(event);
	});

	function showContactDetails(event, fromMapClick) {
		var countriesContacts;
		var clickedCountryName

		if (!fromMapClick) {
			clickedCountryName = event.target.id;
			var filteredArray = allcontacts.filter(function (item) {
				return clickedCountryName == item.country;
			});
			countriesContacts = filteredArray[0].contacts;
		} else {
			var filteredArray = allcontacts.filter(function (item) {
				return event == item.countrycode;
			});
			if (filteredArray[0]) {
				countriesContacts = filteredArray[0].contacts;
				clickedCountryName = filteredArray[0].country;
			}
		};

		$(".teammembers-body").empty();


		var countOfContacts = 0;
		var contactMemberHtml = "";
		for (var i = 0; i < countriesContacts.length; i++) {
			var cvStartingIndex = countriesContacts[i].cvlink.indexOf("_");
			var cvLinksubstring
			if(cvStartingIndex < 4){
				cvLinksubstring = countriesContacts[i].cvlink.substr(cvStartingIndex+1,countriesContacts[i].cvlink.length);
			}else{
				cvLinksubstring = countriesContacts[i].cvlink;
			}

			if(countOfContacts % 6 == 0){
				$(".teammembers-body").append('<div class="clearfix"></div>');
			}

			countOfContacts = countOfContacts + 1;
			
			contactMemberHtml = 
				'<div class="col-md-2">' +
				'<div class="thumbnail wow bounceIn animated" data-wow-duration="1s" style="visibility: visible; animation-duration: 1s; animation-name: bounceIn;">' +
				'<img class="profile-picture" src="' + countriesContacts[i].profilepic + '" alt="">' +
				'<div class="caption">' +
				'<h4>' + countriesContacts[i].name + '</h4>' +
				'<span class="primarycol">' + countriesContacts[i].rolle + '</span>' +
				'<span class="primarycol"><p style="font-style:italic; min-height:20px;">' + countriesContacts[i].Gesellschaft + '</p></span><br>' +
				'<span class="primarycol"><a href="tel:' + countriesContacts[i].Tel + '">' + countriesContacts[i].Tel + '</a></span>' +
				'<span class="primarycol"><a href="mailto:' + countriesContacts[i].email + '">' + countriesContacts[i].email + '</a></span><br>' +
				'<span class="primarycol"><a download href="img/CV/' + cvLinksubstring + '.pdf"><span class="cv-icon-span"><img class="cv-icon" title="CV" alt="CV" src="img/cv-icon.png"></img></span></a></span>' +
				'</div>' +
				'</div>' +
				'</div>';

			$(".teammembers-body").append(contactMemberHtml);
		}

		$("#teamMembersModal").modal();
		$('#teamMembersModal').on('shown.bs.modal', function (e) {
			$(".modal-title").text("Kontakt Team für " + clickedCountryName);
		});
	}
});


/******************************Book FLip*************************/
var calledFlips = [];
var clickedItemFolderName;
var pagesArray = {
	"VolkswagenKonzern": 62,
	"Audi": 14,
	"Man": 16,
	"PorscheSalzburg": 18,
	"PorscheStuttgart": 14,
	"Scania": 18,
	"Skoda": 14,
	"Seat": 16,
	"VW": 18,
	"VWFinancial": 18,
	"VWBank": 16,
	"VWInternationalFinance": 12,
	"VWInternationalLux": 12,
	"VWChina": 14
}

var pdfsArray = {
	"VolkswagenKonzern": "KPMG für den Volkswagen Konzern",
	"Audi": "KPMG für Audi",
	"Man": "KPMG für MAN",
	"PorscheSalzburg": "KPMG für Porsche Salzburg",
	"PorscheStuttgart": "KPMG für Porsche Stuttgart",
	"Scania": "KPMG für Scania",
	"Skoda": "KPMG für Skoda",
	"Seat": "KPMG für Seat",
	"VW": "KPMG für VW",
	"VWFinancial": "KPMG für VW F5 AG",
	"VWBank": "KPMG für VW Bank GmbH",
	"VWInternationalFinance": "KPMG für Volkswagen International Finance",
	"VWLux": "KPMG für Volkswagen Luxemburg",
	"VWChina": "KPMG für Volkswagen Region China"
}

$(".boxservice1").click(function (event) {
	clickedItemFolderName = event.target.id != "" ? event.target.id : (event.target.parentElement.id ? event.target.parentElement.id : event.target.parentElement.parentElement.id);

	//$("#book").empty();
	if ($('#book').turn('is')) {
		$('#book').turn('destroy');
		$(window).unbind('keydown');
	}

	var folder = "img/books/" + clickedItemFolderName + "/";
	var fileextension = ".jpg";

	var lengthtoiterate = pagesArray[clickedItemFolderName];
	var pdfName = pdfsArray[clickedItemFolderName];
	var element = document.getElementById("downloadPDF");
	var urlForPdf = folder + pdfName + ".pdf";
	element.setAttribute("href", urlForPdf);

	for (var i = 1; i <= lengthtoiterate; i++) {
		$("#book").append("<div class='page'><img src='" + folder + i + ".jpg" + "'></div>");
	}

	$("#portfolioModal").modal();

});

$('#portfolioModal').on('shown.bs.modal', function (e) {
	if (!$('#book').turn('is')) {
		callBookFlip();
	}
});

$('#portfolioModal').on('hidden.bs.modal', function () {
	$('html, body').animate({
		scrollTop: $("#about").offset().top
	}, 1000);
	$('#book').turn('destroy');
})

function callBookFlip() {

	(function () {
		'use strict';

		var module = {
			ratio: 1.38,
			init: function (id) {
				var me = this;

				// if older browser then don't run javascript
				if (document.addEventListener) {
					this.el = document.getElementById(id);
					this.resize();
					this.plugins();

					// on window resize, update the plugin size
					window.addEventListener('resize', function (e) {
						var size = me.resize();
						$(me.el).turn('size', size.width, size.height);
					});
				}
			},
			resize: function () {
				// reset the width and height to the css defaults
				this.el.style.width = '';
				this.el.style.height = '';

				var width = this.el.clientWidth,
					height = Math.round(width / this.ratio),
					padded = Math.round(document.body.clientHeight * 0.9);

				// if the height is too big for the window, constrain it
				if (height > padded) {
					height = padded;
					width = Math.round(height * this.ratio);
				}

				// set the width and height matching the aspect ratio
				this.el.style.width = width + 'px';
				this.el.style.height = height + 'px';

				return {
					width: width,
					height: height
				};
			},
			plugins: function () {
				// run the plugin
				$(this.el).turn({
					gradients: true,
					acceleration: true
				});
				// hide the body overflow
				//document.body.className = 'hide-overflow';
			}, autoCenter: true,
			acceleration: true,
			start: function (event, pageObject, corner) {
				if (pageObject.next === 1)
					event.preventDefault();
			},
			turning: function (event, page, view) {
				if (page === 1)
					event.preventDefault();
			}
		};
		module.init('book');
	}());

	$('.previous').unbind('click').on('click', function () {
		// var currentPgNo = $("#book").turn("page");
		// var previousPgNo = currentPgNo - 2;
		// $("#book").turn("page", previousPgNo);
		$("#book").turn("previous");
	});

	$('.next').unbind('click').on('click', function (event) {
		// var currentPgNo = $("#book").turn("page");
		// var nextPgNo = currentPgNo + 2;
		// $("#book").turn("page", nextPgNo);
		$("#book").turn("next");
	});

	$("#pageFld").val($("#book").turn("page"));
	$("#book").bind("turned", function (event, page, view) {
		$("#book").turn("page");
		$("#pageFld").val(page);
	});
}



/******************************SEND MAIL*************************/

var serverrelativeURL = "";

function sendEmail() {
	if ($('#email').val().length > 0 && $('#name').val().length > 0 && $('#message').val().length > 0) {
		var spHostUrl = "https://" + window.location.hostname;
		var layoutsRoot = spHostUrl + '/_layouts/15/';

		$.getScript(layoutsRoot + "SP.Runtime.js", function () {
			$.getScript(layoutsRoot + "SP.js", getCurrentContext);
		});
	} else {

	}
}

function getCurrentContext() {
	var ctx = new SP.ClientContext.get_current();
	var site = ctx.get_site();
	ctx.load(site);
	ctx.executeQueryAsync(function (s, a) {
		serverrelativeURL = site.get_url();
		ExecuteOrDelayUntilScriptLoaded(getFormDigest, "core.js");
	});
}

function getFormDigest() {
	$.ajax({
		url: serverrelativeURL + "/_api/contextinfo",
		type: "POST",
		headers: { "Accept": "application/json; odata=verbose" },
		success: function (data) {
			sendEmailInit(data.d.GetContextWebInformation.FormDigestValue);
		},
		error: function (data, errorCode, errorMessage) {
			alert(errorMessage)
		}
	});
}

function sendEmailInit(formDigestValue) {
	var from = "kdanne@kpmg.com";
	var to = ["kdanne@kpmg.com","amodder@kpmg.com","fthiele@kpmg.com"," ahuberstrasser@kpmg.com","wschmal@kpmg.com"];
	var body = "Name : " + $("#name").val() + "\n" + $("#message").val() + "\n" + "Telefon : " + $("#phone").val() + "\n" + "Email : " + $("#email").val();
	var subject = "VW Proposal";

	var urlTemplate = serverrelativeURL + "/_api/SP.Utilities.Utility.SendEmail";
	$.ajax({
		contentType: 'application/json',
		url: urlTemplate,
		type: "POST",
		data: JSON.stringify({
			'properties': {
				'__metadata': { 'type': 'SP.Utilities.EmailProperties' },
				'From': from,
				'To': { 'results': to },
				'Body': body,
				'Subject': subject
			}
		}
		),
		headers: {
			"Accept": "application/json;odata=verbose",
			"content-type": "application/json;odata=verbose",
			"X-RequestDigest": formDigestValue
		},
		success: function (data) {
			$('#email').val("");
			$('#name').val("");
			$('#message').val("");
			$('#phone').val("");
			//$('.alert').show();
			$(".alert").fadeTo(2000, 500).slideUp(500, function () {
				$(".alert").slideUp(500);
			});
		},
		error: function (err) {
			alert(err.responseText);
		}
	});
}