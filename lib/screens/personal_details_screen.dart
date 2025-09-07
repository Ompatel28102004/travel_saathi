import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http; // Import http package
// Assuming ApiService is in this path, adjust if it's different
import '../services/api_service.dart';
import 'dashboard_screen.dart';

class PersonalDetailsScreen extends StatefulWidget {
  final String verifiedID;
  final String idType;

  const PersonalDetailsScreen({
    super.key,
    required this.verifiedID,
    required this.idType,
  });

  @override
  State<PersonalDetailsScreen> createState() => _PersonalDetailsScreenState();
}

class _PersonalDetailsScreenState extends State<PersonalDetailsScreen>
    with TickerProviderStateMixin {
  // Controllers
  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
  final TextEditingController nationalityController = TextEditingController();
  final TextEditingController emergencyContactController = TextEditingController();

  // Form key for validation
  final _formKey = GlobalKey<FormState>();

  // State variables
  File? profileImage;
  bool isCreating = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String selectedGender = 'Male';
  DateTime? selectedDateOfBirth;

  // Animation controllers
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  final List<String> genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic));

    _fadeController.forward();
    _slideController.forward();

    // Pre-populate nationality based on ID type
    // Consistent check with how it's used later for aadharNo/passportNo
    if (widget.idType.toLowerCase() == 'aadhaar') {
      nationalityController.text = 'Indian';
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    nameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    nationalityController.dispose();
    emergencyContactController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter your full name';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(value.trim())) {
      return 'Name can only contain letters and spaces';
    }
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your phone number';
    }
    if (widget.idType.toLowerCase() == 'aadhaar') {
      if (!RegExp(r'^[6-9]\d{9}$').hasMatch(value)) {
        return 'Enter a valid 10-digit Indian mobile number';
      }
    } else {
      if (value.length < 7 || value.length > 15) {
        return 'Enter a valid phone number';
      }
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your email';
    }
    final emailRegex = RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a password';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)').hasMatch(value)) {
      return 'Password must contain uppercase, lowercase and number';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != passwordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }

  String? _validateNationality(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter your nationality';
    }
    return null;
  }

  String? _validateEmergencyContact(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter emergency contact number';
    }
    if (value.length < 7 || value.length > 15) {
      return 'Enter a valid emergency contact number';
    }
    return null;
  }

  Future<void> pickImage() async {
    try {
      final picker = ImagePicker();
      final source = await showModalBottomSheet<ImageSource>(
        context: context,
        backgroundColor: Colors.transparent,
        builder: (context) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 50,
                  height: 4,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Select Profile Photo',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.photo_camera, color: Colors.blue),
                  title: const Text('Take Photo'),
                  onTap: () => Navigator.pop(context, ImageSource.camera),
                ),
                ListTile(
                  leading: const Icon(Icons.photo_library, color: Colors.green),
                  title: const Text('Choose from Gallery'),
                  onTap: () => Navigator.pop(context, ImageSource.gallery),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      );

      if (source != null) {
        final pickedFile = await picker.pickImage(
          source: source,
          maxWidth: 800,
          maxHeight: 800,
          imageQuality: 85,
        );
        if (pickedFile != null) {
          setState(() {
            profileImage = File(pickedFile.path);
          });
          _showSnackBar('Profile photo updated successfully!', Colors.green);
        }
      }
    } catch (e) {
      _showSnackBar('Failed to pick image. Please try again.', Colors.red);
    }
  }

  Future<void> _selectDateOfBirth() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 25)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now().subtract(const Duration(days: 365 * 13)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: Theme.of(context).primaryColor,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != selectedDateOfBirth) {
      setState(() {
        selectedDateOfBirth = picked;
      });
    }
  }

  Future<void> createAccount() async {
    if (!_formKey.currentState!.validate()) {
      _showSnackBar('Please fix the errors above', Colors.red);
      return;
    }
    if (selectedDateOfBirth == null) {
      _showSnackBar('Please select your date of birth', Colors.red);
      return;
    }
    if (profileImage == null) {
      _showSnackBar('Please add a profile photo', Colors.orange);
      return;
    }

    setState(() {
      isCreating = true;
    });

    try {
      String apiUrl = '${ApiService.baseUrl}/api/users/register';
      var request = http.MultipartRequest('POST', Uri.parse(apiUrl));

      // Add text fields
      request.fields['name'] = nameController.text.trim();
      request.fields['email'] = emailController.text.trim();
      request.fields['contactNo'] = phoneController.text.trim();
      request.fields['emergencyNo'] = emergencyContactController.text.trim();
      // Backend expects 'passwordHashed'
      request.fields['passwordHashed'] = passwordController.text;
      request.fields['nationality'] = nationalityController.text.trim();
      request.fields['gender'] = selectedGender;
      if (selectedDateOfBirth != null) {
        request.fields['dateOfBirth'] = selectedDateOfBirth!.toIso8601String();
      }

      if (widget.idType.toLowerCase() == 'aadhaar') {
        request.fields['aadharNo'] = widget.verifiedID;
        request.fields['passportNo'] = ''; // Send empty if not applicable
      } else if (widget.idType.toLowerCase() == 'passport') {
        request.fields['passportNo'] = widget.verifiedID;
        request.fields['aadharNo'] = ''; // Send empty if not applicable
      } else {
        request.fields['aadharNo'] = '';
        request.fields['passportNo'] = '';
      }

      // Add image file
      // if (profileImage != null) {
      //   request.files.add(
      //     await http.MultipartFile.fromPath(
      //       'photo', // This 'photo' key must match your backend (multer fieldname)
      //       profileImage!.path,
      //     ),
      //   );
      // }

      _showSnackBar('Registering user...', Colors.blue);
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      setState(() {
        isCreating = false;
      });

      if (response.statusCode == 201) {
        final responseData = json.decode(response.body);
        // You can use responseData['token'] and responseData['user'] if needed

        HapticFeedback.mediumImpact();
        await _showSuccessDialog();

        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => TravelSaathiDashboard(
                userName: responseData['user']?['name'] ?? nameController.text.trim(),
                userID: widget.verifiedID, // or responseData['user']?['id']
                idType: widget.idType,    // or responseData['user']?['idType']
              ),
            ),
          );
        }
      } else {
        final responseData = json.decode(response.body);
        _showSnackBar(
            'Registration failed: ${responseData['message'] ?? response.reasonPhrase}', Colors.red);
      }
    } catch (e) {
      setState(() {
        isCreating = false;
      });
      _showSnackBar('An error occurred: ${e.toString()}', Colors.red);
    }
  }

  Future<void> _showSuccessDialog() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.green[100],
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  color: Colors.green,
                  size: 50,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Welcome to Travel Saathi!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Your account has been created successfully.\nYour blockchain Digital ID: ${widget.verifiedID}',
                style: const TextStyle(fontSize: 16),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                ),
                child: const Text(
                  'Continue',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSnackBar(String message, Color backgroundColor) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3), // Increased duration slightly
      ),
    );
  }

  String _formatDate(DateTime date) {
    return "${date.day}/${date.month}/${date.year}";
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Complete Your Profile',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: theme.primaryColor,
        centerTitle: true,
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SlideTransition(
          position: _slideAnimation,
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeaderSection(),
                  const SizedBox(height: 32),
                  _buildProfilePhotoSection(),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Personal Information'),
                  const SizedBox(height: 16),
                  _buildPersonalInfoFields(),
                  const SizedBox(height: 24),
                  _buildSectionTitle('Contact Information'),
                  const SizedBox(height: 16),
                  _buildContactInfoFields(),
                  const SizedBox(height: 24),
                  _buildSectionTitle('Account Security'),
                  const SizedBox(height: 16),
                  _buildSecurityFields(),
                  const SizedBox(height: 24),
                  _buildSectionTitle('Emergency Contact'),
                  const SizedBox(height: 16),
                  _buildEmergencyContactField(),
                  const SizedBox(height: 32),
                  _buildBlockchainInfoCard(),
                  const SizedBox(height: 32),
                  _buildCreateAccountButton(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Almost There!',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.verified_user, size: 16, color: Colors.blue[600]),
              const SizedBox(width: 6),
              Text(
                '${widget.idType} Verified: ${widget.verifiedID}',
                style: TextStyle(
                  color: Colors.blue[800],
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: Colors.black87,
      ),
    );
  }

  Widget _buildProfilePhotoSection() {
    return Center(
      child: Column(
        children: [
          GestureDetector(
            onTap: pickImage,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Theme.of(context).primaryColor,
                  width: 3,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: CircleAvatar(
                radius: 57,
                backgroundColor: Colors.grey[100],
                backgroundImage: profileImage != null ? FileImage(profileImage!) : null,
                child: profileImage == null
                    ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.camera_alt,
                      size: 30,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Add Photo',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                  ],
                )
                    : null,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Tap to add your profile photo',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalInfoFields() {
    return Column(
      children: [
        _buildInputField(
          controller: nameController,
          label: 'Full Name',
          icon: Icons.person_outline,
          validator: _validateName,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 16),
        InkWell(
          onTap: _selectDateOfBirth,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(12),
              color: Colors.white,
            ),
            child: Row(
              children: [
                Icon(Icons.cake_outlined, color: Colors.grey[600]),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    selectedDateOfBirth == null
                        ? 'Date of Birth'
                        : _formatDate(selectedDateOfBirth!),
                    style: TextStyle(
                      fontSize: 16,
                      color: selectedDateOfBirth == null ? Colors.grey[600] : Colors.black87,
                    ),
                  ),
                ),
                Icon(Icons.calendar_today, color: Colors.grey[400], size: 20),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: selectedGender,
          decoration: InputDecoration(
            labelText: 'Gender',
            prefixIcon: const Icon(Icons.person_outline), // Consider Icons.wc or similar
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          items: genders.map((gender) {
            return DropdownMenuItem(
              value: gender,
              child: Text(gender),
            );
          }).toList(),
          onChanged: (value) {
            setState(() {
              selectedGender = value!;
            });
          },
        ),
        const SizedBox(height: 16),
        _buildInputField(
          controller: nationalityController,
          label: 'Nationality',
          icon: Icons.flag_outlined,
          validator: _validateNationality,
          textCapitalization: TextCapitalization.words,
        ),
      ],
    );
  }

  Widget _buildContactInfoFields() {
    return Column(
      children: [
        _buildInputField(
          controller: phoneController,
          label: widget.idType.toLowerCase() == 'aadhaar' ? 'Mobile Number' : 'Phone Number',
          icon: Icons.phone_outlined,
          validator: _validatePhone,
          keyboardType: TextInputType.phone,
          inputFormatters: widget.idType.toLowerCase() == 'aadhaar'
              ? [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(10),
          ]
              : [
            FilteringTextInputFormatter.allow(RegExp(r'[0-9+\-\s()]')),
            LengthLimitingTextInputFormatter(15),
          ],
          helperText: widget.idType.toLowerCase() == 'aadhaar'
              ? 'Enter 10-digit mobile number'
              : 'Include country code if international',
        ),
        const SizedBox(height: 16),
        _buildInputField(
          controller: emailController,
          label: 'Email Address',
          icon: Icons.email_outlined,
          validator: _validateEmail,
          keyboardType: TextInputType.emailAddress,
        ),
      ],
    );
  }

  Widget _buildSecurityFields() {
    return Column(
      children: [
        _buildInputField(
          controller: passwordController,
          label: 'Create Password',
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
          helperText: 'Must contain uppercase, lowercase, and number',
        ),
        const SizedBox(height: 16),
        _buildInputField(
          controller: confirmPasswordController,
          label: 'Confirm Password',
          icon: Icons.lock_outline,
          validator: _validateConfirmPassword,
          obscureText: _obscureConfirmPassword,
          suffixIcon: IconButton(
            onPressed: () {
              setState(() {
                _obscureConfirmPassword = !_obscureConfirmPassword;
              });
            },
            icon: Icon(
              _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmergencyContactField() {
    return _buildInputField(
      controller: emergencyContactController,
      label: 'Emergency Contact Number',
      icon: Icons.emergency, // Consider Icons.contact_emergency
      validator: _validateEmergencyContact,
      keyboardType: TextInputType.phone,
      helperText: 'This will be used in case of emergencies',
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[0-9+\-\s()]')),
        LengthLimitingTextInputFormatter(15),
      ],
    );
  }

  Widget _buildBlockchainInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.purple[50]!, Colors.blue[50]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.purple[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.security, color: Colors.purple[600], size: 24),
              const SizedBox(width: 8),
              Text(
                'Blockchain Security',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.purple[800],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Your account will be secured with blockchain technology:',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          _buildFeatureItem('🔐', 'Tamper-proof Digital ID'),
          _buildFeatureItem('🌐', 'Decentralized identity verification'),
          _buildFeatureItem('🛡️', 'Enhanced privacy protection'),
          _buildFeatureItem('📱', 'Cross-platform compatibility'),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(String emoji, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[700],
            ),
          ),
        ],
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
    TextCapitalization textCapitalization = TextCapitalization.none,
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
          textCapitalization: textCapitalization,
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
            fillColor: Colors.white,
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

  Widget _buildCreateAccountButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: isCreating ? null : createAccount,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 3,
          shadowColor: Theme.of(context).primaryColor.withOpacity(0.3),
        ),
        child: isCreating
            ? Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Creating Account...',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        )
            : Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.rocket_launch, color: Colors.white),
            const SizedBox(width: 12),
            const Text(
              'Create Travel Saathi Account',
              style: TextStyle(
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

