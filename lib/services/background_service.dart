import 'dart:convert';
import 'dart:developer';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:workmanager/workmanager.dart';

const String TAG = "[TRAVEL_SAATHI_BACKGROUND]";
const String TASK_NAME = "check_user_geofence";

// Replace this with your server IP
const String BASE_URL = "http://10.73.207.72:5000/api/geofence/check-location";

// Hardcoding userId for now
const String USER_ID = "68bc3b13f842c2c656f920bb";

Future<Position> _getCurrentLocation() async {
  bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) throw Exception("Location services are disabled.");

  LocationPermission permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      throw Exception("Location permission denied.");
    }
  }

  if (permission == LocationPermission.deniedForever) {
    throw Exception("Location permissions permanently denied.");
  }

  return await Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.high,
  );
}

Future<void> checkLocationAndSend() async {
  try {
    final position = await _getCurrentLocation();

    log("$TAG Sending location to: $BASE_URL");
    log("$TAG User: $USER_ID | Lat: ${position.latitude} | Lng: ${position.longitude}");

    final response = await http.post(
      Uri.parse(BASE_URL),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "userId": USER_ID,
        "lat": position.latitude,
        "lng": position.longitude,
      }),
    );

    if (response.statusCode == 200) {
      log("$TAG ✅ Success: ${response.body}");
    } else {
      log("$TAG ❌ Error ${response.statusCode}: ${response.body}");
    }
  } catch (e) {
    log("$TAG EXCEPTION: $e");
  }
}

void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    log("$TAG Running background task: $task");

    if (task == TASK_NAME) {
      await checkLocationAndSend();
    }
    return Future.value(true);
  });
}
