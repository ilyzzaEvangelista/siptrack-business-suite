<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\FlavorController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::get('/sales/{sale}', [SaleController::class, 'show']);

    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::put('/inventory/{inventory}', [InventoryController::class, 'update']);
    Route::post('/inventory/{inventory}/adjust', [InventoryController::class, 'adjust']);
    Route::delete('/inventory/{inventory}', [InventoryController::class, 'destroy']);

    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);

    Route::get('/reports/summary', [ReportController::class, 'summary']);

    Route::get('/analytics/revenue-chart', [AnalyticsController::class, 'revenueChart']);
    Route::get('/analytics/profit-chart', [AnalyticsController::class, 'profitChart']);
    Route::get('/analytics/best-sellers', [AnalyticsController::class, 'bestSellers']);
    Route::get('/analytics/slow-moving', [AnalyticsController::class, 'slowMoving']);
    Route::get('/analytics/inventory-usage', [AnalyticsController::class, 'inventoryUsage']);

    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);

    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
    Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
    Route::post('/purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive']);

    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);

    Route::get('/flavors', [FlavorController::class, 'index']);
    Route::post('/flavors', [FlavorController::class, 'store']);
    Route::put('/flavors/{flavor}', [FlavorController::class, 'update']);

    Route::get('/sizes', [SizeController::class, 'index']);
    Route::post('/sizes', [SizeController::class, 'store']);
    Route::put('/sizes/{size}', [SizeController::class, 'update']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
});
