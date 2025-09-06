import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

class SOSButton extends StatefulWidget {
  const SOSButton({super.key});

  @override
  State<SOSButton> createState() => _SOSButtonState();
}

class _SOSButtonState extends State<SOSButton> {
  int pressCount = 0;
  Timer? pressTimer;
  bool sosActive = false;

  Future<Map<String, dynamic>> _getUserAndLocation() async {
    // get userId from SharedPreferences
    SharedPreferences prefs = await SharedPreferences.getInstance();
    // String? userId = prefs.getString("userId"); 
    String? userId = "68bc3b13f842c2c656f920bb";

    // get current GPS
    Position pos = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    return {
      "userId": userId,
      "lat": pos.latitude,
      "lng": pos.longitude,
    };
  }

  Future<void> _sendSOS() async {
    try {
      debugPrint("Sending SOS...");
      final payload = await _getUserAndLocation();
      debugPrint("Payload: $payload");
      final res = await http.post(
        Uri.parse("http://localhost:5000/api/alert/create"), // backend endpoint
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(payload),
      );

      if (res.statusCode == 201) {
        setState(() {
          sosActive = true;
        });
      }
    } catch (e) {
      debugPrint("Error sending SOS: $e");
    }
  }

  void _handleSOSPress() {
    setState(() => pressCount++);

    pressTimer?.cancel();
    pressTimer = Timer(const Duration(seconds: 2), () {
      if (pressCount >= 3 && !sosActive) {
        _sendSOS();
      }
      setState(() => pressCount = 0);
    });
  }

  @override
  void dispose() {
    pressTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: sosActive
            ? const Text(
          "🚨 SOS Active",
          style: TextStyle(
            color: Colors.red,
            fontSize: 26,
            fontWeight: FontWeight.bold,
          ),
        )
            : GestureDetector(
          onTap: _handleSOSPress,
          child: Container(
            width: 180,
            height: 180,
            decoration: BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.redAccent.withOpacity(0.6),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: const Center(
              child: Text(
                "SOS",
                style: TextStyle(
                  fontSize: 40,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}