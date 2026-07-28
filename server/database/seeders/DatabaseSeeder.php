<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\Flavor;
use App\Models\Inventory;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\Size;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::create([
            'name' => 'SipTrack Owner',
            'email' => 'owner@siptrack.test',
            'password' => Hash::make('password'),
            'role' => 'owner',
        ]);

        $cashier = User::create([
            'name' => 'SipTrack Cashier',
            'email' => 'cashier@siptrack.test',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        $flavors = collect([
            ['name' => 'Classic Milk Tea', 'price' => 49.00, 'cost' => 15.00],
            ['name' => 'Wintermelon', 'price' => 55.00, 'cost' => 18.00],
            ['name' => 'Okinawa', 'price' => 59.00, 'cost' => 20.00],
            ['name' => 'Taro', 'price' => 65.00, 'cost' => 22.00],
            ['name' => 'Matcha', 'price' => 69.00, 'cost' => 25.00],
        ])->map(fn (array $row) => Flavor::create([...$row, 'is_active' => true]));

        $sizes = collect([
            ['name' => 'Small', 'price' => 0.00, 'volume_ml' => 350],
            ['name' => 'Medium', 'price' => 10.00, 'volume_ml' => 500],
            ['name' => 'Large', 'price' => 20.00, 'volume_ml' => 700],
        ])->map(fn (array $row) => Size::create([...$row, 'is_active' => true]));

        $inventoryRows = [
            ['name' => 'Classic Milk Tea Powder', 'category' => 'powder', 'unit' => 'kg', 'quantity' => 25.000, 'reorder_level' => 5.000, 'unit_cost' => 450.00],
            ['name' => 'Wintermelon Powder', 'category' => 'powder', 'unit' => 'kg', 'quantity' => 18.000, 'reorder_level' => 4.000, 'unit_cost' => 480.00],
            ['name' => 'Okinawa Powder', 'category' => 'powder', 'unit' => 'kg', 'quantity' => 15.000, 'reorder_level' => 4.000, 'unit_cost' => 500.00],
            ['name' => 'Taro Powder', 'category' => 'powder', 'unit' => 'kg', 'quantity' => 12.000, 'reorder_level' => 3.000, 'unit_cost' => 520.00],
            ['name' => 'Matcha Powder', 'category' => 'powder', 'unit' => 'kg', 'quantity' => 10.000, 'reorder_level' => 3.000, 'unit_cost' => 650.00],
            ['name' => 'Plastic Cups', 'category' => 'cups', 'unit' => 'pcs', 'quantity' => 1000.000, 'reorder_level' => 200.000, 'unit_cost' => 1.50],
            ['name' => 'Dome Lids', 'category' => 'lids', 'unit' => 'pcs', 'quantity' => 1000.000, 'reorder_level' => 200.000, 'unit_cost' => 0.80],
            ['name' => 'Bubble Straws', 'category' => 'straws', 'unit' => 'pcs', 'quantity' => 1200.000, 'reorder_level' => 250.000, 'unit_cost' => 0.50],
            ['name' => 'Ice Cubes', 'category' => 'ice', 'unit' => 'kg', 'quantity' => 80.000, 'reorder_level' => 15.000, 'unit_cost' => 20.00],
            ['name' => 'White Sugar', 'category' => 'sugar', 'unit' => 'kg', 'quantity' => 40.000, 'reorder_level' => 8.000, 'unit_cost' => 55.00],
            ['name' => 'Filtered Water', 'category' => 'water', 'unit' => 'L', 'quantity' => 200.000, 'reorder_level' => 40.000, 'unit_cost' => 5.00],
            ['name' => 'Brown Sugar Syrup', 'category' => 'syrups', 'unit' => 'L', 'quantity' => 15.000, 'reorder_level' => 3.000, 'unit_cost' => 180.00],
        ];

        $inventory = collect($inventoryRows)->map(fn (array $row) => Inventory::create($row));

        Setting::insert([
            ['key' => 'business_name', 'value' => 'SipTrack', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'tax_rate', 'value' => '0', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'currency', 'value' => 'PHP', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $supplier = Supplier::create([
            'name' => 'Metro Tea Supplies',
            'contact_person' => 'Ana Reyes',
            'phone' => '09171234567',
            'email' => 'ana@metrotea.test',
            'address' => 'Quezon City, Metro Manila',
            'is_active' => true,
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Island Packaging Co.',
            'contact_person' => 'Ben Santos',
            'phone' => '09189876543',
            'email' => 'ben@islandpack.test',
            'address' => 'Pasig City, Metro Manila',
            'is_active' => true,
        ]);

        // Expenses
        Expense::insert([
            ['category' => 'rent', 'description' => 'Shop monthly rent', 'amount' => 15000.00, 'expense_date' => Carbon::now()->startOfMonth()->toDateString(), 'user_id' => $owner->id, 'created_at' => now(), 'updated_at' => now()],
            ['category' => 'electricity', 'description' => 'Electric bill', 'amount' => 3200.00, 'expense_date' => Carbon::now()->subDays(3)->toDateString(), 'user_id' => $owner->id, 'created_at' => now(), 'updated_at' => now()],
            ['category' => 'ice', 'description' => 'Ice delivery', 'amount' => 850.00, 'expense_date' => Carbon::now()->subDays(1)->toDateString(), 'user_id' => $cashier->id, 'created_at' => now(), 'updated_at' => now()],
            ['category' => 'transportation', 'description' => 'Supply pickup', 'amount' => 450.00, 'expense_date' => Carbon::now()->subDays(4)->toDateString(), 'user_id' => $cashier->id, 'created_at' => now(), 'updated_at' => now()],
            ['category' => 'supplies', 'description' => 'Cups and lids restock', 'amount' => 2100.00, 'expense_date' => Carbon::now()->subDays(5)->toDateString(), 'user_id' => $owner->id, 'created_at' => now(), 'updated_at' => now()],
            ['category' => 'miscellaneous', 'description' => 'Store cleaning', 'amount' => 500.00, 'expense_date' => Carbon::now()->subDays(2)->toDateString(), 'user_id' => $cashier->id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Sales (last 14 days)
        $small = $sizes[0];
        $medium = $sizes[1];
        $large = $sizes[2];
        $invoice = 1;

        for ($d = 13; $d >= 0; $d--) {
            $soldAt = Carbon::today()->subDays($d)->setTime(rand(10, 20), rand(0, 59));
            $flavor = $flavors->random();
            $size = collect([$small, $medium, $large])->random();
            $qty = rand(1, 3);
            $unitPrice = (float) $flavor->price + (float) $size->price;
            $unitCost = (float) $flavor->cost;
            $lineTotal = $unitPrice * $qty;
            $lineCost = $unitCost * $qty;
            $lineProfit = $lineTotal - $lineCost;

            $sale = Sale::create([
                'invoice_no' => 'INV-'.str_pad((string) $invoice++, 5, '0', STR_PAD_LEFT),
                'customer_name' => 'Walk-in',
                'user_id' => $d % 2 === 0 ? $cashier->id : $owner->id,
                'subtotal' => $lineTotal,
                'discount' => 0,
                'tax' => 0,
                'total' => $lineTotal,
                'cost_total' => $lineCost,
                'profit' => $lineProfit,
                'payment_method' => collect(['cash', 'gcash', 'maya', 'card'])->random(),
                'payment_status' => 'paid',
                'sold_at' => $soldAt,
            ]);

            SaleItem::create([
                'sale_id' => $sale->id,
                'flavor_id' => $flavor->id,
                'size_id' => $size->id,
                'item_name' => $flavor->name.' - '.$size->name,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'unit_cost' => $unitCost,
                'discount' => 0,
                'line_total' => $lineTotal,
                'line_cost' => $lineCost,
                'line_profit' => $lineProfit,
            ]);

            if ($d % 3 === 0) {
                $flavor2 = $flavors->random();
                $size2 = $medium;
                $qty2 = 2;
                $unitPrice2 = (float) $flavor2->price + (float) $size2->price;
                $unitCost2 = (float) $flavor2->cost;
                $lineTotal2 = $unitPrice2 * $qty2;
                $lineCost2 = $unitCost2 * $qty2;

                $sale2 = Sale::create([
                    'invoice_no' => 'INV-'.str_pad((string) $invoice++, 5, '0', STR_PAD_LEFT),
                    'customer_name' => 'Regular',
                    'user_id' => $cashier->id,
                    'subtotal' => $lineTotal2,
                    'discount' => 0,
                    'tax' => 0,
                    'total' => $lineTotal2,
                    'cost_total' => $lineCost2,
                    'profit' => $lineTotal2 - $lineCost2,
                    'payment_method' => 'cash',
                    'payment_status' => 'paid',
                    'sold_at' => $soldAt->copy()->addHours(1),
                ]);

                SaleItem::create([
                    'sale_id' => $sale2->id,
                    'flavor_id' => $flavor2->id,
                    'size_id' => $size2->id,
                    'item_name' => $flavor2->name.' - '.$size2->name,
                    'quantity' => $qty2,
                    'unit_price' => $unitPrice2,
                    'unit_cost' => $unitCost2,
                    'discount' => 0,
                    'line_total' => $lineTotal2,
                    'line_cost' => $lineCost2,
                    'line_profit' => $lineTotal2 - $lineCost2,
                ]);
            }
        }

        // Purchase orders
        $cups = $inventory->firstWhere('name', 'Plastic Cups');
        $matcha = $inventory->firstWhere('name', 'Matcha Powder');
        $syrup = $inventory->firstWhere('name', 'Brown Sugar Syrup');
        $lids = $inventory->firstWhere('name', 'Dome Lids');

        PurchaseOrder::create([
            'po_number' => 'PO-00001',
            'supplier_id' => $supplier->id,
            'item_name' => 'Matcha Powder restock',
            'inventory_id' => $matcha?->id,
            'quantity' => 5,
            'unit_price' => 650.00,
            'total_price' => 3250.00,
            'status' => 'pending',
            'ordered_at' => null,
            'notes' => 'Urgent — low stock',
            'user_id' => $owner->id,
        ]);

        PurchaseOrder::create([
            'po_number' => 'PO-00002',
            'supplier_id' => $supplier2->id,
            'item_name' => 'Plastic Cups',
            'inventory_id' => $cups?->id,
            'quantity' => 500,
            'unit_price' => 1.50,
            'total_price' => 750.00,
            'status' => 'ordered',
            'ordered_at' => Carbon::now()->subDays(2),
            'notes' => null,
            'user_id' => $owner->id,
        ]);

        PurchaseOrder::create([
            'po_number' => 'PO-00003',
            'supplier_id' => $supplier->id,
            'item_name' => 'Brown Sugar Syrup',
            'inventory_id' => $syrup?->id,
            'quantity' => 10,
            'unit_price' => 180.00,
            'total_price' => 1800.00,
            'status' => 'received',
            'ordered_at' => Carbon::now()->subDays(7),
            'received_at' => Carbon::now()->subDays(4),
            'notes' => 'Received in full',
            'user_id' => $cashier->id,
        ]);

        PurchaseOrder::create([
            'po_number' => 'PO-00004',
            'supplier_id' => $supplier2->id,
            'item_name' => 'Dome Lids',
            'inventory_id' => $lids?->id,
            'quantity' => 500,
            'unit_price' => 0.80,
            'total_price' => 400.00,
            'status' => 'ordered',
            'ordered_at' => Carbon::now()->subDay(),
            'notes' => null,
            'user_id' => $owner->id,
        ]);
    }
}
