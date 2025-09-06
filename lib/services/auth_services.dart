import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  static const String _userDataKey = 'user_data';
  static const String _loginTimeKey = 'login_time';

  // Save login session
  static Future<void> saveLoginSession({
    required String token,
    required String userName,
    required String userID,
    required String idType,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final loginTime = DateTime.now().millisecondsSinceEpoch;

    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userDataKey, jsonEncode({
      'userName': userName,
      'userID': userID,
      'idType': idType,
    }));
    await prefs.setInt(_loginTimeKey, loginTime);
  }

  // Check if session is valid (within 7 days)
  static Future<bool> isSessionValid() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final loginTime = prefs.getInt(_loginTimeKey);

    if (token == null || loginTime == null) return false;

    final currentTime = DateTime.now().millisecondsSinceEpoch;
    final sessionDuration = currentTime - loginTime;
    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;

    return sessionDuration < sevenDaysInMilliseconds;
  }

  // Get stored user data
  static Future<Map<String, String>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString(_userDataKey);

    if (userDataString == null) return null;

    final userData = jsonDecode(userDataString) as Map<String, dynamic>;
    return {
      'userName': userData['userName'] as String,
      'userID': userData['userID'] as String,
      'idType': userData['idType'] as String,
    };
  }

  // Get stored token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Clear login session (logout)
  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userDataKey);
    await prefs.remove(_loginTimeKey);
  }

  // Refresh token (call this when you get a new token from backend)
  static Future<void> refreshToken(String newToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, newToken);
    // Update login time to extend session
    await prefs.setInt(_loginTimeKey, DateTime.now().millisecondsSinceEpoch);
  }
}