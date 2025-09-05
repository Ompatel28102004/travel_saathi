import 'package:flutter/material.dart';
import 'screens/auth_screen.dart';
import 'screens/personal_details_screen.dart';

void main() {
  runApp(const TravelSaathiApp());
}

class TravelSaathiApp extends StatelessWidget {
  const TravelSaathiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Travel Saathi',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        scaffoldBackgroundColor: Colors.white,
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
      ),
      home: const AuthScreen(),
      routes: {
        '/auth': (context) => const AuthScreen(),
        '/personal-details': (context) {
          final args =
          ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
          return PersonalDetailsScreen(verifiedID: args['verifiedID'], idType: args['idType']);
        },
      },
    );
  }
}
