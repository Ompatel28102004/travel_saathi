import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_compass/flutter_compass.dart';

void main() {
  runApp(TravelSaathiApp());
}

class TravelSaathiApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Travel Saathi',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.teal),
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  LatLng? _currentLocation;
  late final MapController _mapController;
  StreamSubscription<Position>? _positionSubscription;
  double _currentHeading = 0;
  bool _isTracking = true;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _initLocationTracking();
    _initCompass();
  }

  /// Initialize location tracking
  Future<void> _initLocationTracking() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      _showSnackBar("Please enable location services!");
      return;
    }

    // Request permission if not granted
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _showSnackBar("Location permission denied!");
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      _showSnackBar("Location permanently denied. Enable it in settings.");
      return;
    }

    // Start tracking user's position
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 5,
      ),
    ).listen((Position position) {
      final updatedLocation = LatLng(position.latitude, position.longitude);

      setState(() {
        _currentLocation = updatedLocation;
      });

      if (_isTracking) {
        _mapController.move(updatedLocation, _mapController.camera.zoom);
      }
    });
  }

  /// Initialize compass for direction tracking
  void _initCompass() {
    FlutterCompass.events!.listen((event) {
      setState(() {
        _currentHeading = event.heading ?? 0;
      });
    });
  }

  /// Recenter the map on user's location
  void _recenterMap() {
    if (_currentLocation != null) {
      _mapController.move(_currentLocation!, 18);
      setState(() {
        _isTracking = true;
      });
    } else {
      _showSnackBar("Current location not available!");
    }
  }

  /// SnackBar helper
  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(message),
      duration: const Duration(seconds: 3),
    ));
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Travel Saathi', style: TextStyle(fontSize: 22)),
        actions: [
          IconButton(
            icon: Icon(
              _isTracking ? Icons.gps_fixed : Icons.gps_off,
              color: Colors.white,
            ),
            onPressed: () {
              setState(() {
                _isTracking = !_isTracking;
              });
              _showSnackBar(
                _isTracking ? "Location tracking ON" : "Location tracking OFF",
              );
            },
          ),
        ],
      ),
      body: _currentLocation == null
          ? const Center(child: CircularProgressIndicator())
          : Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentLocation!,
              initialZoom: 16,
              minZoom: 5,
              maxZoom: 18,
              keepAlive: true,
              cameraConstraint: CameraConstraint.contain(
                bounds: LatLngBounds.fromPoints([
                  LatLng(-90, -180),
                  LatLng(90, 180),
                ]),
              ),
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.pinchZoom |
                InteractiveFlag.drag |
                InteractiveFlag.doubleTapZoom |
                InteractiveFlag.rotate,
              ),
            ),
            children: [
              openStreetMapTileLayer,
              MarkerLayer(markers: [
                Marker(
                  point: _currentLocation!,
                  width: 30,
                  height: 30,
                  alignment: Alignment.center,
                  child: Transform.rotate(
                    angle: (_currentHeading * (3.14159 / 180)), // Convert degrees to radians
                    child: const Icon(
                      Icons.navigation,
                      size: 60,
                      color: Colors.blue,
                    ),
                  ),
                ),
              ]),
            ],
          ),

          /// Recenter Button
          Positioned(
            bottom: 20,
            right: 20,
            child: FloatingActionButton(
              onPressed: _recenterMap,
              backgroundColor: Colors.teal,
              child: const Icon(Icons.my_location, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

/// OpenStreetMap Tile Layer
TileLayer get openStreetMapTileLayer => TileLayer(
  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  userAgentPackageName: 'com.travel.saathi',
);
