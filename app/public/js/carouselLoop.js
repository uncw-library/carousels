$('#carousel-slide-1').carousel({
  interval: 10000
});

$('#carousel-slide-2').carousel({ // false until 10 seconds have passed
  interval: 10000
});

$('#carousel-slide-2').carousel('pause')
 setTimeout(function() {
   $('#carousel-slide-2').carousel('cycle');
}, 5000);
