(function ($) {
  "use strict";
  $(window).on("load", function () { // makes sure the whole site is loaded
    AOS.init();
    //preloader
    $("#status").fadeOut(); // will first fade out the loading animation
    $("#preloader").delay(450).fadeOut("slow"); // will fade out the white DIV that covers the website.

    //masonry
    $('.grid').masonry({
      itemSelector: '.grid-item'

    });
  });


  $(document).ready(function () {

    //active menu
    $(document).on("scroll", onScroll);

    $('a[href^="#"]').on('click', function (e) {
      e.preventDefault();
      $(document).off("scroll");

      $('a').each(function () {
        $(this).removeClass('active');
      })
      $(this).addClass('active');

      var target = this.hash;
      $target = $(target);
      $('html, body').stop().animate({
        'scrollTop': $target.offset().top + 2
      }, 500, 'swing', function () {
        window.location.hash = target;
        $(document).on("scroll", onScroll);
      });
    });


    //scroll js
    smoothScroll.init({
      selector: '[data-scroll]', // Selector for links (must be a valid CSS selector)
      selectorHeader: '[data-scroll-header]', // Selector for fixed headers (must be a valid CSS selector)
      speed: 500, // Integer. How fast to complete the scroll in milliseconds
      easing: 'easeInOutCubic', // Easing pattern to use
      updateURL: true, // Boolean. Whether or not to update the URL with the anchor hash on scroll
      offset: 0, // Integer. How far to offset the scrolling anchor location in pixels
      callback: function (toggle, anchor) { } // Function to run after scrolling
    });

    //menu
    var bodyEl = document.body,
      content = document.querySelector('.content-wrap'),
      openbtn = document.getElementById('open-button'),
      closebtn = document.getElementById('close-button'),
      isOpen = false;

    function inits() {
      initEvents();
    }

    function initEvents() {
      openbtn.addEventListener('click', toggleMenu);
      if (closebtn) {
        closebtn.addEventListener('click', toggleMenu);
      }

      // close the menu element if the target it´s not the menu element or one of its descendants..
      content.addEventListener('click', function (ev) {
        var target = ev.target;
        if (isOpen && target !== openbtn) {
          toggleMenu();
        }
      });
    }

    function toggleMenu() {
      if (isOpen) {
        classie.remove(bodyEl, 'show-menu');
      }
      else {
        classie.add(bodyEl, 'show-menu');
      }
      isOpen = !isOpen;
    }

    inits();


    //typed js
    $(".typed").typed({
      strings: ["My Name is B.Sukesh", "I'm a Web / UI Developer"],
      typeSpeed: 100,
      backDelay: 900,
      // loop
      loop: true
    });

    //owl carousel
    $('.owl-carousel').owlCarousel({
      autoPlay: 3000, //Set AutoPlay to 3 seconds

      items: 1,
      itemsDesktop: [1199, 1],
      itemsDesktopSmall: [979, 1],
      itemsTablet: [768, 1],
      itemsMobile: [479, 1],

      // CSS Styles
      baseClass: "owl-carousel",
      theme: "owl-theme"
    });

    $('.owl-carousel2').owlCarousel({
      autoPlay: 3000, //Set AutoPlay to 3 seconds

      items: 1,
      itemsDesktop: [1199, 1],
      itemsDesktopSmall: [979, 1],
      itemsTablet: [768, 1],
      itemsMobile: [479, 1],
      autoPlay: false,

      // CSS Styles
      baseClass: "owl-carousel",
      theme: "owl-theme"
    });

    //contact
    $('input').blur(function () {

      // check if the input has any value (if we've typed into it)
      if ($(this).val())
        $(this).addClass('used');
      else
        $(this).removeClass('used');
    });

    //pop up porfolio
    // $('.portfolio-image li a').magnificPopup({
    //   type: 'image',
    //   gallery: {
    //     enabled: true
    //   }
    //   // other options
    // });

    //Skill
    jQuery('.skillbar').each(function () {
      jQuery(this).appear(function () {
        jQuery(this).find('.count-bar').animate({
          width: jQuery(this).attr('data-percent')
        }, 3000);
        var percent = jQuery(this).attr('data-percent');
        jQuery(this).find('.count').html('<span>' + percent + '</span>');
      });
    });





  });


  //header
  function inits() {
    window.addEventListener('scroll', function (e) {
      var distanceY = window.pageYOffset || document.documentElement.scrollTop,
        shrinkOn = 300,
        header = document.querySelector(".for-sticky");
      if (distanceY > shrinkOn) {
        classie.add(header, "opacity-nav");
      } else {
        if (classie.has(header, "opacity-nav")) {
          classie.remove(header, "opacity-nav");
        }
      }
    });
  }

  window.onload = inits();

  //nav-active
  function onScroll(event) {
    var scrollPosition = $(document).scrollTop();
    $('.menu-list a').each(function () {
      var currentLink = $(this);
      var refElement = $(currentLink.attr("href"));
      if (refElement.position().top <= scrollPosition && refElement.position().top + refElement.height() > scrollPosition) {
        $('.menu-list a').removeClass("active");
        currentLink.addClass("active");
      }
      else {
        currentLink.removeClass("active");
      }
    });
  }


})(jQuery);

filterSelection("all") // Execute the function and show all columns
function filterSelection(c) {
  var x, i;
  x = document.getElementsByClassName("portfolio-pane");
  if (c == "all") c = "";
  // Add the "show" class (display:block) to the filtered elements, and remove the "show" class from the elements that are not selected
  for (i = 0; i < x.length; i++) {
    w3RemoveClass(x[i], "show");
    if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
  }
}

// Show filtered elements
function w3AddClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) == -1) {
      element.className += " " + arr2[i];
    }
  }
}

// Hide elements that are not selected
function w3RemoveClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    while (arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);
    }
  }
  element.className = arr1.join(" ");
}

// Add active class to the current button (highlight it)
var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    // current[0].className = current[0].className.replace("active", "");
    // this.className += " active";
    for (var j = 0; j < current.length; j++) {
      if (current[j].tagName == "BUTTON")
        current[j].classList.remove("active");
    }
    this.classList.add("active");
  });
}