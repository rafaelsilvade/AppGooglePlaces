    var map;
    var pyrmont = { lat: 0, lng: 0 };

    function initMap() {

      map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 17
      });
      var input = document.getElementById('pac-input123');
      var infowindow = new google.maps.InfoWindow();
      var geocoder = new google.maps.Geocoder();
      var autocomplete = new google.maps.places.Autocomplete(
        input, { placeIdOnly: true });
      autocomplete.bindTo('bounds', map);

      autocomplete.addListener('place_changed', function () {
        infowindow.close();
        var place = autocomplete.getPlace();
        $('#places').empty();
        if (!place.place_id) {
          return;
        }
        geocoder.geocode({ 'placeId': place.place_id }, function (results, status) {

          if (status !== 'OK') {
            window.alert('Geocoder failed due to: ' + status);
            return;
          }
          map.setZoom(11);
          map.setCenter(results[0].geometry.location);

          var marker = new google.maps.Marker({
            map: map,
            title: results[0].name,
            position: results[0].geometry.location
          });
          marker.setPlace({
            placeId: results[0].place_id,
            location: results[0].geometry.location
          });
          marker.setVisible(true);

          busca(results[0].geometry.location);
        });

      });
    }
    function busca(loc) {
      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: loc,
        radius: 1500,
        type: ['car_repair']
      }, processResults);

    }

    function processResults(results, status, pagination) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      } else {
        createMarkers(results);

        if (pagination.hasNextPage) {
          var moreButton = document.getElementById('more');

          moreButton.disabled = false;

          moreButton.addEventListener('click', function () {
            moreButton.disabled = true;
            pagination.nextPage();
          });
        }
      }
    }

    function createMarkers(places) {
      var bounds = new google.maps.LatLngBounds();
      var placesList = document.getElementById('places');
      var infowindow = new google.maps.InfoWindow();
      for (var i = 0, place; place = places[i]; i++) {
        var image = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };


        var service = new google.maps.places.PlacesService(map);
        service.getDetails({ placeId: place.place_id }, function (place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            var marker = new google.maps.Marker({
              map: map,
              icon: image,
              position: place.geometry.location
            });
            google.maps.event.addListener(marker, 'click', function () {
              infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                'Place ID: ' + place.place_id + '<br>' +
                place.formatted_address + '</div>');
              infowindow.open(map, this);
            });
            var img = 'public/img/sem-foto.jpg';
            if (typeof place.photos != "undefined")
              if (place.photos.length >= 0)
                img = place.photos[0].getUrl({ 'maxWidth': 75, 'maxHeight': 85 });

            placesList.innerHTML += '<li>'+
            
           ' <div class="row">'+

            '      <div class="col-md-9">'+
            '        <h3 class="nome">'+place.name+' </h3>'+
            
            '        <span class="rating-text">'+((typeof place.rating != "undefined") ? place.rating : '')+'</span><br/>'+
            '<span class="text-op">'+((typeof place.opening_hours.open_now != "undefined") ? ((place.opening_hours.open_now) ?'Aberto agora':'Fechado agora'): '')+'</span><br/>'+
            '<span class="text-op">'+((typeof place.formatted_phone_number != "undefined") ? place.formatted_phone_number : '')+'</span><br/>'+
             '<span class="text-op">'+((typeof place.website != "undefined") ? place.website : '')+'</span><br/>'+
            '        <span class="text-endereco">'+place.formatted_address+'</span>'+
            '      </div>'+
            '      <div class="col-md-3 text-right"><img src="'+img+'" width="75px" height="75px" /></div>'+
             '   </div>'+
             '</li>';

            
          }

        });


        bounds.extend(place.geometry.location);
      }
      map.fitBounds(bounds);
    }