-- Remove the database pokemartDB if you already have one.
DROP DATABASE IF EXISTS pokemartDB;

-- Create the database now that you no longer have one.
CREATE DATABASE pokemartDB;

-- Now select this database so that we may start to to add tables.
USE pokemartDB;

-- Create first of two tables (shop_inventory_table) and (pokemon_bank_table);

-- shop_inventory_table
-- csv schema (item_name, item_description, item_type, item_cost, item_inventory_level)
CREATE TABLE shop_inventory_table (
    -- set the ID of items to a number schema.
    item_id INT NOT NULL AUTO_INCREMENT,
    item_name VARCHAR(64) NOT NULL,
    item_description VARCHAR(256),
    item_type VARCHAR(32),
    item_cost INT NOT NULL,
    item_inventory_level INT NOT NULL,
    -- assign the primary key to the item_id.
    PRIMARY KEY (item_id)
);

-- pokemon_bank_table 
-- schema (pokemon_number *int*, pokemon_name *string*, pokemon_type *string*, pokemon_level *int*, pokemon_is_shiny *bool*)
CREATE TABLE pokemon_bank_table (
    pokemon_id INT NOT NULL AUTO_INCREMENT,
    pokemon_number INT NOT NULL,
    pokemon_name VARCHAR(64) NOT NULL,
    pokemon_type VARCHAR(32) NOT NULL,
    pokemon_level INT NOT NULL,
    pokemon_is_shiny BOOL DEFAULT "false"
    -- other stats would go here if we were tracking Pokemon Stats
    -- hp
    -- str
    -- moves
    -- ability power
    -- experience

    -- assign the primary key to the item_id
    -- the item ID is NOT the pokemon number. That is determined by its original name.
    PRIMARY KEY (pokemon_id)
);