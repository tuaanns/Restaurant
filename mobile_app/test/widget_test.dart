import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('Aura POS App loads successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const AuraPosMobileApp());
    expect(find.text('AURA RESTAURANT'), findsOneWidget);
  });
}
