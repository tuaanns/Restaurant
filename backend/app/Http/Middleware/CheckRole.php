<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // 1. Kiểm tra xác thực (Sanctum)
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu đăng nhập để truy cập tài nguyên này (Unauthenticated).',
            ], 401);
        }

        // 2. Tài khoản bị tạm khóa
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị tạm khóa, vui lòng liên hệ quản trị viên!',
            ], 403);
        }

        // 3. Quản trị viên (admin) có toàn quyền truy cập
        if ($user->role === 'admin') {
            return $next($request);
        }

        // 4. Kiểm tra phân quyền RBAC
        if (!empty($roles)) {
            $allowedRoles = [];
            foreach ($roles as $r) {
                $parts = explode(',', $r);
                foreach ($parts as $p) {
                    $allowedRoles[] = trim($p);
                }
            }

            if (!in_array($user->role, $allowedRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quyền hạn không đủ: Chức danh ' . ($user->role ?? 'nhân viên') . ' không được phép thực hiện chức năng này!',
                ], 403);
            }
        }

        return $next($request);
    }
}
