import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/i18n_service.dart';

class PromotionDialog extends StatefulWidget {
  final int subtotal;
  final PromotionModel? currentPromotion;
  final Function(PromotionModel?) onSelectPromotion;

  const PromotionDialog({
    super.key,
    required this.subtotal,
    required this.currentPromotion,
    required this.onSelectPromotion,
  });

  @override
  State<PromotionDialog> createState() => _PromotionDialogState();
}

class _PromotionDialogState extends State<PromotionDialog> {
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
  List<PromotionModel> _promotions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPromotions();
  }

  Future<void> _loadPromotions() async {
    final list = await ApiService.getPromotions();
    if (mounted) {
      setState(() {
        _promotions = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 440),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Modal Header (Dark bar matching web)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Color(0xFF0B1320),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.card_giftcard, color: Color(0xFF00C292), size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      I18n.t('promotionTitle'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13.5,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                    onPressed: () => Navigator.pop(context),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),

            // Order subtotal info banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: const Color(0xFFF8FAFC),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(
                        '${I18n.t('subtotalPrice')} ',
                        style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
                      ),
                      Text(
                        currencyFormat.format(widget.subtotal),
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                  if (widget.currentPromotion != null)
                    InkWell(
                      onTap: () {
                        widget.onSelectPromotion(null);
                        Navigator.pop(context);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.delete_outline, size: 13, color: Color(0xFFEF4444)),
                            const SizedBox(width: 3),
                            Text(
                              I18n.t('removePromotion'),
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFEF4444)),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Promotions List
            Flexible(
              child: Container(
                constraints: const BoxConstraints(maxHeight: 340),
                child: _isLoading
                    ? const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: Color(0xFF009688))))
                    : _promotions.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.all(24),
                            child: Center(
                              child: Text(
                                I18n.t('noPromotionAvail'),
                                style: const TextStyle(color: Color(0xFF94A3B8)),
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(12),
                            shrinkWrap: true,
                            itemCount: _promotions.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 8),
                            itemBuilder: (context, idx) {
                              final p = _promotions[idx];
                              final isSelected = widget.currentPromotion?.id == p.id;
                              final isEligible = widget.subtotal >= p.minOrder;
                              final discountAmount = p.calculateDiscount(widget.subtotal);

                              return InkWell(
                                onTap: isEligible
                                    ? () {
                                        widget.onSelectPromotion(p);
                                        Navigator.pop(context);
                                      }
                                    : null,
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFFE6F7F5) : Colors.white,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: isSelected
                                          ? const Color(0xFF009688)
                                          : isEligible
                                              ? const Color(0xFFCBD5E1)
                                              : const Color(0xFFE2E8F0),
                                      width: isSelected ? 1.5 : 1,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: isSelected
                                              ? const Color(0xFF009688)
                                              : isEligible
                                                  ? const Color(0xFFE0F2FE)
                                                  : const Color(0xFFF1F5F9),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Icon(
                                          Icons.local_offer_outlined,
                                          size: 18,
                                          color: isSelected
                                              ? Colors.white
                                              : isEligible
                                                  ? const Color(0xFF0284C7)
                                                  : const Color(0xFF94A3B8),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                                  decoration: BoxDecoration(
                                                    color: const Color(0xFF0F172A),
                                                    borderRadius: BorderRadius.circular(4),
                                                  ),
                                                  child: Text(
                                                    p.code,
                                                    style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Expanded(
                                                  child: Text(
                                                    p.name,
                                                    style: TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 12.5,
                                                      color: isEligible ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 3),
                                            Row(
                                              children: [
                                                Text(
                                                  p.type == 'order_discount' || p.type == 'percent'
                                                      ? 'Giảm ${p.discountValue}% (${currencyFormat.format(discountAmount)})'
                                                      : 'Giảm ${currencyFormat.format(p.discountValue)}',
                                                  style: const TextStyle(
                                                    fontSize: 11.5,
                                                    fontWeight: FontWeight.w700,
                                                    color: Color(0xFF009688),
                                                  ),
                                                ),
                                                if (p.minOrder > 0) ...[
                                                  const SizedBox(width: 6),
                                                  Text(
                                                    '• ${I18n.t('minOrderCond')}: ${currencyFormat.format(p.minOrder)}',
                                                    style: TextStyle(
                                                      fontSize: 10.5,
                                                      color: isEligible ? const Color(0xFF64748B) : const Color(0xFFEF4444),
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (isSelected)
                                        const Icon(Icons.check_circle, color: Color(0xFF009688), size: 20)
                                      else if (isEligible)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFE0F2FE),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            I18n.t('choosePromotion'),
                                            style: const TextStyle(color: Color(0xFF0284C7), fontSize: 10.5, fontWeight: FontWeight.bold),
                                          ),
                                        )
                                      else
                                        const Text(
                                          'Chưa đủ điều kiện',
                                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontStyle: FontStyle.italic),
                                        ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Close button
            Padding(
              padding: const EdgeInsets.all(12),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF475569),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    I18n.t('close'),
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

