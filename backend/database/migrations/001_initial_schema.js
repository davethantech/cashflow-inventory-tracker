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
      table.timestamps(true, true);
    })
    .createTable('products', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('sku').unique();
      table.decimal('cost_price', 15, 2).notNullable();
      table.decimal('selling_price', 15, 2).notNullable();
      table.integer('current_stock').defaultTo(0);
      table.integer('minimum_stock').defaultTo(5);
      table.string('category');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable('sales', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('transaction_id').unique();
      table.decimal('total_amount', 15, 2).notNullable();
      table.decimal('amount_paid', 15, 2).notNullable();
      table.string('payment_method').defaultTo('cash');
      table.string('customer_phone');
      table.timestamp('sale_date').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('sales')
    .dropTableIfExists('products')
    .dropTableIfExists('users');
};
