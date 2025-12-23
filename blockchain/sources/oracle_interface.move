module aura::oracle_interface {
    use aptos_std::option;
    use aptos_std::option::Option;
    use aptos_std::simple_map;
    use aptos_std::simple_map::SimpleMap;
    use aptos_std::vector;
    use std::signer;

    use aura::roles;

    const ERR_ALREADY_INITIALIZED: u64 = 1;
    const ERR_NOT_AUTHORIZED: u64 = 2;
    struct FeedRecord has drop, store {
        name: vector<u8>,
        payload: vector<u8>,
        lot_id: Option<u64>,
        expires_at: Option<u64>,
        version: u64,
        updated_at: u64,
    }

    struct FeedView has copy, drop, store {
        name: vector<u8>,
        payload: vector<u8>,
        lot_id: Option<u64>,
        expires_at: Option<u64>,
        version: u64,
        updated_at: u64,
    }

    struct Registry has key {
        feeds: SimpleMap<u64, FeedRecord>,
    }

    public entry fun init(admin: &signer) {
        assert!(!exists<Registry>(@aura), ERR_ALREADY_INITIALIZED);
        assert!(signer::address_of(admin) == roles::admin_address(), ERR_NOT_AUTHORIZED);
        move_to(admin, Registry {
            feeds: simple_map::create<u64, FeedRecord>(),
        });
    }

    public entry fun publish(
        oracle: &signer,
        feed_id: u64,
        feed_name: vector<u8>,
        payload: vector<u8>,
        lot_id: Option<u64>,
        expires_at: Option<u64>,
    ) acquires Registry {
        roles::assert_oracle(signer::address_of(oracle));
        let registry = borrow_global_mut<Registry>(@aura);
        if (simple_map::contains_key(&registry.feeds, &feed_id)) {
            let record = simple_map::borrow_mut(&mut registry.feeds, &feed_id);
            record.payload = clone_bytes(&payload);
            record.lot_id = lot_id;
            record.expires_at = expires_at;
            record.version = record.version + 1;
            record.updated_at = now();
        } else {
            let record = FeedRecord {
                name: clone_bytes(&feed_name),
                payload: clone_bytes(&payload),
                lot_id,
                expires_at,
                version: 1,
                updated_at: now(),
            };
            simple_map::upsert(&mut registry.feeds, feed_id, record);
        };
    }

    public fun read(feed_id: u64): Option<FeedView> acquires Registry {
        if (!exists<Registry>(@aura)) {
            return option::none()
        };
        let registry = borrow_global<Registry>(@aura);
        if (!simple_map::contains_key(&registry.feeds, &feed_id)) {
            return option::none()
        };
        let record = simple_map::borrow(&registry.feeds, &feed_id);
        option::some(FeedView {
            name: clone_bytes(&record.name),
            payload: clone_bytes(&record.payload),
            lot_id: record.lot_id,
            expires_at: record.expires_at,
            version: record.version,
            updated_at: record.updated_at,
        })
    }

    public(friend) fun feed_version(feed_id: u64): Option<u64> acquires Registry {
        if (!exists<Registry>(@aura)) {
            return option::none()
        };
        let registry = borrow_global<Registry>(@aura);
        if (!simple_map::contains_key(&registry.feeds, &feed_id)) {
            return option::none()
        };
        option::some(simple_map::borrow(&registry.feeds, &feed_id).version)
    }

    fun now(): u64 {
        aptos_framework::timestamp::now_seconds()
    }

    fun clone_bytes(src: &vector<u8>): vector<u8> {
        let out: vector<u8> = vector::empty<u8>();
        let len = vector::length(src);
    let i = 0;
        while (i < len) {
            vector::push_back(&mut out, *vector::borrow(src, i));
            i = i + 1;
        };
        out
    }
}
