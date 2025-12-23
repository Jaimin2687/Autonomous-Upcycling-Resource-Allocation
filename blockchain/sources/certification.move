module aura::certification {
    use aptos_std::simple_map;
    use aptos_std::simple_map::SimpleMap;
    use aptos_std::vector;
    use std::signer;

    use aura::roles;

    const ERR_ALREADY_INITIALIZED: u64 = 1;
    const ERR_NOT_AUTHORIZED: u64 = 2;
    const ERR_ALREADY_ACTIVE: u64 = 3;
    const ERR_NOT_FOUND: u64 = 4;
    const ERR_ALREADY_REVOKED: u64 = 5;

    struct CertificationRecord has drop, store {
        credential_id: u64,
        recycler: address,
        credential_type: vector<u8>,
        metadata_uri: vector<u8>,
        issuer: address,
        issued_at: u64,
        has_expiry: bool,
        expires_at: u64,
        revoked: bool,
        revoked_at: u64,
        revoke_reason: vector<u8>,
    }

    struct Registry has key {
        next_id: u64,
        records: SimpleMap<address, CertificationRecord>,
    }

    public entry fun init(admin: &signer) {
        assert!(!exists<Registry>(@aura), ERR_ALREADY_INITIALIZED);
        assert!(signer::address_of(admin) == roles::admin_address(), ERR_NOT_AUTHORIZED);
        move_to(admin, Registry {
            next_id: 1,
            records: simple_map::create<address, CertificationRecord>(),
        });
    }

    public entry fun issue(
        compliance: &signer,
        recycler: address,
        credential_type: vector<u8>,
        metadata_uri: vector<u8>,
        has_expiry: bool,
        expires_at: u64,
    ) acquires Registry {
        roles::assert_compliance(signer::address_of(compliance));
        let registry = borrow_global_mut<Registry>(@aura);
        if (simple_map::contains_key(&registry.records, &recycler)) {
            let existing = simple_map::borrow(&registry.records, &recycler);
            assert!(!existing.revoked, ERR_ALREADY_ACTIVE);
            if (existing.has_expiry) {
                assert!(existing.expires_at < now(), ERR_ALREADY_ACTIVE);
            }
        };
        let credential_id = registry.next_id;
        registry.next_id = credential_id + 1;
        let record = CertificationRecord {
            credential_id,
            recycler,
            credential_type: clone_bytes(&credential_type),
            metadata_uri: clone_bytes(&metadata_uri),
            issuer: signer::address_of(compliance),
            issued_at: now(),
            has_expiry,
            expires_at,
            revoked: false,
            revoked_at: 0,
            revoke_reason: vector::empty<u8>(),
        };
        simple_map::upsert(&mut registry.records, recycler, record);
    }

    public entry fun revoke(
        compliance: &signer,
        recycler: address,
        reason: vector<u8>,
    ) acquires Registry {
        roles::assert_compliance(signer::address_of(compliance));
        let registry = borrow_global_mut<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &recycler), ERR_NOT_FOUND);
        let record = simple_map::borrow_mut(&mut registry.records, &recycler);
        assert!(!record.revoked, ERR_ALREADY_REVOKED);
        record.revoked = true;
        record.revoked_at = now();
        record.revoke_reason = clone_bytes(&reason);
    }

    public fun is_active(recycler: address): bool acquires Registry {
        let registry = borrow_global<Registry>(@aura);
        if (!simple_map::contains_key(&registry.records, &recycler)) {
            return false
        };
        let record = simple_map::borrow(&registry.records, &recycler);
        if (record.revoked) {
            false
        } else if (record.has_expiry) {
            now() <= record.expires_at
        } else {
            true
        }
    }

    public fun credential_details(recycler: address): (u64, vector<u8>, bool) acquires Registry {
        let registry = borrow_global<Registry>(@aura);
        let record = simple_map::borrow(&registry.records, &recycler);
        (record.credential_id, clone_bytes(&record.credential_type), !record.revoked)
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
