'use strict';

(function() {
  var Marzipano = window.Marzipano;
  var data = window.APP_DATA;

  var panoElement = document.querySelector('#pano');
  var viewer = new Marzipano.Viewer(panoElement);

  // Add styles for hotspots
  var style = document.createElement('style');
  style.textContent = `
    .hotspot {
      position: relative;
    }

    .info-hotspot-icon-wrapper {
      width: 40px;
      height: 40px;
      position: relative;
      cursor: pointer;
    }

    .outer-circle {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .inner-circle {
      position: absolute;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: white;
      color: black;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin: 5px;
    }

    .info-hotspot-content {
      display: none;
      position: absolute;
      left: 50px;
      top: 0;
      background: rgba(0, 0, 0, 0.85);
      padding: 20px;
      border-radius: 8px;
      min-width: 300px;
      color: white;
      border: 2px solid #444;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    .info-hotspot-title {
      margin: 0 0 5px 0;
      font-size: 24px;
      font-weight: bold;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      text-transform: uppercase;
      color: #fff;
    }

    .info-hotspot-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      font-family: "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #ccc;
    }
  .quest-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #444;
    }
    
    .quest-requirements {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .quest-progress {
      font-size: 14px;
      color: #ffeb3b;
    }
    
    .quest-icon {
      width: 24px;
      height: 24px;
      background: #555;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
      `;
  document.head.appendChild(style);

  var urlPrefix = "tiles";
  var source = Marzipano.ImageUrlSource.fromString(
    urlPrefix + "/0-360photoconverter-1/{z}/{f}/{y}/{x}.jpg",
    { cubeMapPreviewUrl: urlPrefix + "/0-360photoconverter-1/preview.jpg" }
  );

  var geometry = new Marzipano.CubeGeometry([{
    tileSize: 256,
    size: 256,
    fallbackOnly: true
  }, {
    tileSize: 512,
    size: 512
  }, {
    tileSize: 512,
    size: 1024
  }]);

  // Zoom configuration
  var zoomLevel = 1.0;
  var MIN_ZOOM = 1.0;
  var MAX_ZOOM = 1.772;
  var elasticZoom = 0;
  var isAnimating = false;

  // Tweaked elastic effect parameters
  var ELASTIC_STRENGTH = 0.015;
  var ELASTIC_MAX = 0.05;
  var SPRING_BACK = 0.92;
  var ANIMATION_THRESHOLD = 0.0001;

  var view = new Marzipano.RectilinearView({
    pitch: 0,
    yaw: 0,
    fov: 2.0
  });

  var scene = viewer.createScene({
    source: source,
    geometry: geometry,
    view: view,
    pinFirstLevel: true
  });

  // Add coordinate finder
  panoElement.addEventListener('click', function(e) {
    var coords = viewer.view().screenToCoordinates({x: e.clientX, y: e.clientY});
    console.log('Coordinates:', {
      yaw: coords.yaw,
      pitch: coords.pitch
    });
  });

  function createInfoHotspotElement(hotspot) {
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    var iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    
    var outerCircle = document.createElement('div');
    outerCircle.classList.add('outer-circle');
    
    var innerCircle = document.createElement('div');
    innerCircle.classList.add('inner-circle');
    innerCircle.textContent = hotspot.number || '1';
    
    iconWrapper.appendChild(outerCircle);
    iconWrapper.appendChild(innerCircle);

    var contentCard = document.createElement('div');
    contentCard.classList.add('info-hotspot-content');

    var title = document.createElement('h2');
    title.classList.add('info-hotspot-title');
    title.textContent = hotspot.title;

    var text = document.createElement('p');
    text.classList.add('info-hotspot-text');
    text.textContent = hotspot.text;

    contentCard.appendChild(title);
    contentCard.appendChild(text);

    wrapper.appendChild(iconWrapper);
    wrapper.appendChild(contentCard);

    var isVisible = false;
    wrapper.addEventListener('click', function() {
      isVisible = !isVisible;
      contentCard.style.display = isVisible ? 'block' : 'none';
    });

    return wrapper;
  }

  // Create hotspots
  data.scenes[0].infoHotspots.forEach(function(hotspot) {
    var element = createInfoHotspotElement(hotspot);
    scene.hotspotContainer().createHotspot(element, { 
      yaw: hotspot.yaw, 
      pitch: hotspot.pitch 
    });
  });

  scene.switchTo();

  function applyElasticZoom() {
    if (Math.abs(elasticZoom) < ANIMATION_THRESHOLD) {
      elasticZoom = 0;
      isAnimating = false;
      return;
    }

    elasticZoom *= SPRING_BACK;
    
    var baseZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel));
    var effectiveZoom = baseZoom + elasticZoom;
    view.setFov(2.0 / effectiveZoom);

    if (isAnimating) {
      requestAnimationFrame(applyElasticZoom);
    }
  }

  function updateZoom(delta) {
    if (delta < 0) {
      zoomLevel = Math.min(zoomLevel * 1.1, MAX_ZOOM);
      if (zoomLevel >= MAX_ZOOM) {
        elasticZoom = Math.min(elasticZoom + ELASTIC_STRENGTH, ELASTIC_MAX);
      }
    } else {
      zoomLevel = Math.max(zoomLevel / 1.1, MIN_ZOOM);
      if (zoomLevel <= MIN_ZOOM) {
        elasticZoom = Math.max(elasticZoom - ELASTIC_STRENGTH, -ELASTIC_MAX);
      }
    }

    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(applyElasticZoom);
    }
  }

  var wheelTimeout;
  var lastWheelTime = 0;
  var WHEEL_DELAY = 50;

  panoElement.addEventListener('wheel', function(e) {
    e.preventDefault();
    
    var now = Date.now();
    if (now - lastWheelTime < WHEEL_DELAY) {
      return;
    }
    lastWheelTime = now;
    
    if ((zoomLevel >= MAX_ZOOM && e.deltaY < 0) || 
        (zoomLevel <= MIN_ZOOM && e.deltaY > 0)) {
      updateZoom(e.deltaY);
      return;
    }
    
    clearTimeout(wheelTimeout);
    updateZoom(e.deltaY);
    
    wheelTimeout = setTimeout(function() {
      elasticZoom = 0;
    }, 200);
  }, { passive: false });

  var zoomInButton = document.getElementById('viewIn');
  var zoomOutButton = document.getElementById('viewOut');

  if (zoomInButton) {
    zoomInButton.addEventListener('click', function() {
      updateZoom(-1);
    });
  }

  if (zoomOutButton) {
    zoomOutButton.addEventListener('click', function() {
      updateZoom(1);
    });
  }

})();