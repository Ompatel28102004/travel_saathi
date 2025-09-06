import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import 'personal_details_screen.dart';
import '../services/auth_services.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late PageController _pageController;

  // Login Controllers
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  // Sign Up Controllers
  final TextEditingController idController = TextEditingController();

  // Form Keys for validation
  final _loginFormKey = GlobalKey<FormState>();
  final _signupFormKey = GlobalKey<FormState>();

  // State variables
  bool isVerifying = false;
  bool isVerified = false;
  bool isLoggingIn = false;
  bool _obscurePassword = true;
  String selectedIDType = 'aadhaar'; // Use lowercase for translation keys
  int currentTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _pageController = PageController();

    _tabController.addListener(() {
      setState(() {
        currentTabIndex = _tabController.index;
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pageController.dispose();
    emailController.dispose();
    passwordController.dispose();
    idController.dispose();
    super.dispose();
  }

  // Email validation
  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'validation_enter_email'.tr();
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'validation_valid_email'.tr();
    }
    return null;
  }

  // Password validation
  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'validation_enter_password'.tr();
    }
    if (value.length < 6) {
      return 'validation_password_length'.tr();
    }
    return null;
  }

  // ID validation based on type
  String? _validateID(String? value) {
    if (value == null || value.isEmpty) {
      return 'validation_enter_id'.tr(namedArgs: {'type': selectedIDType.tr()});
    }

    if (selectedIDType == 'aadhaar') {
      // Aadhaar validation (12 digits)
      if (value.length != 12 || !RegExp(r'^\d{12}$').hasMatch(value)) {
        return 'validation_aadhaar_format'.tr();
      }
    } else if (selectedIDType == 'passport') {
      // Basic passport validation (6-9 alphanumeric characters)
      if (value.length < 6 || value.length > 9 ||
          !RegExp(r'^[A-Z0-9]{6,9}$').hasMatch(value.toUpperCase())) {
        return 'validation_passport_format'.tr();
      }
    }
    return null;
  }

  // Simulate ID verification with realistic checks
  Future<void> verifyID() async {
    if (!_signupFormKey.currentState!.validate()) return;

    setState(() {
      isVerifying = true;
    });

    try {
      // Simulate API call delay
      await Future.delayed(const Duration(seconds: 3));

      // Simulate different verification scenarios
      final idNumber = idController.text;

      // Simulate some IDs being invalid (for demo purposes)
      if (selectedIDType == 'aadhaar' && idNumber == '000000000000') {
        throw Exception('invalid_aadhaar'.tr());
      }
      if (selectedIDType == 'passport' && idNumber.toUpperCase() == 'INVALID') {
        throw Exception('passport_not_found'.tr());
      }

      setState(() {
        isVerifying = false;
        isVerified = true;
      });

      // Show success message
      _showSnackBar('verification_success'.tr(), Colors.green);

      // Haptic feedback
      HapticFeedback.lightImpact();

      // Navigate after a brief delay
      await Future.delayed(const Duration(milliseconds: 1500));

      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PersonalDetailsScreen(
              verifiedID: idController.text,
              idType: selectedIDType,
            ),
          ),
        );
      }
    } catch (e) {
      setState(() {
        isVerifying = false;
        isVerified = false;
      });
      _showSnackBar('${'verification_failed'.tr()}: ${e.toString().replaceAll('Exception: ', '')}', Colors.red);
    }
  }

  // Simulate login with validation
  Future<void> login() async {
    if (!_loginFormKey.currentState!.validate()) return;

    setState(() {
      isLoggingIn = true;
    });

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      // TODO: Replace this with actual API call to get JWT token
      const String mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      // Save login session
      await AuthService.saveLoginSession(
        token: mockJwtToken,
        userName: emailController.text.split('@').first,
        userID: emailController.text,
        idType: 'Login',
      );

      setState(() {
        isLoggingIn = false;
      });

      _showSnackBar('login_success'.tr(), Colors.green);

      Navigator.pushReplacementNamed(
        context,
        '/dashboard',
        arguments: {
          'userName': emailController.text.split('@').first,
          'userID': emailController.text,
          'idType': 'Login',
        },
      );

    } catch (e) {
      setState(() {
        isLoggingIn = false;
      });
      _showSnackBar('login_failed'.tr(), Colors.red);
    }
  }

  void _showSnackBar(String message, Color backgroundColor) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDarkMode
                ? [
              const Color(0xFF1A1A1A),
              const Color(0xFF2D2D2D),
            ]
                : [
              const Color(0xFF667eea),
              const Color(0xFF764ba2),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // App Header with Language Selector
              Container(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    // Language selector row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Spacer(),
                        LanguageSelector(
                          onLanguageChanged: (locale) {
                            context.setLocale(locale);
                          },
                          currentLocale: context.locale,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Logo placeholder - replace with actual logo
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.3), width: 2),
                      ),
                      child: const Icon(
                        Icons.security_outlined,
                        size: 40,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'app_name'.tr(),
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 32,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'app_tagline'.tr(),
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),

              // Main Content Card
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(top: 20),
                  decoration: BoxDecoration(
                    color: theme.scaffoldBackgroundColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Custom Tab Bar
                      Container(
                        margin: const EdgeInsets.all(20),
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(25),
                        ),
                        child: TabBar(
                          controller: _tabController,
                          dividerColor: Colors.transparent,
                          indicator: BoxDecoration(
                            color: theme.primaryColor,
                            borderRadius: BorderRadius.circular(22),
                            boxShadow: [
                              BoxShadow(
                                color: theme.primaryColor.withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          labelColor: Colors.white,
                          unselectedLabelColor: Colors.grey[600],
                          labelStyle: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                          tabs: [
                            Tab(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 20),
                                child: Text('login_tab'.tr()),
                              ),
                            ),
                            Tab(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 20),
                                child: Text('signup_tab'.tr()),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Tab Content
                      Expanded(
                        child: TabBarView(
                          controller: _tabController,
                          children: [
                            _buildLoginTab(),
                            _buildSignUpTab(),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoginTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _loginFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'login_welcome'.tr(),
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'login_message'.tr(),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),

            // Email Field
            _buildInputField(
              controller: emailController,
              label: 'email_label'.tr(),
              icon: Icons.email_outlined,
              validator: _validateEmail,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 20),

            // Password Field
            _buildInputField(
              controller: passwordController,
              label: 'password_label'.tr(),
              icon: Icons.lock_outlined,
              validator: _validatePassword,
              obscureText: _obscurePassword,
              suffixIcon: IconButton(
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
                icon: Icon(
                  _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Forgot Password
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  _showSnackBar('forgot_password_snackbar'.tr(), Colors.orange);
                },
                child: Text('forgot_password'.tr()),
              ),
            ),
            const SizedBox(height: 32),

            // Login Button
            _buildMainButton(
              onPressed: isLoggingIn ? null : login,
              text: 'login_button'.tr(),
              isLoading: isLoggingIn,
              icon: Icons.login,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSignUpTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _signupFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'signup_title'.tr(),
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'signup_message'.tr(),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),

            // ID Type Selector
            Text(
              'select_id_type'.tr(),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildIDTypeButton('aadhaar', Icons.credit_card),
                  ),
                  Expanded(
                    child: _buildIDTypeButton('passport', Icons.travel_explore),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ID Number Field
            _buildInputField(
              controller: idController,
              label: '${selectedIDType.tr()} ${'number'.tr()}',
              icon: selectedIDType == 'aadhaar' ? Icons.credit_card : Icons.travel_explore,
              validator: _validateID,
              keyboardType: selectedIDType == 'aadhaar'
                  ? TextInputType.number
                  : TextInputType.text,
              inputFormatters: selectedIDType == 'aadhaar'
                  ? [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(12),
              ]
                  : [
                FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')),
                LengthLimitingTextInputFormatter(9),
              ],
              helperText: selectedIDType == 'aadhaar'
                  ? 'aadhaar_helper'.tr()
                  : 'passport_helper'.tr(),
            ),
            const SizedBox(height: 32),

            // Verify Button
            _buildMainButton(
              onPressed: (isVerifying || isVerified) ? null : verifyID,
              text: isVerified ? 'verified_button'.tr() : 'verify_button'.tr(),
              isLoading: isVerifying,
              icon: isVerified ? Icons.check_circle : Icons.verified_user,
              backgroundColor: isVerified ? Colors.green : null,
            ),

            if (isVerified) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green[600]),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'verification_redirect'.tr(),
                        style: TextStyle(
                          color: Colors.green[800],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Security Note
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.security, color: Colors.blue[600], size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'security_note'.tr(),
                      style: TextStyle(
                        color: Colors.blue[800],
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIDTypeButton(String type, IconData icon) {
    final isSelected = selectedIDType == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedIDType = type;
          idController.clear();
          isVerified = false;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Theme.of(context).primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : Colors.grey[600],
              size: 18,
            ),
            const SizedBox(width: 8),
            Text(
              type.tr(),
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey[600],
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    bool obscureText = false,
    Widget? suffixIcon,
    String? helperText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: controller,
          validator: validator,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          obscureText: obscureText,
          decoration: InputDecoration(
            labelText: label,
            prefixIcon: Icon(icon),
            suffixIcon: suffixIcon,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Theme.of(context).primaryColor, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.red),
            ),
            filled: true,
            fillColor: Colors.grey[50],
          ),
        ),
        if (helperText != null) ...[
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.only(left: 12),
            child: Text(
              helperText,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildMainButton({
    required VoidCallback? onPressed,
    required String text,
    required IconData icon,
    bool isLoading = false,
    Color? backgroundColor,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor ?? Theme.of(context).primaryColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 2,
          shadowColor: Theme.of(context).primaryColor.withOpacity(0.3),
        ),
        child: isLoading
            ? const SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            color: Colors.white,
            strokeWidth: 2,
          ),
        )
            : Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white),
            const SizedBox(width: 12),
            Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Updated Language Selector for easy_localization
class LanguageSelector extends StatelessWidget {
  final Function(Locale) onLanguageChanged;
  final Locale currentLocale;

  const LanguageSelector({
    super.key,
    required this.onLanguageChanged,
    required this.currentLocale,
  });

  @override
  Widget build(BuildContext context) {
    final supportedLanguages = [
      {'code': 'en', 'name': 'English', 'flag': '🇺🇸'},
      {'code': 'hi', 'name': 'हिंदी', 'flag': '🇮🇳'},
      {'code': 'bn', 'name': 'বাংলা', 'flag': '🇮🇳'},
      {'code': 'as', 'name': 'অসমীয়া', 'flag': '🇮🇳'},
      {'code': 'fr', 'name': 'Français', 'flag': '🇫🇷'},
    ];

    final currentLanguage = supportedLanguages.firstWhere(
          (lang) => lang['code'] == currentLocale.languageCode,
      orElse: () => supportedLanguages.first,
    );

    return GestureDetector(
      onTap: () {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('select_language'.tr()),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            content: SizedBox(
              width: double.maxFinite,
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: supportedLanguages.length,
                itemBuilder: (context, index) {
                  final language = supportedLanguages[index];
                  final isSelected = language['code'] == currentLocale.languageCode;

                  return ListTile(
                    leading: Text(
                      language['flag']!,
                      style: const TextStyle(fontSize: 24),
                    ),
                    title: Text(
                      language['name']!,
                      style: TextStyle(
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? Theme.of(context).primaryColor : null,
                      ),
                    ),
                    trailing: isSelected ? Icon(
                      Icons.check_circle,
                      color: Theme.of(context).primaryColor,
                    ) : null,
                    onTap: () {
                      final newLocale = Locale(language['code']!);
                      onLanguageChanged(newLocale);
                      Navigator.of(context).pop();
                    },
                  );
                },
              ),
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              currentLanguage['flag']!,
              style: const TextStyle(fontSize: 20),
            ),
            const SizedBox(width: 8),
            Text(
              currentLanguage['name']!,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.keyboard_arrow_down,
              color: Colors.white,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}