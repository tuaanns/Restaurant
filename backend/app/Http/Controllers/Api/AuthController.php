<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Đăng nhập hệ thống POS / Admin
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = trim($request->username);

        // Tìm kiếm theo username hoặc email trong CSDL
        $user = User::where('username', $loginInput)
            ->orWhere('email', $loginInput)
            ->first();

        // Hỗ trợ định dạng terminal như thuhang.pos01 -> thuhang
        if (!$user && str_contains($loginInput, '.')) {
            $baseUsername = explode('.', $loginInput)[0];
            $user = User::where('username', $baseUsername)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Tên đăng nhập hoặc mật khẩu không chính xác!',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản này đã bị tạm khóa, vui lòng liên hệ quản trị viên!',
            ], 403);
        }

        // Tạo Sanctum token
        $token = $user->createToken('pos_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role, // 'admin' hoặc 'cashier'
                'shift' => $user->shift,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * Lấy thông tin user hiện tại
     */
    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Chưa đăng nhập',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'shift' => $user->shift,
                'phone' => $user->phone,
            ]
        ]);
    }

    /**
     * Đăng xuất hệ thống
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất thành công!'
        ]);
    }

    /**
     * Lấy danh sách tài khoản (cho quản trị viên)
     */
    public function getUsers()
    {
        $users = User::select('id', 'name', 'username', 'email', 'role', 'shift', 'phone', 'is_active', 'created_at')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * Tạo tài khoản nhân viên mới (Admin)
     */
    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,cashier',
            'shift' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'shift' => $request->input('shift', 'Ca sáng (07:00 - 15:00)'),
            'phone' => $request->input('phone', ''),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo tài khoản thành công!',
            'user' => $user
        ]);
    }

    /**
     * Import danh sách nhân viên từ Excel / CSV (hàng loạt)
     */
    public function importUsers(Request $request)
    {
        $request->validate([
            'users' => 'required|array',
            'users.*.name' => 'required|string',
        ]);

        $imported = 0;
        $createdUsers = [];
        $usersData = $request->users;

        DB::beginTransaction();
        try {
            foreach ($usersData as $row) {
                $name = trim($row['name'] ?? '');
                if (!$name) continue;

                // Username: nếu trống, tự sinh từ tên slug + số
                $username = !empty($row['username']) ? trim($row['username']) : '';
                if (!$username) {
                    $baseSlug = Str::slug($name, '');
                    $candidate = $baseSlug ?: 'staff';
                    $count = 1;
                    $username = $candidate;
                    while (User::where('username', $username)->exists()) {
                        $username = $candidate . $count;
                        $count++;
                    }
                } else {
                    if (User::where('username', $username)->exists()) {
                        $username = $username . '_' . Str::random(3);
                    }
                }

                // Email: nếu trống, tự sinh theo username@aura.vn
                $email = !empty($row['email']) ? trim($row['email']) : '';
                if (!$email) {
                    $email = $username . '@aura.vn';
                    $count = 1;
                    while (User::where('email', $email)->exists()) {
                        $email = $username . $count . '@aura.vn';
                        $count++;
                    }
                } else {
                    if (User::where('email', $email)->exists()) {
                        $email = Str::before($email, '@') . '_' . Str::random(3) . '@' . Str::after($email, '@');
                    }
                }

                // Password: mặc định 123456 nếu trống
                $password = !empty($row['password']) ? trim($row['password']) : '123456';

                // Role: 'admin' hoặc 'cashier'
                $rawRole = strtolower(trim($row['role'] ?? 'cashier'));
                $role = 'cashier';
                if (in_array($rawRole, ['admin', 'quan tri', 'quản trị', 'quan ly', 'quản lý', 'manager'])) {
                    $role = 'admin';
                }

                $shift = !empty($row['shift']) ? trim($row['shift']) : 'Ca sáng (07:00 - 15:00)';
                $phone = !empty($row['phone']) ? trim($row['phone']) : '';

                $user = User::create([
                    'name' => $name,
                    'username' => $username,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'role' => $role,
                    'shift' => $shift,
                    'phone' => $phone,
                    'is_active' => true,
                ]);

                $createdUsers[] = $user;
                $imported++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi import nhân viên: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "Đã nhập thành công {$imported} nhân viên vào hệ thống!",
            'imported_count' => $imported,
            'users' => $createdUsers
        ]);
    }

    /**
     * Cập nhật thông tin tài khoản nhân viên (Admin)
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản nhân viên!'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:admin,cashier',
            'shift' => 'nullable|string',
            'phone' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $userData = [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'role' => $request->role,
            'shift' => $request->input('shift', $user->shift),
            'phone' => $request->input('phone', ''),
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : $user->is_active,
        ];

        // Nếu có nhập mật khẩu mới thì cập nhật, ngược lại giữ nguyên mật khẩu cũ
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin nhân viên thành công!',
            'user' => $user
        ]);
    }

    /**
     * Xóa tài khoản nhân viên (Admin)
     */
    public function deleteUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản nhân viên cần xóa!'
            ], 404);
        }

        // Không cho phép xóa tài khoản admin gốc
        if ($user->id == 1 || $user->username === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa tài khoản Quản trị viên chính (admin)!'
            ], 400);
        }

        // Không cho phép xóa chính mình nếu trùng ID
        $currentUser = $request->user();
        if ($currentUser && $currentUser->id == $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể tự xóa tài khoản đang đăng nhập!'
            ], 400);
        }

        // Đảm bảo hệ thống còn ít nhất 1 tài khoản Admin
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa vì hệ thống cần ít nhất một Quản trị viên!'
                ], 400);
            }
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa tài khoản nhân viên thành công!'
        ]);
    }
}

