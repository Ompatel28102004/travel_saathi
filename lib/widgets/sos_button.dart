import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class SOSButton extends StatefulWidget {
  final String userId;

  const SOSButton({Key? key, required this.userId}) : super(key: key);

  @override
  State<SOSButton> createState() => _SOSButtonState();
}

class _SOSButtonState extends State<SOSButton> {
  int _tapCount = 0;
  bool _sending = false;

  Future<Position> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) throw Exception("Location services are disabled.");

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception("Location permission denied");
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception("Location permissions are permanently denied.");
    }

    return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
  }

  Future<void> _sendSOS() async {
    try {
      setState(() => _sending = true);

      final position = await _getCurrentLocation();

      final response = await http.post(
        Uri.parse("http://localhost:5000/api/sos"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "userId": widget.userId,
          "location": {"lat": position.latitude, "lng": position.longitude},
        }),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("🚨 SOS Sent Successfully!"),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        throw Exception("Failed to send SOS");
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("⚠️ Error: $e"),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _tapCount = 0;
        _sending = false;
      });
    }
  }

  void _handleTap() {
    if (_sending) return;

    setState(() {
      _tapCount++;
    });

    if (_tapCount == 3) {
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
        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
      )
          : const Text(
        "SOS",
        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }
}
