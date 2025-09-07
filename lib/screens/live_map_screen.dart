import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_compass/flutter_compass.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({Key? key}) : super(key: key);

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> {
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
    FlutterCompass.events?.listen((event) {
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
      duration: const Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          "Live Map",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: Colors.teal,
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
                  width: 60,
                  height: 60,
                  alignment: Alignment.center,
                  child: Transform.rotate(
                    angle: (_currentHeading * math.pi / 180),
                    child: const Icon(
                      Icons.navigation,
                      size: 50,
                      color: Colors.teal,
                    ),
                  ),
                ),
              ]),
            ],
          ),

          /// Safety Badge
          Positioned(
            top: 16,
            left: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.security, color: Colors.teal),
                  const SizedBox(width: 6),
                  Text(
                    "Safety Score: 8.5",
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),

          /// Recenter Button
          Positioned(
            bottom: 100,
            right: 20,
            child: FloatingActionButton(
              onPressed: _recenterMap,
              backgroundColor: Colors.teal,
              child: const Icon(Icons.my_location, color: Colors.white),
            ),
          ),

          /// Quick Actions Bottom Sheet
          // Align(
          //   alignment: Alignment.bottomCenter,
          //   child: Container(
          //     padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          //     decoration: BoxDecoration(
          //       color: Colors.white,
          //       boxShadow: [
          //         BoxShadow(
          //           color: Colors.black.withOpacity(0.15),
          //           blurRadius: 12,
          //           offset: const Offset(0, -3),
          //         ),
          //       ],
          //       borderRadius: const BorderRadius.only(
          //         topLeft: Radius.circular(20),
          //         topRight: Radius.circular(20),
          //       ),
          //     ),
          //     child: Row(
          //       mainAxisAlignment: MainAxisAlignment.spaceAround,
          //       children: [
          //         _buildQuickAction(Icons.map, "Live Map", Colors.teal),
          //         _buildQuickAction(Icons.warning, "Panic", Colors.red),
          //         _buildQuickAction(Icons.route, "Trip", Colors.green),
          //         _buildQuickAction(Icons.lightbulb, "Tips", Colors.orange),
          //       ],
          //     ),
          //   ),
          // ),
        ],
      ),
    );
  }

  Widget _buildQuickAction(IconData icon, String label, Color color) {
    return InkWell(
      onTap: () {
        _showSnackBar("$label feature coming soon!");
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: color.withOpacity(0.1),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
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