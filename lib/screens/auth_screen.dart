import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'personal_details_screen.dart';

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
  String selectedIDType = 'Aadhaar';
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
      return 'Please enter your email';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  // Password validation
  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your password';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  // ID validation based on type
  String? _validateID(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your $selectedIDType number';
    }

    if (selectedIDType == 'Aadhaar') {
      // Aadhaar validation (12 digits)
      if (value.length != 12 || !RegExp(r'^\d{12}$').hasMatch(value)) {
        return 'Aadhaar number must be 12 digits';
      }
    } else if (selectedIDType == 'Passport') {
      // Basic passport validation (6-9 alphanumeric characters)
      if (value.length < 6 || value.length > 9 ||
          !RegExp(r'^[A-Z0-9]{6,9}$').hasMatch(value.toUpperCase())) {
        return 'Please enter a valid passport number';
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
      if (selectedIDType == 'Aadhaar' && idNumber == '000000000000') {
        throw Exception('Invalid Aadhaar number');
      }
      if (selectedIDType == 'Passport' && idNumber.toUpperCase() == 'INVALID') {
        throw Exception('Passport number not found');
      }

      setState(() {
        isVerifying = false;
        isVerified = true;
      });

      // Show success message
      _showSnackBar('ID Verified Successfully! 🎉', Colors.green);

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
      _showSnackBar('Verification Failed: ${e.toString().replaceAll('Exception: ', '')}', Colors.red);
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

      setState(() {
        isLoggingIn = false;
      });

      _showSnackBar('Login Successful! Welcome back 👋', Colors.green);

      // TODO: Navigate to dashboard
      // Navigator.pushReplacementNamed(context, '/dashboard');

    } catch (e) {
      setState(() {
        isLoggingIn = false;
      });
      _showSnackBar('Login failed. Please check your credentials.', Colors.red);
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
              // App Header
              Container(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
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
                      'Travel Saathi',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 32,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your Smart Travel Companion',
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
                          tabs: const [
                            Tab(
                              child: Padding(
                                padding: EdgeInsets.symmetric(horizontal: 20),
                                child: Text('Login'),
                              ),
                            ),
                            Tab(
                              child: Padding(
                                padding: EdgeInsets.symmetric(horizontal: 20),
                                child: Text('Sign Up'),
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
              'Welcome Back!',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Sign in to continue your journey',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),

            // Email Field
            _buildInputField(
              controller: emailController,
              label: 'Email Address',
              icon: Icons.email_outlined,
              validator: _validateEmail,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 20),

            // Password Field
            _buildInputField(
              controller: passwordController,
              label: 'Password',
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
                  _showSnackBar('Forgot password feature coming soon!', Colors.orange);
                },
                child: const Text('Forgot Password?'),
              ),
            ),
            const SizedBox(height: 32),

            // Login Button
            _buildMainButton(
              onPressed: isLoggingIn ? null : login,
              text: 'Login',
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
              'Create Account',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Verify your identity to get started',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),

            // ID Type Selector
            Text(
              'Select ID Type',
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
                    child: _buildIDTypeButton('Aadhaar', Icons.credit_card),
                  ),
                  Expanded(
                    child: _buildIDTypeButton('Passport', Icons.travel_explore),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ID Number Field
            _buildInputField(
              controller: idController,
              label: '$selectedIDType Number',
              icon: selectedIDType == 'Aadhaar' ? Icons.credit_card : Icons.travel_explore,
              validator: _validateID,
              keyboardType: selectedIDType == 'Aadhaar'
                  ? TextInputType.number
                  : TextInputType.text,
              inputFormatters: selectedIDType == 'Aadhaar'
                  ? [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(12),
              ]
                  : [
                FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')),
                LengthLimitingTextInputFormatter(9),
              ],
              helperText: selectedIDType == 'Aadhaar'
                  ? '12-digit Aadhaar number'
                  : 'Passport number (6-9 characters)',
            ),
            const SizedBox(height: 32),

            // Verify Button
            _buildMainButton(
              onPressed: (isVerifying || isVerified) ? null : verifyID,
              text: isVerified ? 'Verified ✓' : 'Verify & Proceed',
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
                        'ID Verified Successfully!\nRedirecting to personal details...',
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
                      'Your ID will be securely stored using blockchain technology for tamper-proof verification.',
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
              type,
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