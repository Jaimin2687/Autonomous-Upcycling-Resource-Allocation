module aura::waste_lot {
    use aptos_std::simple_map;
    use aptos_std::simple_map::SimpleMap;
    use aptos_std::vector;
    use std::signer;

    use aura::roles;

    const ERR_NOT_INITIALIZED: u64 = 1;
    const ERR_UNKNOWN_LOT: u64 = 2;
    const ERR_INVALID_STATUS: u64 = 3;
    const ERR_NOT_HOLDER: u64 = 4;

    const STATUS_PENDING_VERIFICATION: u8 = 0;
    const STATUS_VERIFIED: u8 = 1;
    const STATUS_TOKENIZED: u8 = 2;
    const STATUS_RETIRED: u8 = 3;

    struct WasteLot has drop, store {
        id: u64,
        producer: address,
        holder: address,
        material_code: vector<u8>,
        external_ref: vector<u8>,
        quantity_kg: u64,
        metadata_uri: vector<u8>,
        status: u8,
        created_at: u64,
        updated_at: u64,
        verified: bool,
        verification_method: vector<u8>,
        verifier: address,
        token_symbol: vector<u8>,
        token_supply: u64,
        retired: bool,
        retired_reason: vector<u8>,
    }

    struct Registry has key {
        next_id: u64,
        lots: SimpleMap<u64, WasteLot>,
        owner_index: SimpleMap<address, vector<u64>>,
    }

    public entry fun init(admin: &signer) {
        assert!(!exists<Registry>(@aura), ERR_NOT_INITIALIZED);
    assert!(signer::address_of(admin) == roles::admin_address(), ERR_NOT_INITIALIZED);
        move_to(admin, Registry {
            next_id: 1,
            lots: simple_map::create<u64, WasteLot>(),
            owner_index: simple_map::create<address, vector<u64>>(),
        });
    }

    public entry fun register_lot(
        producer: &signer,
        external_ref: vector<u8>,
        material_code: vector<u8>,
        quantity_kg: u64,
        metadata_uri: vector<u8>,
    ) acquires Registry {
        roles::assert_producer(signer::address_of(producer));
        let registry = borrow_global_mut<Registry>(@aura);
        let lot_id = registry.next_id;
        registry.next_id = lot_id + 1;
        let timestamp = now();
        let lot = WasteLot {
            id: lot_id,
            producer: signer::address_of(producer),
            holder: signer::address_of(producer),
            material_code: clone_bytes(&material_code),
            external_ref: clone_bytes(&external_ref),
            quantity_kg,
            metadata_uri: clone_bytes(&metadata_uri),
            status: STATUS_PENDING_VERIFICATION,
            created_at: timestamp,
            updated_at: timestamp,
            verified: false,
            verification_method: vector::empty<u8>(),
            verifier: @0x0,
            token_symbol: vector::empty<u8>(),
            token_supply: 0,
            retired: false,
            retired_reason: vector::empty<u8>(),
        };
        simple_map::upsert(&mut registry.lots, lot_id, lot);
        add_owner_index(&mut registry.owner_index, signer::address_of(producer), lot_id);
    }

    public entry fun submit_verification(
        verifier: &signer,
        lot_id: u64,
        method: vector<u8>,
    ) acquires Registry {
        roles::assert_compliance(signer::address_of(verifier));
        let registry = borrow_global_mut<Registry>(@aura);
    assert!(simple_map::contains_key(&registry.lots, &lot_id), ERR_UNKNOWN_LOT);
    let lot = simple_map::borrow_mut(&mut registry.lots, &lot_id);
        assert!(lot.status == STATUS_PENDING_VERIFICATION, ERR_INVALID_STATUS);
        lot.verified = true;
        lot.verification_method = clone_bytes(&method);
        lot.verifier = signer::address_of(verifier);
        lot.status = STATUS_VERIFIED;
        lot.updated_at = now();
    }

    public entry fun tokenize_lot(
        marketplace: &signer,
        lot_id: u64,
        symbol: vector<u8>,
        supply: u64,
    ) acquires Registry {
        roles::assert_marketplace(signer::address_of(marketplace));
        let registry = borrow_global_mut<Registry>(@aura);
    assert!(simple_map::contains_key(&registry.lots, &lot_id), ERR_UNKNOWN_LOT);
    let lot = simple_map::borrow_mut(&mut registry.lots, &lot_id);
        assert!(lot.status == STATUS_VERIFIED, ERR_INVALID_STATUS);
        lot.token_symbol = clone_bytes(&symbol);
        lot.token_supply = supply;
        lot.status = STATUS_TOKENIZED;
        lot.updated_at = now();
    }

    public entry fun transfer_lot(
        holder: &signer,
        lot_id: u64,
        new_holder: address,
    ) acquires Registry {
        let holder_addr = signer::address_of(holder);
        let registry = borrow_global_mut<Registry>(@aura);
    assert!(simple_map::contains_key(&registry.lots, &lot_id), ERR_UNKNOWN_LOT);
    let lot = simple_map::borrow_mut(&mut registry.lots, &lot_id);
        assert!(lot.holder == holder_addr, ERR_NOT_HOLDER);
        remove_owner_index(&mut registry.owner_index, holder_addr, lot_id);
        add_owner_index(&mut registry.owner_index, new_holder, lot_id);
        lot.holder = new_holder;
        lot.updated_at = now();
    }

    public entry fun retire_lot(
        compliance: &signer,
        lot_id: u64,
        reason: vector<u8>,
    ) acquires Registry {
        roles::assert_compliance(signer::address_of(compliance));
        let registry = borrow_global_mut<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.lots, &lot_id), ERR_UNKNOWN_LOT);
        let lot = simple_map::borrow_mut(&mut registry.lots, &lot_id);
        assert!(lot.status == STATUS_VERIFIED || lot.status == STATUS_TOKENIZED, ERR_INVALID_STATUS);
        lot.status = STATUS_RETIRED;
        lot.retired = true;
        lot.retired_reason = clone_bytes(&reason);
        lot.updated_at = now();
    }

    public fun lot_status(lot_id: u64): u8 acquires Registry {
        let registry = borrow_global<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.lots, &lot_id), ERR_UNKNOWN_LOT);
        let lot = simple_map::borrow(&registry.lots, &lot_id);
        lot.status
    }

    public fun lots_for_owner(owner: address): vector<u64> acquires Registry {
        let registry = borrow_global<Registry>(@aura);
        if (simple_map::contains_key(&registry.owner_index, &owner)) {
            clone_u64_vector(simple_map::borrow(&registry.owner_index, &owner))
        } else {
            vector::empty<u64>()
        }
    }

    fun add_owner_index(owner_index: &mut SimpleMap<address, vector<u64>>, owner: address, lot_id: u64) {
        if (!simple_map::contains_key(owner_index, &owner)) {
            simple_map::upsert(owner_index, owner, vector::empty<u64>());
        };
        let lots = simple_map::borrow_mut(owner_index, &owner);
        vector::push_back(lots, lot_id);
    }

    fun remove_owner_index(owner_index: &mut SimpleMap<address, vector<u64>>, owner: address, lot_id: u64) {
        if (!simple_map::contains_key(owner_index, &owner)) {
            return
        };
        let lots = simple_map::borrow_mut(owner_index, &owner);
        let len = vector::length(lots);
    let i = 0;
        while (i < len) {
            if (*vector::borrow(lots, i) == lot_id) {
                vector::swap_remove(lots, i);
                break
            };
            i = i + 1;
        };
        if (vector::length(lots) == 0) {
            simple_map::remove(owner_index, &owner);
        }
    }

    fun clone_u64_vector(source: &vector<u64>): vector<u64> {
        let out = vector::empty<u64>();
        let len = vector::length(source);
    let i = 0;
        while (i < len) {
            vector::push_back(&mut out, *vector::borrow(source, i));
            i = i + 1;
        };
        out
    }

    fun clone_bytes(source: &vector<u8>): vector<u8> {
        let out = vector::empty<u8>();
        let len = vector::length(source);
    let i = 0;
        while (i < len) {
            vector::push_back(&mut out, *vector::borrow(source, i));
            i = i + 1;
        };
        out
    }

    fun now(): u64 {
        aptos_framework::timestamp::now_seconds()
    }
}
