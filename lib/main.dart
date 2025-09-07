import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/home_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/personal_details_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/live_map_screen.dart';
import 'screens/sos_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  // Load saved language preference
  final prefs = await SharedPreferences.getInstance();
  final langCode = prefs.getString('langCode') ?? 'en';

  runApp(
    EasyLocalization(
      supportedLocales: const [
        Locale('en'), // English
        Locale('hi'), // Hindi
        Locale('as'), // Assamese
        Locale('bn'), // Bengali
        Locale('fr'), // French
      ],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      startLocale: Locale(langCode),
      child: const TravelSaathiApp(),
    ),
  );
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
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      home: const HomeScreen(),
      routes: {
        '/home': (context) => const HomeScreen(),
        '/auth': (context) => const AuthScreen(),
        '/personal-details': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
          return PersonalDetailsScreen(
            verifiedID: args['verifiedID'],
            idType: args['idType'],
          );
        },
        '/dashboard': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
          return TravelSaathiDashboard(
            userName: args['userName'],
            userID: args['userID'],
            idType: args['idType'],
          );
        },
        '/live-map': (context) => const LiveMapScreen(),
        '/sos': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          final userId = args?['userId'] ?? '68bc38b0ffa06a704fa9b1ba';
          return SOSScreen(userId: userId);
        },
      },
    );
  }
}
