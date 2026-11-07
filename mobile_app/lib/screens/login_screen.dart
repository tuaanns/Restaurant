import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';
import '../widgets/flag_widget.dart';
import '../widgets/language_picker_sheet.dart';

class LoginScreen extends StatefulWidget {
  final Function(User) onLoginSuccess;

  const LoginScreen({super.key, required this.onLoginSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController(text: 'admin');
  final _passwordController = TextEditingController(text: 'admin123');
  bool _obscurePassword = true;
  bool _isLoading = false;
  String _errorMsg = '';

  @override
  void initState() {
    super.initState();
    I18n.currentLocale.addListener(_onLocaleChanged);
  }

  @override
  void dispose() {
    I18n.currentLocale.removeListener(_onLocaleChanged);
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  void _quickLogin(String username, String pass) {
    setState(() {
      _usernameController.text = username;
      _passwordController.text = pass;
      _errorMsg = '';
    });
    _handleLogin();
  }

  Future<void> _handleLogin() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      setState(() => _errorMsg = I18n.t('loginEmptyErr'));
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = '';
    });

    try {
      final user = await ApiService.login(username, password);
      if (mounted) {
        widget.onLoginSuccess(user);
      }
    } catch (e) {
      if (mounted) {
        final cleanMsg = e.toString().replaceFirst('Exception: ', '');
        setState(() => _errorMsg = cleanMsg);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentLang = I18n.currentLanguageItem;

    return Scaffold(
      backgroundColor: const Color(0xFF0B1320),
      body: SafeArea(
        child: Stack(
          children: [
            // Main Login Form
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Brand Logo
                      Center(
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFD4AF37), width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(18),
                            child: Image.asset(
                              'assets/images/logo.png',
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Brand Title
                      Text(
                        I18n.t('appName'),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF131F33),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF1E2D4A)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.location_on, size: 13, color: Color(0xFF00C292)),
                              const SizedBox(width: 4),
                              Flexible(
                                child: Text(
                                  I18n.t('branchName'),
                                  style: const TextStyle(
                                    color: Color(0xFF38BDF8),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        I18n.t('loginSubtitle'),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Form Container
                      Container(
                        padding: const EdgeInsets.all(22),
                        decoration: BoxDecoration(
                          color: const Color(0xFF131F33),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF1E2D4A), width: 1),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 16,
                              offset: Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              I18n.t('loginTitle'),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              I18n.t('loginPrompt'),
                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                            ),
                            const SizedBox(height: 16),

                            // Error message
                            if (_errorMsg.isNotEmpty)
                              Container(
                                margin: const EdgeInsets.only(bottom: 14),
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF450A0A),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFF991B1B)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.error_outline, color: Color(0xFFF87171), size: 18),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _errorMsg,
                                        style: const TextStyle(color: Color(0xFFFECACA), fontSize: 11.5),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                            // Username field
                            Text(
                              I18n.t('username'),
                              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _usernameController,
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                              decoration: InputDecoration(
                                prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF009688), size: 20),
                                hintText: I18n.t('usernameHint'),
                                hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 13),
                                filled: true,
                                fillColor: const Color(0xFF0B1422),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: Color(0xFF1E2D4A)),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: Color(0xFF1E2D4A)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: Color(0xFF009688), width: 1.5),
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),

                            // Password field
                            Text(
                              I18n.t('password'),
                              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                              decoration: InputDecoration(
                                prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF009688), size: 20),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                    color: const Color(0xFF64748B),
                                    size: 18,
                                  ),
                                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                ),
                                hintText: I18n.t('passwordHint'),
                                hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 13),
                                filled: true,
                                fillColor: const Color(0xFF0B1422),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: Color(0xFF1E2D4A)),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: Color(0xFF1E2D4A)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: Color(0xFF009688), width: 1.5),
                                ),
                              ),
                              onSubmitted: (_) => _handleLogin(),
                            ),
                            const SizedBox(height: 18),

                            // Login Button
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF009688),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                elevation: 0,
                              ),
                              onPressed: _isLoading ? null : _handleLogin,
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                                    )
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.login_rounded, size: 18),
                                        const SizedBox(width: 8),
                                        Text(
                                          I18n.t('loginBtn'),
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, letterSpacing: 0.5),
                                        ),
                                      ],
                                    ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Quick Account Selector (Vector Material Icons - No Emojis!)
                      Row(
                        children: [
                          const Icon(Icons.bolt_rounded, size: 16, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 6),
                          Text(
                            I18n.t('quickDemo'),
                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      Row(
                        children: [
                          _buildQuickUser(
                            icon: Icons.admin_panel_settings_rounded,
                            iconColor: const Color(0xFFF59E0B),
                            label: I18n.t('adminRole'),
                            onTap: () => _quickLogin('admin', 'admin123'),
                          ),
                          const SizedBox(width: 8),
                          _buildQuickUser(
                            icon: Icons.point_of_sale_rounded,
                            iconColor: const Color(0xFF009688),
                            label: I18n.t('cashierRole'),
                            onTap: () => _quickLogin('thuhang', '123456'),
                          ),
                          const SizedBox(width: 8),
                          _buildQuickUser(
                            icon: Icons.person_outline_rounded,
                            iconColor: const Color(0xFF0284C7),
                            label: I18n.t('serverRole'),
                            onTap: () => _quickLogin('minhtri', '123456'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Top Bar: Language Switcher (Top Right - Highest Z-order in Stack)
            Positioned(
              top: 14,
              right: 16,
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    showLanguagePickerSheet(
                      context,
                      onLanguageChanged: () {
                        if (mounted) setState(() {});
                      },
                    );
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF131F33),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF1E2D4A), width: 1.2),
                      boxShadow: const [
                        BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 2)),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        FlagWidget(
                          code: currentLang.code,
                          size: 20,
                        ),
                        const SizedBox(width: 7),
                        Text(
                          currentLang.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_drop_down, color: Color(0xFF94A3B8), size: 18),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickUser({
    required IconData icon,
    required Color iconColor,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF131F33),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF1E2D4A)),
          ),
          child: Column(
            children: [
              Icon(icon, color: iconColor, size: 16),
              const SizedBox(height: 4),
              Text(
                label,
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
