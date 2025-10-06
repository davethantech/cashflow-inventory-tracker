exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('phone_number').notNullable().unique();
      table.string('business_name');
      table.string('business_type');
      table.string('currency').defaultTo('NGN');
      table.string('language').defaultTo('en');
      table.boolean('is_premium').defaultTo(false);
      table.timestamp('premium_expires_at');
      table.timestamps(true, true);
    })
    .createTable('products', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('sku').unique();
      table.text('description');
      table.decimal('cost_price', 15, 2).notNullable();
      table.decimal('selling_price', 15, 2).notNullable();
      table.integer('current_stock').defaultTo(0);
      table.integer('minimum_stock').defaultTo(5);
      table.string('category');
      table.string('unit');
      table.boolean('track_stock').defaultTo(true);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable('sales', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('transaction_id').unique();
      table.decimal('total_amount', 15, 2).notNullable();
      table.decimal('amount_paid', 15, 2).notNullable();
      table.decimal('balance', 15, 2).defaultTo(0);
      table.string('payment_method').defaultTo('cash');
      table.string('customer_phone');
      table.string('status').defaultTo('completed');
      table.text('notes');
      table.boolean('is_synced').defaultTo(true);
      table.timestamp('sale_date').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    })
    .createTable('sale_items', function(table) {
      table.increments('id').primary();
      table.integer('sale_id').references('id').inTable('sales').onDelete('CASCADE');
      table.integer('product_id').references('id').inTable('products');
      table.string('product_name').notNullable();
      table.decimal('unit_price', 15, 2).notNullable();
      table.integer('quantity').notNullable();
      table.decimal('total_price', 15, 2).notNullable();
    })
    .createTable('purchases', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').references('id').inTable('products');
      table.string('supplier_name');
      table.string('supplier_phone');
      table.integer('quantity').notNullable();
      table.decimal('unit_cost', 15, 2).notNullable();
      table.decimal('total_cost', 15, 2).notNullable();
      table.text('notes');
      table.boolean('is_synced').defaultTo(true);
      table.timestamp('purchase_date').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    })
    .createTable('expenses', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('category').notNullable();
      table.decimal('amount', 15, 2).notNullable();
      table.text('description');
      table.string('payment_method').defaultTo('cash');
      table.boolean('is_recurring').defaultTo(false);
      table.string('recurrence');
      table.boolean('is_synced').defaultTo(true);
      table.timestamp('expense_date').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    })
    .createTable('stock_adjustments', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').references('id').inTable('products');
      table.integer('previous_stock').notNullable();
      table.integer('new_stock').notNullable();
      table.integer('adjustment').notNullable();
      table.string('reason');
      table.text('notes');
      table.boolean('is_synced').defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable('pending_sync', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('table_name').notNullable();
      table.jsonb('record_data').notNullable();
      table.string('operation').notNullable(); // CREATE, UPDATE, DELETE
      table.string('sync_status').defaultTo('pending');
      table.text('error_message');
      table.integer('retry_count').defaultTo(0);
      table.timestamp('last_retry_at');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('pending_sync')
    .dropTableIfExists('stock_adjustments')
    .dropTableIfExists('expenses')
    .dropTableIfExists('purchases')
    .dropTableIfExists('sale_items')
    .dropTableIfExists('sales')
    .dropTableIfExists('products')
    .dropTableIfExists('users');
};
