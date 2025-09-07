import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import '../services/api_service.dart';

class SOSButton extends StatefulWidget {
  final String userId;

  const SOSButton({Key? key, required this.userId}) : super(key: key);

  @override
  State<SOSButton> createState() => _SOSButtonState();
}

class _SOSButtonState extends State<SOSButton> {
  int _tapCount = 0;
  bool _sending = false;

  /// Debug log prefix for filtering in Logcat
  final String logTag = "[TRAVEL_SAATHI_SOS]";

  Future<Position> _getCurrentLocation() async {
    debugPrint("$logTag Checking location service status...");
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint("$logTag ERROR: Location services are disabled!");
      throw Exception("Location services are disabled.");
    }

    debugPrint("$logTag Checking location permissions...");
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      debugPrint("$logTag Requesting location permissions...");
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint("$logTag ERROR: Location permission denied by user!");
        throw Exception("Location permission denied");
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint("$logTag ERROR: Location permissions permanently denied.");
      throw Exception("Location permissions are permanently denied.");
    }

    debugPrint("$logTag Fetching current GPS location...");
    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    debugPrint(
      "$logTag Current Location: LAT=${position.latitude}, LNG=${position.longitude}",
    );

    return position;
  }

  Future<void> _sendSOS() async {
    try {
      setState(() => _sending = true);

      debugPrint("$logTag === STARTING SOS REQUEST ===");
      debugPrint("$logTag User ID: ${widget.userId}");

      final position = await _getCurrentLocation();

      final url = '${ApiService.baseUrl}/api/alert/create';
      final payload = {
        "userId": widget.userId,
        "location": {
          "lat": position.latitude,
          "lng": position.longitude,
        },
      };

      debugPrint("$logTag Sending POST request to: $url");
      debugPrint("$logTag Request Body: ${jsonEncode(payload)}");

      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/api/alert/create'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "userId": widget.userId,
          "lat": position.latitude,
          "lng": position.longitude,
        }),
      );

      debugPrint("$logTag Response Code: ${response.statusCode}");
      debugPrint("$logTag Raw Response Body: ${response.body}");

      if (response.statusCode == 200) {
        debugPrint("$logTag SOS Triggered Successfully ✅");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("🚨 SOS Sent Successfully!"),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        debugPrint(
            "$logTag ERROR: SOS request failed! Status: ${response.statusCode}, Body: ${response.body}");
        throw Exception("Failed to send SOS");
      }
    } catch (e) {
      debugPrint("$logTag EXCEPTION: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("⚠ Error: $e"),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      debugPrint("$logTag === SOS PROCESS COMPLETED ===");
      setState(() {
        _tapCount = 0;
        _sending = false;
      });
    }
  }

  void _handleTap() {
    if (_sending) {
      debugPrint("$logTag SOS already in progress, ignoring tap.");
      return;
    }

    setState(() {
      _tapCount++;
    });

    debugPrint("$logTag Button tapped $_tapCount times.");

    if (_tapCount == 3) {
      debugPrint("$logTag Triple tap detected! Triggering SOS...");
      _sendSOS();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Tap ${3 - _tapCount} more times to trigger SOS 🚨"),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 1),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _handleTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.red,
        padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 5,
      ),
      child: _sending
          ? const SizedBox(
        width: 24,
        height: 24,
        child:
        CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
      )
          : const Text(
        "SOS",
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}
