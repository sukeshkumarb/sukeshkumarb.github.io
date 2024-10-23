$(document).ready(function () {


	for (var i = 0; i < allcontacts.length; i++) {
		var countryItem = '<li id="' + allcontacts[i].country + '">' + allcontacts[i].country + '</li>';
		$("#countrylist-left ul").append(countryItem);
	}

	$("#countrylist-left ul li").click(function (event) {
		var clickedCountryName = event.target.id;
		var filteredArray = allcontacts.filter(function (item) {
			return clickedCountryName == item.country;
		});
		var countriesContacts = filteredArray[0].contacts;

		$(".teammembers-body").empty();

		for (var i = 0; i < countriesContacts.length; i++) {
			var contactMemberHtml =
				'<div class="col-md-3">' +
				'<div class="thumbnail wow bounceIn animated animated" data-wow-delay="0.1s" data-wow-duration="2s" style="visibility: visible; animation-duration: 2s; animation-delay: 0.1s; animation-name: bounceIn;">' +
				'<img src="http://www.wowthemes.net/demo/calypso/img/demo/team1.jpg" alt="">' +
				'<div class="caption">' +
				'<h4>' + countriesContacts[i].name + '</h4>' +
				'<span class="primarycol">' + countriesContacts[i].designation + '</span>' +
				'<p>' +
				'Praesent id metus ante, ut condimentum magna. Nam bibendum, felis eget.<br>' +
				'</p>' +
				'<ul class="social-icons">' +
				'<li><a href="#"><i class="fa fa-linkedin"></i></a></li>' +
				'</ul>' +
				'</div>' +
				'</div>' +
				'</div>';

			$(".teammembers-body").append(contactMemberHtml);
		}

		$("#teamMembersModal").modal();
		$('#teamMembersModal').on('shown.bs.modal', function (e) {
			$(".modal-title").text("Contact Team for " + clickedCountryName);
		});
	});
});

/******************************Book FLip*************************/
var calledFlips = [];
var clickedItemFolderName;
var pagesArray = {
	"VolkswagenKonzern":62,
	"Audi":14,
	"Man":16,
	"PorscheSalzburg":18,
	"PorscheStuttgart":14,
	"Scania":18,
	"Seat":16,
	"Skoda":14,
	"VW":18,
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
	"Seat":"KPMG für Seat",
	"Skoda": "KPMG für Skoda",
	"VW": "KPMG für VW",
	"VWFinancial": "KPMG für VW F5 AG",
	"VWBank": "KPMG für VW Bank GmbH",
	"VWInternationalFinance": "KPMG für Volkswagen International Finance",
	"VWLux": "KPMG für Volkswagen Luxemburg",
	"VWChina": "KPMG für Volkswagen Region China"
}


$(".boxservice1").click(function (event) {
	clickedItemFolderName = event.target.id != "" ? event.target.id : event.target.parentElement.id;

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
		//calledFlips.push(clickedItemFolderName);
		callBookFlip();
	}

	$('.previous').on('click', function () {
		$("#book").turn("previous");
	});

	$('.next').on('click', function () {
		$("#book").turn("next");
	});
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
	var from = "sbatchu@kpmg.com";
	var to = "sbatchu@kpmg.com";
	var body = "Name : " + $("#name").val() + "\n" + $("#message").val() + "\n" + "Phone : " + $("#phone").val() + "\n" + "Email : " + $("#email").val();
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
				'To': { 'results': [to] },
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