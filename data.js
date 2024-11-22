var APP_DATA = {
  "scenes": [
    {
      "id": "0-360photoconverter-1",
      "name": "360photoconverter (1)",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1000,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966  // This is 90 degrees in radians
      },
      "linkHotspots": [],
      "infoHotspots": [
        {
          "yaw":  0.05725407858619036,
          "pitch": -0.1287837201847708,
          "title": "Title",
          "text": "Text"
        }
      ]
    }
  ],
  "name": "Project Title",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": true,
    "fullscreenButton": true,    // Enabled fullscreen
    "viewControlButtons": true,   // Enabled view controls
    "zoomControlEnabled": true,   // Added zoom control
    "minFov": 0.523598776,       // ~30 degrees in radians (more zoom in)
    "maxFov": 2.094395102        // ~120 degrees in radians (more zoom out)
  }
};