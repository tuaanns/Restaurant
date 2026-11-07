import 'dart:math' as math;
import 'package:flutter/material.dart';

/// FlagWidget — Renders a crisp, circular vector national flag
/// Identical to FlagIcon.jsx on the React web frontend.
class FlagWidget extends StatelessWidget {
  final String code; // 'vi', 'en', 'ko', 'ru', 'zh', 'ja' or 'VN', 'US', 'KR', 'RU'
  final double size;

  const FlagWidget({
    super.key,
    required this.code,
    this.size = 20,
  });

  @override
  Widget build(BuildContext context) {
    final c = code.toLowerCase().trim();

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.black.withOpacity(0.12), width: 0.8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: ClipOval(
        child: CustomPaint(
          size: Size(size, size),
          painter: _FlagPainter(c),
        ),
      ),
    );
  }
}

class _FlagPainter extends CustomPainter {
  final String code;

  _FlagPainter(this.code);

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // 1. VIETNAM (vi / vn)
    if (code == 'vi' || code == 'vn') {
      final bgPaint = Paint()..color = const Color(0xFFDA251D);
      canvas.drawRect(Rect.fromLTWH(0, 0, w, h), bgPaint);

      // Gold 5-point star
      final starPaint = Paint()..color = const Color(0xFFFFFF00)..style = PaintingStyle.fill;
      final starPath = _createStarPath(
        cx: w / 2,
        cy: h / 2,
        outerRadius: w * 0.32,
        innerRadius: w * 0.13,
      );
      canvas.drawPath(starPath, starPaint);
      return;
    }

    // 2. UNITED STATES / ENGLISH (en / us)
    if (code == 'en' || code == 'us') {
      // 13 stripes
      final stripeHeight = h / 7;
      final redPaint = Paint()..color = const Color(0xFFB22234);
      final whitePaint = Paint()..color = Colors.white;

      for (int i = 0; i < 7; i++) {
        canvas.drawRect(
          Rect.fromLTWH(0, i * stripeHeight, w, stripeHeight),
          i.isEven ? redPaint : whitePaint,
        );
      }

      // Blue canton
      final bluePaint = Paint()..color = const Color(0xFF3C3B6E);
      canvas.drawRect(Rect.fromLTWH(0, 0, w * 0.46, h * 0.54), bluePaint);

      // White star dots in canton
      final dotPaint = Paint()..color = Colors.white;
      canvas.drawCircle(Offset(w * 0.15, h * 0.16), w * 0.04, dotPaint);
      canvas.drawCircle(Offset(w * 0.31, h * 0.16), w * 0.04, dotPaint);
      canvas.drawCircle(Offset(w * 0.23, h * 0.28), w * 0.04, dotPaint);
      canvas.drawCircle(Offset(w * 0.15, h * 0.40), w * 0.04, dotPaint);
      canvas.drawCircle(Offset(w * 0.31, h * 0.40), w * 0.04, dotPaint);
      return;
    }

    // 3. SOUTH KOREA (ko / kr)
    if (code == 'ko' || code == 'kr') {
      // White base
      final bgPaint = Paint()..color = Colors.white;
      canvas.drawRect(Rect.fromLTWH(0, 0, w, h), bgPaint);

      final cx = w / 2;
      final cy = h / 2;
      final r = w * 0.26;

      // Taegeuk (Red upper, Blue lower)
      final redPaint = Paint()..color = const Color(0xFFCD2E3A);
      final bluePaint = Paint()..color = const Color(0xFF0047A0);

      // Top semi-circle red
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: r),
        math.pi,
        math.pi,
        true,
        redPaint,
      );
      // Bottom semi-circle blue
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: r),
        0,
        math.pi,
        true,
        bluePaint,
      );

      // Small curves
      canvas.drawCircle(Offset(cx - r / 2, cy), r / 2, redPaint);
      canvas.drawCircle(Offset(cx + r / 2, cy), r / 2, bluePaint);

      // 4 Black Trigrams (simplified subtle bars)
      final barPaint = Paint()
        ..color = const Color(0xFF1E293B)
        ..strokeWidth = w * 0.045
        ..style = PaintingStyle.stroke;

      // Top-left
      canvas.drawLine(Offset(w * 0.14, h * 0.20), Offset(w * 0.26, h * 0.12), barPaint);
      canvas.drawLine(Offset(w * 0.18, h * 0.24), Offset(w * 0.30, h * 0.16), barPaint);

      // Bottom-right
      canvas.drawLine(Offset(w * 0.70, h * 0.84), Offset(w * 0.82, h * 0.76), barPaint);
      canvas.drawLine(Offset(w * 0.74, h * 0.88), Offset(w * 0.86, h * 0.80), barPaint);
      return;
    }

    // 4. RUSSIA (ru)
    if (code == 'ru') {
      final stripeH = h / 3;
      // White top
      canvas.drawRect(Rect.fromLTWH(0, 0, w, stripeH), Paint()..color = Colors.white);
      // Blue middle
      canvas.drawRect(Rect.fromLTWH(0, stripeH, w, stripeH), Paint()..color = const Color(0xFF0039A6));
      // Red bottom
      canvas.drawRect(Rect.fromLTWH(0, stripeH * 2, w, stripeH), Paint()..color = const Color(0xFFD52B1E));
      return;
    }

    // 5. CHINA (zh / cn)
    if (code == 'zh' || code == 'cn') {
      final bgPaint = Paint()..color = const Color(0xFFDE2910);
      canvas.drawRect(Rect.fromLTWH(0, 0, w, h), bgPaint);

      final starPaint = Paint()..color = const Color(0xFFFFDE00)..style = PaintingStyle.fill;
      final starPath = _createStarPath(
        cx: w * 0.32,
        cy: h * 0.35,
        outerRadius: w * 0.18,
        innerRadius: w * 0.08,
      );
      canvas.drawPath(starPath, starPaint);
      return;
    }

    // 6. JAPAN (ja / jp)
    if (code == 'ja' || code == 'jp') {
      canvas.drawRect(Rect.fromLTWH(0, 0, w, h), Paint()..color = Colors.white);
      canvas.drawCircle(Offset(w / 2, h / 2), w * 0.28, Paint()..color = const Color(0xFFBC002D));
      return;
    }

    // Default fallback: Globe blue
    canvas.drawCircle(Offset(w / 2, h / 2), w / 2, Paint()..color = const Color(0xFF1B5E20));
  }

  Path _createStarPath({
    required double cx,
    required double cy,
    required double outerRadius,
    required double innerRadius,
  }) {
    final path = Path();
    const double step = math.pi / 5;
    double angle = -math.pi / 2;

    for (int i = 0; i < 10; i++) {
      final double r = i.isEven ? outerRadius : innerRadius;
      final double x = cx + math.cos(angle) * r;
      final double y = cy + math.sin(angle) * r;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
      angle += step;
    }
    path.close();
    return path;
  }

  @override
  bool shouldRepaint(covariant _FlagPainter oldDelegate) => oldDelegate.code != code;
}

