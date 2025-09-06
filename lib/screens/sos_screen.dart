import 'package:flutter/material.dart';
import '../widgets/sos_button.dart'; // ✅ Import your SOS button widget

class SOSScreen extends StatelessWidget {
  const SOSScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Emergency SOS"),
        centerTitle: true,
        backgroundColor: Colors.red,
      ),
      body: const Padding(
        padding: EdgeInsets.all(20),
        child: SOSButton(),
      ),
    );
  }
}
