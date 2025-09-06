import 'package:flutter/material.dart';
import '../widgets/sos_button.dart';

class SOSScreen extends StatelessWidget {
  final String userId;

  const SOSScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Emergency SOS"),
        centerTitle: true,
        backgroundColor: Colors.red,
      ),
      body: Center(
        child: SOSButton(userId: userId),
      ),
    );
  }
}
